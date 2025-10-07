import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { InsetCard } from "../ui/InsetCard";
import {
  SparklesIcon,
  PencilIcon,
  DocumentTextIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import type { CreatePasteForm, EditPasteForm } from "../../hooks/usePasteForm";
import { PasteFormField } from "./PasteFormField";
import { CodeEditor } from "../ui/CodeEditor";
import { LanguageSelect } from "../ui/LanguageSelect";
import { LoadingButton } from "../ui/LoadingButton";

type PasteFormData = CreatePasteForm | EditPasteForm;

interface PasteFormProps {
  form: PasteFormData;
  loading: boolean;
  onFormChange: (form: PasteFormData) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  mode: "create" | "edit";
  submitButtonText?: string;
  codeEditorStyle?: React.CSSProperties;
}

export function PasteForm({
  form,
  loading,
  onFormChange,
  onSubmit,
  onCancel,
  mode,
  submitButtonText,
  codeEditorStyle = {},
}: PasteFormProps) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Paste" : "Create New Paste";
  const submitText =
    submitButtonText || (isEdit ? "Update Paste" : "Create Paste");
  const loadingText = isEdit ? "Updating..." : "Creating...";
  const icon = isEdit ? (
    <PencilIcon width={24} height={24} />
  ) : (
    <SparklesIcon width={20} height={20} />
  );
  const submitIcon = isEdit ? CheckIcon : SparklesIcon;

  return (
    <InsetCard gap="$4" insetPadding="8px">
      {isEdit ? (
        <XStack alignItems="center" gap="$2">
          {icon}
          <Paragraph fontSize="$6" fontWeight="600" color="white">
            {title}
          </Paragraph>
        </XStack>
      ) : (
        <Paragraph fontSize="$6" fontWeight="600" color="white">
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
            style={codeEditorStyle}
          />
        </YStack>

        <YStack gap="$2">
          <Paragraph fontSize="$4" fontWeight="500">
            Syntax Language:
          </Paragraph>
          <LanguageSelect
            value={form.language}
            onValueChange={(value) =>
              onFormChange({ ...form, language: value })
            }
          />
        </YStack>

        <InsetCard
          backgroundColor="$insetCardPublicBackground"
          insetBorderColor="var(--redText)"
          padding="$2"
        >
          <XStack alignItems="center" gap="$2">
            <DocumentTextIcon width={16} height={16} color="var(--redText)" />
            <Paragraph fontSize="$3" color="$redText">
              Note: All pastes are publicly accessible
            </Paragraph>
          </XStack>
        </InsetCard>

        {isEdit ? (
          <XStack gap="$3" marginTop="$2">
            <LoadingButton
              onPress={onSubmit}
              disabled={loading || !form.content.trim()}
              loading={loading}
              loadingText={loadingText}
              iconComponent={submitIcon}
              colorVariant="green"
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
            iconComponent={submitIcon}
            colorVariant="green"
            size="$4"
            marginTop="$2"
          >
            {submitText}
          </LoadingButton>
        )}
      </YStack>
    </InsetCard>
  );
}
