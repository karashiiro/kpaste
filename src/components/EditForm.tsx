import { YStack, Text, Button, Card, XStack } from "tamagui";
import {
  PencilIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
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
    <Card padding="$4" gap="$4">
      <XStack alignItems="center" gap="$2">
        <PencilIcon width={24} height={24} />
        <Text fontSize="$6" fontWeight="600" color="$color">
          Edit Paste
        </Text>
      </XStack>

      <YStack gap="$3">
        <PasteFormField
          label="Title (optional):"
          value={editForm.title}
          onChangeText={(text) => onFormChange({ ...editForm, title: text })}
          placeholder="Enter a title for your paste..."
        />

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="500">
            Content:
          </Text>
          <CodeEditor
            value={editForm.content}
            onChange={(content) => onFormChange({ ...editForm, content })}
            language={editForm.language}
          />
        </YStack>

        <YStack gap="$2">
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
          <XStack alignItems="center" gap="$2">
            <DocumentTextIcon width={16} height={16} />
            <Text fontSize="$3">Note: All pastes are publicly accessible</Text>
          </XStack>
        </Card>

        <XStack gap="$3" marginTop="$2">
          <Button
            onPress={() => onSubmit()}
            disabled={loading || !editForm.content.trim()}
            theme="green"
            size="$4"
            flex={1}
          >
            <XStack alignItems="center" gap="$2">
              {loading ? (
                <ArrowPathIcon
                  width={20}
                  height={20}
                  className="animate-spin"
                />
              ) : (
                <CheckIcon width={20} height={20} />
              )}
              <Text>{loading ? "Updating..." : "Update Paste"}</Text>
            </XStack>
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
