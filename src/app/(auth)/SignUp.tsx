import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignUp() {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href="/SignIn">Already have an account</Link>
    </View>
  );
}
