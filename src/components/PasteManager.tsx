import { useAuth } from "../auth/useAuth";
import { usePasteManager } from "../hooks/usePasteManager";
import { YStack, Text, Button, XStack, Card } from "tamagui";
import { PasteList } from "./PasteList";
import { CreateForm } from "./CreateForm";
import { EditForm } from "./EditForm";

export function PasteManager() {
  const { isAuthenticated } = useAuth();
  const pasteManager = usePasteManager();

  if (!isAuthenticated) {
    return (
      <Card padding="$6" alignItems="center">
        <Text fontSize="$7" fontWeight="600" color="$color" marginBottom="$3">
          📝 Paste Manager
        </Text>
        <Text fontSize="$4" textAlign="center">
          Please log in to manage your pastes!
        </Text>
      </Card>
    );
  }

  return (
    <YStack space="$6">
      <YStack space="$4">
        <Text fontSize="$8" fontWeight="700" color="$color">
          📚 Your Pastes
        </Text>

        <XStack space="$3" flexWrap="wrap">
          <Button
            onPress={() => pasteManager.loadPastes()}
            disabled={pasteManager.loading}
            size="$4"
            flex={1}
            minWidth={120}
          >
            {pasteManager.loading ? "🔄 Loading..." : "🔄 Refresh Pastes"}
          </Button>

          <Button
            onPress={() =>
              pasteManager.setShowCreateForm(!pasteManager.showCreateForm)
            }
            disabled={pasteManager.loading}
            theme="green"
            size="$4"
            flex={1}
            minWidth={120}
          >
            {pasteManager.showCreateForm ? "❌ Cancel" : "✨ Create New Paste"}
          </Button>
        </XStack>
      </YStack>

      {pasteManager.showCreateForm && (
        <CreateForm
          createForm={pasteManager.createForm}
          loading={pasteManager.loading}
          onFormChange={pasteManager.setCreateForm}
          onSubmit={pasteManager.createPaste}
        />
      )}

      {pasteManager.editForm && (
        <EditForm
          editForm={pasteManager.editForm}
          loading={pasteManager.loading}
          onFormChange={pasteManager.setEditForm}
          onSubmit={pasteManager.updatePaste}
          onCancel={pasteManager.cancelEdit}
        />
      )}

      {pasteManager.error && (
        <Card theme="red" padding="$3">
          <Text fontWeight="600">❌ Error: {pasteManager.error}</Text>
        </Card>
      )}

      <PasteList
        pastes={pasteManager.pastes}
        loading={pasteManager.loading}
        onDelete={pasteManager.deletePaste}
        onEdit={pasteManager.startEdit}
        onFetchContent={pasteManager.fetchBlobContent}
      />
    </YStack>
  );
}
