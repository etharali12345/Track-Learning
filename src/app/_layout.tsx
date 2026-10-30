import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

function getPublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your Clerk publishable key to the app environment.",
    );
  }
  return key;
}

const publishableKey = getPublishableKey();

SplashScreen.preventAutoHideAsync();

function AppNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  if (!fontsLoaded || !isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscriptions/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  const fontsReady = fontsLoaded || !!fontError;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppNavigator fontsLoaded={fontsReady} />
    </ClerkProvider>
  );
}
