import { YStack } from "@tamagui/stacks";
import { View } from "@tamagui/core";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";

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
      <YStack gap="$4" alignItems="center" maxWidth={400}>
        <Paragraph fontSize="$8" fontWeight="700" textAlign="center">
          {title}
        </Paragraph>
        <Paragraph fontSize="$5" textAlign="center">
          {subtitle}
        </Paragraph>
        <Button onPress={onLoginClick} theme="green" size="$5" marginTop="$2">
          {buttonText}
        </Button>
      </YStack>
    </View>
  );
}
