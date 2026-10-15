import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

//[id].tsx is a Dynamic Route
export default function Subscritptions() {
  //read the parameters that is send to this screen route
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Subscription</Text>
    </View>
  );
}
