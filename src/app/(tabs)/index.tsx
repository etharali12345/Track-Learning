import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//use styled because SafeAreaView is not a nativewind component, so we need to wrap it in a styled component to use nativewind classes,
const StyledSafeAreaView = styled(SafeAreaView);

export default function index() {
  return (
    <StyledSafeAreaView className="flex-1 items-center bg-background">
      <Text className="text-5xl text-destructive font-sans-extrabold">
        Home
      </Text>
      <Link
        href="/(auth)/SignIn"
        className="bg-black text-white text-xl rounded mt-4 px-2 py-1 font-sans-bold"
      >
        Sign In
      </Link>
      <Link
        href="/Subscriptions"
        className="bg-black text-white text-xl rounded mt-4 px-2 py-1 font-sans-bold"
      >
        Subscription
      </Link>
    </StyledSafeAreaView>
  );
}
