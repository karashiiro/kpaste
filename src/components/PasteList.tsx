import { YStack, Text, Button, Card, XStack, ScrollView } from "tamagui";
import { Link } from "react-router";
import type { PasteListItem } from "../types";
import { useDeletePaste } from "../hooks/useDeletePaste";
import { useCallback } from "react";
import { usePasteForm } from "../hooks/usePasteForm";
import { useUpdatePaste } from "../hooks/useUpdatePaste";
import { EditForm } from "./EditForm";
import { safeHighlight } from "../prismUtils";

// Helper function to extract handle and rkey from AT URI
function parseAtUri(uri: string): { handle: string; rkey: string } | null {
  // Example URI: at://did:plc:abc123/moe.karashiiro.kpaste.paste/xyz789
  const match = uri.match(/^at:\/\/([^/]+)\/[^/]+\/([^/]+)$/);
  if (!match) return null;

  const did = match[1];
  const rkey = match[2];

  return { handle: did, rkey };
}

interface PasteListProps {
  pastes: PasteListItem[];
  userHandle?: string;
}

export function PasteList({ pastes, userHandle }: PasteListProps) {
  const {
    deletePaste,
    loading: deleteLoading,
    error: deleteError,
  } = useDeletePaste();
  const {
    updatePaste,
    loading: updateLoading,
    error: updateError,
  } = useUpdatePaste();

  const forms = usePasteForm();
  const startEdit = useCallback(
    (paste: PasteListItem) => {
      forms.setEditForm({
        uri: paste.uri,
        originalRecord: paste.value,
        title: paste.value.title || "",
        content: paste.content,
        language: paste.value.language || "text",
      });
    },
    [forms],
  );

  if (pastes.length === 0) {
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
                  <pre
                    style={{
                      fontFamily: '"Courier New", "Monaco", "Menlo", monospace',
                      fontSize: 13,
                      lineHeight: 1.4,
                      margin: 0,
                      padding: 0,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: safeHighlight(
                        paste.content,
                        paste.value.language || "text",
                      ),
                    }}
                  />
                </ScrollView>
              </Card>
            ) : paste.contentLoading ? (
              <Text fontSize="$3">🔄 Loading content...</Text>
            ) : (
              <Text fontSize="$3">⏳ Content will load automatically...</Text>
            )}
          </YStack>

          <XStack space="$3" marginTop="$4">
            {userHandle &&
              (() => {
                // Extract rkey from URI for view link
                const uriParts = parseAtUri(paste.uri);
                const rkey = uriParts?.rkey || paste.uri.split("/").pop();

                return (
                  <Link
                    to={`/p/${userHandle}/${rkey}`}
                    style={{ flex: 1, textDecoration: "none" }}
                  >
                    <Button size="$4" width="100%">
                      👁️ View
                    </Button>
                  </Link>
                );
              })()}

            <Button onPress={() => startEdit(paste)} size="$4" flex={1}>
              ✏️ Edit
            </Button>

            <Button
              onPress={() => deletePaste(paste.uri)}
              disabled={deleteLoading}
              theme="red"
              size="$4"
              flex={1}
            >
              {deleteLoading ? "🔄 Deleting..." : "🗑️ Delete"}
            </Button>
          </XStack>

          {forms.editForm && (
            <EditForm
              editForm={forms.editForm}
              loading={updateLoading}
              onFormChange={forms.setEditForm}
              onSubmit={() => updatePaste(forms.editForm!)}
              onCancel={forms.cancelEdit}
            />
          )}

          {deleteError && (
            <Card theme="red" padding="$3">
              <Text fontWeight="600">❌ Error: {deleteError}</Text>
            </Card>
          )}

          {updateError && (
            <Card theme="red" padding="$3">
              <Text fontWeight="600">❌ Error: {updateError}</Text>
            </Card>
          )}
        </Card>
      ))}
    </YStack>
  );
}
