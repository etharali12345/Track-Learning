import { Stack } from "expo-router";

//expo rotuter, turn each file into route
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
