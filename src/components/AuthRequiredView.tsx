import { YStack, Text, Button, View } from "tamagui";

export interface AuthRequiredViewProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  onLoginClick: () => void;
}

export function AuthRequiredView({
  title,
  subtitle,
  buttonText = "🚀 Get Started",
  onLoginClick,
}: AuthRequiredViewProps) {
  return (
    <View flex={1} justifyContent="center" alignItems="center" padding="$6">
      <YStack space="$4" alignItems="center" maxWidth={400}>
        <Text fontSize="$8" fontWeight="700" textAlign="center">
          {title}
        </Text>
        <Text fontSize="$5" textAlign="center">
          {subtitle}
        </Text>
        <Button onPress={onLoginClick} theme="green" size="$5" marginTop="$2">
          {buttonText}
        </Button>
      </YStack>
    </View>
  );
}
