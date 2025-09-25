import {
  YStack,
  Text,
  Button,
  Card,
  XStack,
  ScrollView,
  Tooltip,
} from "tamagui";
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
import { EditModal } from "./EditModal";
import { AtUriLink } from "./AtUriLink";
import { safeHighlight } from "../prismUtils";
import { parseAtUri } from "../pdsUtils";

interface PasteListProps {
  pastes: PasteListItem[];
  userHandle?: string;
  currentUserSession?: { handle: string; did: string } | null;
}

export function PasteList({
  pastes,
  userHandle,
  currentUserSession,
}: PasteListProps) {
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
        <XStack alignItems="center" gap="$2">
          <DocumentTextIcon width={24} height={24} color="white" />
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
    <YStack gap="$5">
      {pastes.map((paste) => (
        <Card
          key={paste.uri}
          padding="$5"
          gap="$4"
          bordered
          position="relative"
        >
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
                    gap="$2"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <DocumentTextIcon width={24} height={24} color="white" />
                    <Text fontSize="$7" fontWeight="600" color="$blue10">
                      {paste.value.title || "Untitled Paste"}
                    </Text>
                  </XStack>
                </Link>
              );
            })()
          ) : (
            <XStack alignItems="center" gap="$2">
              <DocumentTextIcon width={24} height={24} color="white" />
              <Text fontSize="$7" fontWeight="600" color="$color">
                {paste.value.title || "Untitled Paste"}
              </Text>
            </XStack>
          )}

          <YStack gap="$3">
            <XStack alignItems="center" gap="$3" flexWrap="wrap">
              <XStack alignItems="center" gap="$2">
                <Text fontSize="$4" fontWeight="500">
                  Language:
                </Text>
                <Text fontSize="$4" fontWeight="600">
                  {paste.value.language || "text"}
                </Text>
              </XStack>

              <Text fontSize="$4">•</Text>

              <XStack alignItems="center" gap="$2">
                <Text fontSize="$4" fontWeight="500">
                  Created:
                </Text>
                <Text fontSize="$4">
                  {new Date(paste.value.createdAt).toLocaleString()}
                </Text>
              </XStack>

              {paste.value.updatedAt &&
                paste.value.updatedAt !== paste.value.createdAt && (
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize="$4" fontWeight="500">
                      Updated:
                    </Text>
                    <Text fontSize="$4">
                      {new Date(paste.value.updatedAt).toLocaleString()}
                    </Text>
                  </XStack>
                )}
            </XStack>

            <XStack alignItems="center" gap="$2">
              <Text fontSize="$4" fontWeight="500">
                URI:
              </Text>
              <AtUriLink
                uri={paste.uri}
                showLabel={false}
                variant="compact"
                fontSize="$3"
              />
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$3" fontWeight="500">
              Content:
            </Text>
            {paste.content ? (
              <Card padding="$3" borderRadius="$4" bordered>
                <ScrollView maxHeight={200}>
                  <pre
                    style={{
                      fontFamily: '"Inconsolata", monospace',
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
              <XStack alignItems="center" gap="$2">
                <ArrowPathIcon
                  width={16}
                  height={16}
                  className="animate-spin"
                />
                <Text fontSize="$3">Loading content...</Text>
              </XStack>
            ) : (
              <XStack alignItems="center" gap="$2">
                <ClockIcon width={16} height={16} />
                <Text fontSize="$3">Content will load automatically...</Text>
              </XStack>
            )}
          </YStack>

          {/* Only show edit/delete buttons if current user owns this paste */}
          {currentUserSession && userHandle === currentUserSession.handle && (
            <>
              {/* Delete button - subtle circle in corner */}
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    position="absolute"
                    top="$3"
                    right="$3"
                    size="$3"
                    circular
                    backgroundColor="$red2"
                    borderColor="$red6"
                    borderWidth={1}
                    hoverStyle={{
                      backgroundColor: "$red4",
                      borderColor: "$red8",
                      scale: 1.05,
                    }}
                    pressStyle={{
                      backgroundColor: "$red5",
                      borderColor: "$red9",
                      scale: 0.95,
                    }}
                    onPress={() => deletePaste(paste.uri)}
                    disabled={deleteLoading}
                    opacity={0.8}
                    zIndex={1}
                  >
                    {deleteLoading ? (
                      <ArrowPathIcon
                        width={16}
                        height={16}
                        className="animate-spin"
                        color="$red10"
                      />
                    ) : (
                      <TrashIcon width={16} height={16} color="$red10" />
                    )}
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content
                  enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
                  exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
                  scale={1}
                  x={0}
                  y={0}
                  opacity={1}
                  animation={[
                    "quick",
                    {
                      opacity: {
                        overshootClamping: true,
                      },
                    },
                  ]}
                >
                  <Tooltip.Arrow />
                  <Text>Delete this paste</Text>
                </Tooltip.Content>
              </Tooltip>

              {/* Edit button - full width */}
              <Button onPress={() => startEdit(paste)} size="$4" marginTop="$4">
                <XStack alignItems="center" gap="$2">
                  <PencilIcon width={20} height={20} color="white" />
                  <Text>Edit</Text>
                </XStack>
              </Button>
            </>
          )}

          {deleteError && (
            <Card theme="red" padding="$3">
              <XStack alignItems="center" gap="$2">
                <XMarkIcon width={20} height={20} />
                <Text fontWeight="600">Error: {deleteError}</Text>
              </XStack>
            </Card>
          )}

          {updateError && (
            <Card theme="red" padding="$3">
              <XStack alignItems="center" gap="$2">
                <XMarkIcon width={20} height={20} />
                <Text fontWeight="600">Error: {updateError}</Text>
              </XStack>
            </Card>
          )}
        </Card>
      ))}

      {/* Edit Modal */}
      <EditModal
        isOpen={!!forms.editForm}
        onClose={forms.cancelEdit}
        editForm={forms.editForm}
        loading={updateLoading}
        onFormChange={forms.setEditForm}
        onSubmit={() => updatePaste(forms.editForm!)}
      />
    </YStack>
  );
}
