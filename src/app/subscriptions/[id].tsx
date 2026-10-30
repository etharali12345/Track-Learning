import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

//[id].tsx is a Dynamic Route
export default function SubscriptionDetails() {
  //read the parameters that is send to this screen route
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Subscription {id ?? "details"}</Text>
    </View>
  );
}
