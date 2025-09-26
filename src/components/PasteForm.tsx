import { YStack, XStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { Paragraph } from "@tamagui/text";
import {
  SparklesIcon,
  PencilIcon,
  DocumentTextIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import type { CreatePasteForm, EditPasteForm } from "../hooks/usePasteForm";
import { PasteFormField } from "./PasteFormField";
import { CodeEditor } from "./CodeEditor";
import { LanguageSelect } from "./LanguageSelect";
import { LoadingButton } from "./LoadingButton";

type PasteFormData = CreatePasteForm | EditPasteForm;

interface PasteFormProps {
  form: PasteFormData;
  loading: boolean;
  onFormChange: (form: PasteFormData) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  mode: "create" | "edit";
}

export function PasteForm({
  form,
  loading,
  onFormChange,
  onSubmit,
  onCancel,
  mode,
}: PasteFormProps) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Paste" : "Create New Paste";
  const submitText = isEdit ? "Update Paste" : "Create Paste";
  const loadingText = isEdit ? "Updating..." : "Creating...";
  const icon = isEdit ? (
    <PencilIcon width={24} height={24} />
  ) : (
    <SparklesIcon width={20} height={20} />
  );
  const submitIcon = isEdit ? (
    <CheckIcon width={20} height={20} />
  ) : (
    <SparklesIcon width={20} height={20} />
  );

  return (
    <Card padding="$4" gap="$4">
      {isEdit ? (
        <XStack alignItems="center" gap="$2">
          {icon}
          <Paragraph fontSize="$6" fontWeight="600" color="$color">
            {title}
          </Paragraph>
        </XStack>
      ) : (
        <Paragraph fontSize="$6" fontWeight="600" color="$color">
          {title}
        </Paragraph>
      )}

      <YStack gap="$3">
        <PasteFormField
          label="Title (optional):"
          value={form.title}
          onChangeText={(text) => onFormChange({ ...form, title: text })}
          placeholder="Enter a title for your paste..."
        />

        <YStack gap="$2">
          <Paragraph fontSize="$4" fontWeight="500">
            Content:
          </Paragraph>
          <CodeEditor
            value={form.content}
            onChange={(content) => onFormChange({ ...form, content })}
            language={form.language}
          />
        </YStack>

        <YStack gap="$2">
          <Paragraph fontSize="$4" fontWeight="500">
            Language:
          </Paragraph>
          <LanguageSelect
            value={form.language}
            onValueChange={(value) =>
              onFormChange({ ...form, language: value })
            }
          />
        </YStack>

        <Card theme="blue" padding="$3">
          <XStack alignItems="center" gap="$2">
            <DocumentTextIcon width={16} height={16} />
            <Paragraph fontSize="$3">
              Note: All pastes are publicly accessible
            </Paragraph>
          </XStack>
        </Card>

        {isEdit ? (
          <XStack gap="$3" marginTop="$2">
            <LoadingButton
              onPress={onSubmit}
              disabled={loading || !form.content.trim()}
              loading={loading}
              loadingText={loadingText}
              icon={submitIcon}
              theme="green"
              size="$4"
              flex={1}
            >
              {submitText}
            </LoadingButton>
            <LoadingButton
              onPress={onCancel}
              disabled={loading}
              size="$4"
              flex={1}
            >
              Cancel
            </LoadingButton>
          </XStack>
        ) : (
          <LoadingButton
            onPress={onSubmit}
            disabled={loading || !form.content.trim()}
            loading={loading}
            loadingText={loadingText}
            icon={submitIcon}
            theme="green"
            size="$4"
            marginTop="$2"
          >
            {submitText}
          </LoadingButton>
        )}
      </YStack>
    </Card>
  );
}
