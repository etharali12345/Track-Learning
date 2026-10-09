import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//use styled because SafeAreaView is not a nativewind component, so we need to wrap it in a styled component to use nativewind classes,
const StyledSafeAreaView = styled(SafeAreaView);

export default function index() {
  return (
    <StyledSafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind! index
      </Text>
      <Link
        href="/(auth)/SignIn"
        className="bg-black text-white text-xl rounded mt-4 px-2 py-1"
      >
        Sign In
      </Link>
      <Link
        href="/Subscriptions"
        className="bg-black text-white text-xl rounded mt-4 px-2 py-1"
      >
        Subscription
      </Link>
    </StyledSafeAreaView>
  );
}
