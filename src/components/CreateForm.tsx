import { YStack, Text, Button, Card, XStack } from "tamagui";
import {
  SparklesIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
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
    <Card padding="$4" gap="$4">
      <XStack alignItems="center" gap="$2">
        <SparklesIcon width={24} height={24} />
        <Text fontSize="$6" fontWeight="600" color="$color">
          Create New Paste
        </Text>
      </XStack>

      <YStack gap="$3">
        <PasteFormField
          label="Title (optional):"
          value={createForm.title}
          onChangeText={(text) => onFormChange({ ...createForm, title: text })}
          placeholder="Enter a title for your paste..."
        />

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="500">
            Content:
          </Text>
          <CodeEditor
            value={createForm.content}
            onChange={(content) => onFormChange({ ...createForm, content })}
            language={createForm.language}
          />
        </YStack>

        <YStack gap="$2">
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
          <XStack alignItems="center" gap="$2">
            <DocumentTextIcon width={16} height={16} />
            <Text fontSize="$3">
              Note: All pastes are public in AT Protocol repos
            </Text>
          </XStack>
        </Card>

        <Button
          onPress={() => onSubmit()}
          disabled={loading || !createForm.content.trim()}
          theme="green"
          size="$4"
          marginTop="$2"
        >
          <XStack alignItems="center" gap="$2">
            {loading ? (
              <ArrowPathIcon width={20} height={20} className="animate-spin" />
            ) : (
              <SparklesIcon width={20} height={20} />
            )}
            <Text>{loading ? "Creating..." : "Create Paste"}</Text>
          </XStack>
        </Button>
      </YStack>
    </Card>
  );
}
