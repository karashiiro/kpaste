import { useState } from "react";
import { YStack, View, Text, Card, XStack } from "tamagui";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { CreateForm } from "./CreateForm";
import { AuthModal } from "./AuthModal";
import { Header } from "./Header";
import { AuthRequiredView } from "./AuthRequiredView";
import { usePasteForm } from "../hooks/usePasteForm";
import { useCreatePaste } from "../hooks/useCreatePaste";

export function PasteEditor() {
  const { isAuthenticated, session } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { createPaste, loading, error } = useCreatePaste();

  const forms = usePasteForm();

  if (!isAuthenticated) {
    return (
      <YStack minHeight="100vh" backgroundColor="$background">
        <Header
          variant="unauthenticated"
          onLoginClick={() => setIsAuthModalOpen(true)}
          showCreateLink={false}
        />

        <AuthRequiredView
          title="Welcome to KPaste!"
          subtitle="Please log in to create and manage your pastes on the AT Protocol."
          buttonText="Get Started"
          onLoginClick={() => setIsAuthModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </YStack>
    );
  }

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <Header
        variant="account"
        userHandle={session?.handle}
        onAccountClick={() => setIsAuthModalOpen(true)}
        showCreateLink={false}
      />

      {/* Main Editor */}
      <View
        padding="$6"
        maxWidth={1200}
        marginHorizontal="auto"
        width="100%"
        flex={1}
      >
        <YStack space="$6">
          <YStack space="$2">
            <XStack alignItems="center" space="$2">
              <SparklesIcon width={32} height={32} />
              <Text fontSize="$8" fontWeight="700">
                Create New Paste
              </Text>
            </XStack>
            <Text fontSize="$4">
              Share your code or text on the AT Protocol
            </Text>
          </YStack>

          <CreateForm
            createForm={forms.createForm}
            loading={loading}
            onFormChange={forms.setCreateForm}
            onSubmit={() => createPaste(forms.createForm)}
          />

          {error && (
            <Card theme="red" padding="$3">
              <XStack alignItems="center" space="$2">
                <XMarkIcon width={20} height={20} />
                <Text fontWeight="600">Error: {error}</Text>
              </XStack>
            </Card>
          )}
        </YStack>
      </View>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </YStack>
  );
}
