import { YStack, Text, Button, Card, XStack } from "tamagui";
import type { EditPasteForm } from "../hooks/usePasteForm";
import { PasteFormField } from "./PasteFormField";
import { CodeEditor } from "./CodeEditor";
import { LanguageSelect } from "./LanguageSelect";

interface EditFormProps {
  editForm: EditPasteForm;
  loading: boolean;
  onFormChange: (form: EditPasteForm) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function EditForm({
  editForm,
  loading,
  onFormChange,
  onSubmit,
  onCancel,
}: EditFormProps) {
  return (
    <Card padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="600" color="$color">
        ✏️ Edit Paste
      </Text>

      <YStack space="$3">
        <PasteFormField
          label="Title (optional):"
          value={editForm.title}
          onChangeText={(text) => onFormChange({ ...editForm, title: text })}
          placeholder="Enter a title for your paste..."
        />

        <YStack space="$2">
          <Text fontSize="$4" fontWeight="500">
            Content:
          </Text>
          <CodeEditor
            value={editForm.content}
            onChange={(content) => onFormChange({ ...editForm, content })}
            language={editForm.language}
          />
        </YStack>

        <YStack space="$2">
          <Text fontSize="$4" fontWeight="500">
            Language:
          </Text>
          <LanguageSelect
            value={editForm.language}
            onValueChange={(value) =>
              onFormChange({ ...editForm, language: value })
            }
          />
        </YStack>

        <Card theme="blue" padding="$3">
          <Text fontSize="$3">
            📝 Note: All pastes are public in AT Protocol repos
          </Text>
        </Card>

        <XStack space="$3" marginTop="$2">
          <Button
            onPress={() => onSubmit()}
            disabled={loading || !editForm.content.trim()}
            theme="green"
            size="$4"
            flex={1}
          >
            {loading ? "🔄 Updating..." : "✅ Update Paste"}
          </Button>
          <Button
            onPress={() => onCancel()}
            disabled={loading}
            size="$4"
            flex={1}
          >
            Cancel
          </Button>
        </XStack>
      </YStack>
    </Card>
  );
}
