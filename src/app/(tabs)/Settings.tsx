import { useClerk } from "@clerk/expo";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledSafeAreaView = styled(SafeAreaView);

export default function Settings() {
  const { signOut } = useClerk();
  const posthog = usePostHog();

  const handleSignOut = async () => {
    posthog.capture("user_signed_out");
    await signOut();
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-background p-5 justify-center align-center">
      <View>
        <Text className="text-2xl font-bold text-primary">Settings In</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => void handleSignOut()}
        className="rounded-full bg-primary px-5 py-3.5 m-5"
      >
        <Text className="text-center text-sm font-semibold text-white">
          Sign out
        </Text>
      </Pressable>
    </StyledSafeAreaView>
  );
}
