import { YStack, XStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { Paragraph } from "@tamagui/text";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { AuthRequiredView } from "./AuthRequiredView";
import { usePasteForm } from "../hooks/usePasteForm";
import { useCreatePaste } from "../hooks/useCreatePaste";
import { PageContainer } from "./PageContainer";
import { PasteForm } from "./PasteForm";

export function PasteEditor() {
  const { isAuthenticated } = useAuth();

  const { createPaste, loading, error } = useCreatePaste();

  const forms = usePasteForm();

  if (!isAuthenticated) {
    return (
      <YStack minHeight="100vh" backgroundColor="$background">
        <AuthRequiredView
          title="Welcome to KPaste!"
          subtitle="Please log in to create and manage your pastes."
          buttonText="Get Started"
          onLoginClick={() => {
            /* OAuth modal is handled globally */
          }}
        />
      </YStack>
    );
  }

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <PageContainer flex={1}>
        <YStack gap="$6">
          <YStack gap="$2">
            <Paragraph fontSize="$8" fontWeight="700">
              Create New Paste
            </Paragraph>
            <Paragraph fontSize="$4">
              Share your code or text with the world
            </Paragraph>
          </YStack>

          <PasteForm
            form={forms.createForm}
            loading={loading}
            onFormChange={forms.setCreateForm}
            onSubmit={() => createPaste(forms.createForm)}
            mode="create"
          />

          {error && (
            <Card theme="red" padding="$3">
              <XStack alignItems="center" gap="$2">
                <XMarkIcon width={20} height={20} />
                <Paragraph fontWeight="600">Error: {error}</Paragraph>
              </XStack>
            </Card>
          )}
        </YStack>
      </PageContainer>
    </YStack>
  );
}
