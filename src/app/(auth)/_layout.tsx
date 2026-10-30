import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "SignIn",
};

export default function _layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
