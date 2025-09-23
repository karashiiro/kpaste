import { YStack, Text, Button, Card, XStack, ScrollView } from "tamagui";
import type { PasteListItem } from "../hooks/usePasteManager";

interface PasteListProps {
  pastes: PasteListItem[];
  loading: boolean;
  onDelete: (uri: string) => Promise<void>;
  onEdit: (paste: PasteListItem) => void;
  onFetchContent: (pasteUri: string) => Promise<void>;
}

export function PasteList({
  pastes,
  loading,
  onDelete,
  onEdit,
  onFetchContent,
}: PasteListProps) {
  console.log("🔄 PasteList render");

  if (pastes.length === 0 && !loading) {
    return (
      <Card padding="$6" marginTop="$4" alignItems="center">
        <Text fontSize="$5" textAlign="center">
          📝 No pastes found. Create your first paste!
        </Text>
      </Card>
    );
  }

  if (pastes.length === 0) {
    return null;
  }

  return (
    <YStack space="$5">
      {pastes.map((paste) => (
        <Card key={paste.uri} padding="$5" space="$4" bordered>
          <Text fontSize="$7" fontWeight="600" color="$color">
            {paste.value.title || "📝 Untitled Paste"}
          </Text>

          <YStack space="$3">
            <XStack alignItems="center" space="$3" flexWrap="wrap">
              <XStack alignItems="center" space="$2">
                <Text fontSize="$4" fontWeight="500">
                  Language:
                </Text>
                <Text fontSize="$4" fontWeight="600">
                  {paste.value.language || "text"}
                </Text>
              </XStack>

              <Text fontSize="$4">•</Text>

              <XStack alignItems="center" space="$2">
                <Text fontSize="$4" fontWeight="500">
                  Created:
                </Text>
                <Text fontSize="$4">
                  {new Date(paste.value.createdAt).toLocaleString()}
                </Text>
              </XStack>
            </XStack>

            <YStack space="$2">
              <Text fontSize="$4" fontWeight="500">
                URI:
              </Text>
              <Text
                fontSize="$3"
                fontFamily="$mono"
                padding="$3"
                borderRadius="$4"
              >
                {paste.uri}
              </Text>
            </YStack>
          </YStack>

          <YStack space="$2">
            <Text fontSize="$3" fontWeight="500">
              Content:
            </Text>
            {paste.content ? (
              <Card padding="$3" borderRadius="$4" bordered>
                <ScrollView maxHeight={200}>
                  <Text fontSize="$3" fontFamily="$mono">
                    {paste.content}
                  </Text>
                </ScrollView>
              </Card>
            ) : paste.contentLoading ? (
              <Text fontSize="$3">🔄 Loading content...</Text>
            ) : (
              <Button
                onPress={() => onFetchContent(paste.uri)}
                disabled={loading}
                size="$3"
                alignSelf="flex-start"
              >
                📄 Load Content
              </Button>
            )}
          </YStack>

          <XStack space="$3" marginTop="$4">
            <Button
              onPress={() => onEdit(paste)}
              disabled={loading}
              size="$4"
              flex={1}
            >
              ✏️ Edit
            </Button>

            <Button
              onPress={() => onDelete(paste.uri)}
              disabled={loading}
              theme="red"
              size="$4"
              flex={1}
            >
              {loading ? "🔄 Deleting..." : "🗑️ Delete"}
            </Button>
          </XStack>
        </Card>
      ))}
    </YStack>
  );
}
