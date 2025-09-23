import { YStack, Text, Button, Card } from "tamagui";
import type { CreatePasteForm } from "../hooks/usePasteForm";
import { PasteFormField } from "./PasteFormField";
import { CodeEditor } from "./CodeEditor";
import { LanguageSelect } from "./LanguageSelect";

interface CreateFormProps {
  createForm: CreatePasteForm;
  loading: boolean;
  onFormChange: (form: CreatePasteForm) => void;
  onSubmit: () => Promise<void>;
}

export function CreateForm({
  createForm,
  loading,
  onFormChange,
  onSubmit,
}: CreateFormProps) {
  return (
    <Card padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="600" color="$color">
        ✨ Create New Paste
      </Text>

      <YStack space="$3">
        <PasteFormField
          label="Title (optional):"
          value={createForm.title}
          onChangeText={(text) => onFormChange({ ...createForm, title: text })}
          placeholder="Enter a title for your paste..."
        />

        <YStack space="$2">
          <Text fontSize="$4" fontWeight="500">
            Content:
          </Text>
          <CodeEditor
            value={createForm.content}
            onChange={(content) => onFormChange({ ...createForm, content })}
            language={createForm.language}
          />
        </YStack>

        <YStack space="$2">
          <Text fontSize="$4" fontWeight="500">
            Language:
          </Text>
          <LanguageSelect
            value={createForm.language}
            onValueChange={(value) =>
              onFormChange({ ...createForm, language: value })
            }
          />
        </YStack>

        <Card theme="blue" padding="$3">
          <Text fontSize="$3">
            📝 Note: All pastes are public in AT Protocol repos
          </Text>
        </Card>

        <Button
          onPress={() => onSubmit()}
          disabled={loading || !createForm.content.trim()}
          theme="green"
          size="$4"
          marginTop="$2"
        >
          {loading ? "🔄 Creating..." : "✨ Create Paste"}
        </Button>
      </YStack>
    </Card>
  );
}
