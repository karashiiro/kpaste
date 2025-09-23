import { useCallback } from "react";
import Editor from "react-simple-code-editor";
import {
  YStack,
  Text,
  Button,
  Input,
  Label,
  Select,
  Card,
  XStack,
  useTheme,
} from "tamagui";
import type { EditPasteForm } from "../hooks/usePasteForm";
import { safeHighlight } from "../prismUtils";

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
  const theme = useTheme();

  // Memoized highlight function
  const highlightCode = useCallback(
    (code: string) => safeHighlight(code, editForm.language),
    [editForm.language],
  );

  // Theme-aware editor styles
  const editorStyle = {
    fontFamily: '"Courier New", "Monaco", "Menlo", monospace',
    fontSize: 14,
    lineHeight: 1.4,
    minHeight: "200px",
    backgroundColor: theme.background?.get(),
    color: theme.color?.get(),
  };

  return (
    <Card padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="600" color="$color">
        ✏️ Edit Paste
      </Text>

      <YStack space="$3">
        <YStack space="$2">
          <Label fontSize="$4" fontWeight="500">
            Title (optional):
          </Label>
          <Input
            value={editForm.title}
            onChangeText={(text) => onFormChange({ ...editForm, title: text })}
            placeholder="Enter a title for your paste..."
            size="$4"
          />
        </YStack>

        <YStack space="$2">
          <Label fontSize="$4" fontWeight="500">
            Content:
          </Label>
          <Card padding="$0" bordered>
            <Editor
              value={editForm.content}
              onValueChange={(content) =>
                onFormChange({ ...editForm, content })
              }
              highlight={highlightCode}
              padding={12}
              placeholder="Paste your code or text here..."
              style={editorStyle}
            />
          </Card>
        </YStack>

        <YStack space="$2">
          <Label fontSize="$4" fontWeight="500">
            Language:
          </Label>
          <Select
            value={editForm.language}
            onValueChange={(value) =>
              onFormChange({ ...editForm, language: value })
            }
            size="$4"
          >
            <Select.Trigger iconAfter={<Text>▼</Text>}>
              <Select.Value placeholder="Select language..." />
            </Select.Trigger>

            <Select.Content zIndex={200000}>
              <Select.ScrollUpButton
                alignItems="center"
                justifyContent="center"
                position="relative"
                width="100%"
                height="$3"
              >
                <Text>▲</Text>
              </Select.ScrollUpButton>

              <Select.Viewport minHeight={200}>
                <Select.Group>
                  <Select.Item index={0} value="text">
                    <Select.ItemText>Plain Text</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={1} value="javascript">
                    <Select.ItemText>JavaScript</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={2} value="typescript">
                    <Select.ItemText>TypeScript</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={3} value="python">
                    <Select.ItemText>Python</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={4} value="java">
                    <Select.ItemText>Java</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={5} value="cpp">
                    <Select.ItemText>C++</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={6} value="rust">
                    <Select.ItemText>Rust</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={7} value="go">
                    <Select.ItemText>Go</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={8} value="html">
                    <Select.ItemText>HTML</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={9} value="css">
                    <Select.ItemText>CSS</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={10} value="json">
                    <Select.ItemText>JSON</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={11} value="markdown">
                    <Select.ItemText>Markdown</Select.ItemText>
                  </Select.Item>
                </Select.Group>
              </Select.Viewport>

              <Select.ScrollDownButton
                alignItems="center"
                justifyContent="center"
                position="relative"
                width="100%"
                height="$3"
              >
                <Text>▼</Text>
              </Select.ScrollDownButton>
            </Select.Content>
          </Select>
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
