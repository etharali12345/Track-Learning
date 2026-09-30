import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
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
        href="/Subscription"
        className="bg-black text-white text-xl rounded mt-4 px-2 py-1"
      >
        Subscription
      </Link>
    </View>
  );
}
