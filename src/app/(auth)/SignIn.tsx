import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignIn() {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/SignUp">Create New account</Link>
    </View>
  );
}
