import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledSafeAreaView = styled(SafeAreaView);

export default function Settings() {
  return (
    <StyledSafeAreaView>
      <Text>Settings</Text>
    </StyledSafeAreaView>
  );
}
