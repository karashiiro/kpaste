import { YStack, Text, Button, Card, XStack, ScrollView } from "tamagui";
import { Link } from "react-router";
import {
  DocumentTextIcon,
  ArrowPathIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { PasteListItem } from "../types";
import { useDeletePaste } from "../hooks/useDeletePaste";
import { useCallback } from "react";
import { usePasteForm } from "../hooks/usePasteForm";
import { useUpdatePaste } from "../hooks/useUpdatePaste";
import { EditForm } from "./EditForm";
import { AtUriLink } from "./AtUriLink";
import { safeHighlight } from "../prismUtils";
import { parseAtUri } from "../pdsUtils";

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
        <XStack alignItems="center" space="$2">
          <DocumentTextIcon width={24} height={24} />
          <Text fontSize="$5" textAlign="center">
            No pastes found. Create your first paste!
          </Text>
        </XStack>
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
          {userHandle ? (
            (() => {
              // Extract rkey from URI for view link
              const uriParts = parseAtUri(paste.uri);
              const rkey = uriParts?.rkey || paste.uri.split("/").pop();

              return (
                <Link
                  to={`/p/${userHandle}/${rkey}`}
                  style={{ textDecoration: "none" }}
                >
                  <XStack
                    alignItems="center"
                    space="$2"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <DocumentTextIcon width={24} height={24} />
                    <Text fontSize="$7" fontWeight="600" color="$blue10">
                      {paste.value.title || "Untitled Paste"}
                    </Text>
                  </XStack>
                </Link>
              );
            })()
          ) : (
            <XStack alignItems="center" space="$2">
              <DocumentTextIcon width={24} height={24} />
              <Text fontSize="$7" fontWeight="600" color="$color">
                {paste.value.title || "Untitled Paste"}
              </Text>
            </XStack>
          )}

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
              <AtUriLink uri={paste.uri} showLabel={false} />
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
              <XStack alignItems="center" space="$2">
                <ArrowPathIcon
                  width={16}
                  height={16}
                  className="animate-spin"
                />
                <Text fontSize="$3">Loading content...</Text>
              </XStack>
            ) : (
              <XStack alignItems="center" space="$2">
                <ClockIcon width={16} height={16} />
                <Text fontSize="$3">Content will load automatically...</Text>
              </XStack>
            )}
          </YStack>

          <XStack space="$3" marginTop="$4">
            <Button onPress={() => startEdit(paste)} size="$4" flex={1}>
              <XStack alignItems="center" space="$2">
                <PencilIcon width={20} height={20} />
                <Text>Edit</Text>
              </XStack>
            </Button>

            <Button
              onPress={() => deletePaste(paste.uri)}
              disabled={deleteLoading}
              theme="red"
              size="$4"
              flex={1}
            >
              <XStack alignItems="center" space="$2">
                {deleteLoading ? (
                  <ArrowPathIcon
                    width={20}
                    height={20}
                    className="animate-spin"
                  />
                ) : (
                  <TrashIcon width={20} height={20} />
                )}
                <Text>{deleteLoading ? "Deleting..." : "Delete"}</Text>
              </XStack>
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
              <XStack alignItems="center" space="$2">
                <XMarkIcon width={20} height={20} />
                <Text fontWeight="600">Error: {deleteError}</Text>
              </XStack>
            </Card>
          )}

          {updateError && (
            <Card theme="red" padding="$3">
              <XStack alignItems="center" space="$2">
                <XMarkIcon width={20} height={20} />
                <Text fontWeight="600">Error: {updateError}</Text>
              </XStack>
            </Card>
          )}
        </Card>
      ))}
    </YStack>
  );
}
