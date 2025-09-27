import { YStack } from "@tamagui/stacks";
import { Button } from "@tamagui/button";
import { Paragraph, H1 } from "@tamagui/text";
import { HomeIcon } from "@heroicons/react/24/outline";
import { PageContainer } from "./PageContainer";

export function ErrorPage() {
  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <PageContainer flex={1} justifyContent="center" alignItems="center">
        <YStack gap="$4" alignItems="center" maxWidth={500} padding="$6">
          <H1 fontSize="$10" fontWeight="800" textAlign="center" color="$red10">
            Paste Not Found
          </H1>
          <Paragraph fontSize="$5" textAlign="center" opacity={0.8}>
            The paste you're looking for doesn't exist or couldn't be loaded.
          </Paragraph>
          <Button
            onPress={() => (window.location.href = "/")}
            theme="blue"
            size="$5"
            marginTop="$3"
            icon={<HomeIcon width={20} height={20} />}
          >
            Back to KPaste
          </Button>
        </YStack>
      </PageContainer>
    </YStack>
  );
}
