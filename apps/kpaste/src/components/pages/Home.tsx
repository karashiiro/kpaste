import { useEffect } from "react";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetCard } from "../ui/InsetCard";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { usePasteForm } from "../../hooks/usePasteForm";
import { useCreatePaste } from "../../hooks/useCreatePaste";
import { PageContainer } from "../layout/PageContainer";
import { PasteForm } from "../paste/PasteForm";
import type { CreatePasteForm } from "../../hooks/usePasteForm";
import { useAuthModal } from "../../hooks/useAuthContext";

export function Home() {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  const { createPaste, loading, error } = useCreatePaste();

  const forms = usePasteForm();

  // Restore form state from localStorage when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      const savedDraft = localStorage.getItem("kpaste-draft");
      if (savedDraft) {
        try {
          const parsedDraft: CreatePasteForm = JSON.parse(savedDraft);
          // Only restore if there's actual content
          if (parsedDraft.content?.trim()) {
            forms.setCreateForm(parsedDraft);
          }
          // Clean up the saved draft
          localStorage.removeItem("kpaste-draft");
        } catch (error: unknown) {
          console.error("Failed to parse saved draft:", error);

          // Invalid JSON, just remove it
          localStorage.removeItem("kpaste-draft");
        }
      }
    }
  }, [isAuthenticated, forms.setCreateForm, forms]);

  const handleCreateOrLogin = async () => {
    if (!isAuthenticated) {
      // Save form state to localStorage before opening login modal
      localStorage.setItem("kpaste-draft", JSON.stringify(forms.createForm));
      openAuthModal();
    } else {
      createPaste(forms.createForm);
    }
  };

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
            onSubmit={handleCreateOrLogin}
            mode="create"
            submitButtonText={
              isAuthenticated ? "Create Paste" : "Log in to create paste"
            }
          />

          {error && (
            <InsetCard theme="red" padding="$3">
              <XStack alignItems="center" gap="$2">
                <XMarkIcon width={20} height={20} />
                <Paragraph fontWeight="600">Error: {error}</Paragraph>
              </XStack>
            </InsetCard>
          )}
        </YStack>
      </PageContainer>
    </YStack>
  );
}
