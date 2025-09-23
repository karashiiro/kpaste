import { useState } from "react";
import { YStack, View, XStack, Text, Button, Card } from "tamagui";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { CreateForm } from "./CreateForm";
import { AuthModal } from "./AuthModal";
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
        {/* Compact Header */}
        <View
          background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          paddingVertical="$4"
          paddingHorizontal="$6"
        >
          <XStack
            maxWidth={1200}
            marginHorizontal="auto"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Text fontSize="$7" fontWeight="700" color="white">
              📝 KPaste
            </Text>

            <Button
              onPress={() => setIsAuthModalOpen(true)}
              backgroundColor="rgba(255, 255, 255, 0.2)"
              borderColor="rgba(255, 255, 255, 0.3)"
              borderWidth={2}
              color="white"
              fontWeight="600"
              size="$4"
              borderRadius="$10"
            >
              🚀 Login
            </Button>
          </XStack>
        </View>

        {/* Login Required Message */}
        <View flex={1} justifyContent="center" alignItems="center" padding="$6">
          <YStack space="$4" alignItems="center" maxWidth={400}>
            <Text fontSize="$8" fontWeight="700" textAlign="center">
              Welcome to KPaste! 📝
            </Text>
            <Text fontSize="$5" textAlign="center">
              Please log in to create and manage your pastes on the AT Protocol.
            </Text>
            <Button
              onPress={() => setIsAuthModalOpen(true)}
              theme="green"
              size="$5"
              marginTop="$2"
            >
              🚀 Get Started
            </Button>
          </YStack>
        </View>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </YStack>
    );
  }

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      {/* Compact Header */}
      <View
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        paddingVertical="$4"
        paddingHorizontal="$6"
      >
        <XStack
          maxWidth={1200}
          marginHorizontal="auto"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Link
            to={`/pastes/${session?.handle}`}
            style={{ color: "white", textDecoration: "underline" }}
          >
            @{session?.handle}
          </Link>

          <Text fontSize="$7" fontWeight="700" color="white">
            📝 KPaste
          </Text>

          <Button
            onPress={() => setIsAuthModalOpen(true)}
            backgroundColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(255, 255, 255, 0.2)"
            borderWidth={1}
            color="white"
            size="$4"
            borderRadius="$10"
          >
            👋 Account
          </Button>
        </XStack>
      </View>

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
            <Text fontSize="$8" fontWeight="700">
              ✨ Create New Paste
            </Text>
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
              <Text fontWeight="600">❌ Error: {error}</Text>
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
