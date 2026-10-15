import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledSafeAreaView = styled(SafeAreaView);

export default function Insights() {
  return (
    <StyledSafeAreaView className="flex-1 bg-accent items-center justify-center">
      <Text>Insights</Text>
    </StyledSafeAreaView>
  );
}
