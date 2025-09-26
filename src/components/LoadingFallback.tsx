import { YStack } from "@tamagui/stacks";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function LoadingFallback() {
  return (
    <YStack
      flex={1}
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
    >
      <ArrowPathIcon
        width={32}
        height={32}
        color="#999"
        className="animate-spin"
      />
    </YStack>
  );
}
