import { YStack } from "@tamagui/stacks";
import { Paragraph, H1 } from "@tamagui/text";
import { HomeIcon } from "@heroicons/react/24/outline";
import { PageContainer, ActionButton } from "@kpaste/ui";
import { useNavigate } from "react-router";

type ErrorKind = "not-found" | "generic";

interface ErrorPageProps {
  kind?: ErrorKind;
}

function getTitle(kind: ErrorKind) {
  switch (kind) {
    case "not-found":
      return "Paste Not Found";
    case "generic":
    default:
      return "An Error Occurred";
  }
}

function getMessage(kind: ErrorKind) {
  switch (kind) {
    case "not-found":
      return "The paste you're looking for doesn't exist or couldn't be loaded.";
    case "generic":
    default:
      return "An unexpected error occurred. Please try refreshing the page or going back to home.";
  }
}

export function ErrorPage({ kind = "generic" }: ErrorPageProps) {
  const navigate = useNavigate();
  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <PageContainer flex={1} justifyContent="center" alignItems="center">
        <YStack gap="$4" alignItems="center" maxWidth={500} padding="$6">
          <H1 fontSize="$10" fontWeight="800" textAlign="center" color="$red10">
            {getTitle(kind)}
          </H1>
          <Paragraph fontSize="$5" textAlign="center" opacity={0.8}>
            {getMessage(kind)}
          </Paragraph>
          <ActionButton
            onPress={() => navigate("/")}
            colorVariant="blue"
            size="$4"
            marginTop="$3"
            icon={<HomeIcon width={20} height={20} color="var(--blueText)" />}
          >
            Back to KPaste
          </ActionButton>
        </YStack>
      </PageContainer>
    </YStack>
  );
}
