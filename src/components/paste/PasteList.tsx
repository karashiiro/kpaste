import { YStack, XStack } from "@tamagui/stacks";
import { ScrollView } from "@tamagui/scroll-view";
import { InsetCard } from "../ui/InsetCard";
import { Tooltip } from "@tamagui/tooltip";
import { Paragraph } from "@tamagui/text";
import { Link } from "react-router";
import {
  DocumentTextIcon,
  ArrowPathIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { PasteListItem } from "../../types";
import { useDeletePaste } from "../../hooks/useDeletePaste";
import { useCallback } from "react";
import { usePasteForm } from "../../hooks/usePasteForm";
import { useUpdatePaste } from "../../hooks/useUpdatePaste";
import { EditModal } from "./EditModal";
import { safeHighlight } from "../../prismUtils";
import { parseAtUri } from "../../pdsUtils";
import { LoadingButton } from "../ui/LoadingButton";
import { Card } from "@tamagui/card";

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
      <InsetCard
        padding="$6"
        marginTop="$4"
        alignItems="center"
        insetPadding="12px"
      >
        <XStack alignItems="center" gap="$2">
          <DocumentTextIcon width={24} height={24} color="white" />
          <Paragraph fontSize="$5" textAlign="center">
            No pastes found. Create your first paste!
          </Paragraph>
        </XStack>
      </InsetCard>
    );
  }

  if (pastes.length === 0) {
    return null;
  }

  return (
    <YStack gap="$5">
      {pastes.map((paste) => (
        <InsetCard
          key={paste.uri}
          gap="$4"
          position="relative"
          insetPadding="8px"
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
                    <Paragraph fontSize="$7" fontWeight="600" color="$blue10">
                      {paste.value.title || "Untitled Paste"}
                    </Paragraph>
                  </XStack>
                </Link>
              );
            })()
          ) : (
            <XStack alignItems="center" gap="$2">
              <DocumentTextIcon width={24} height={24} color="white" />
              <Paragraph fontSize="$7" fontWeight="600" color="$color">
                {paste.value.title || "Untitled Paste"}
              </Paragraph>
            </XStack>
          )}

          <YStack gap="$3">
            <XStack
              alignItems="center"
              gap="$3"
              flexWrap="wrap"
              $xs={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "$2",
              }}
            >
              <XStack alignItems="center" gap="$2">
                <Paragraph fontSize="$4" fontWeight="500">
                  Language:
                </Paragraph>
                <Paragraph fontSize="$4" fontWeight="600">
                  {paste.value.language || "text"}
                </Paragraph>
              </XStack>

              <XStack alignItems="center" gap="$2">
                <Paragraph fontSize="$4" fontWeight="500">
                  Created:
                </Paragraph>
                <Paragraph fontSize="$4">
                  {new Date(paste.value.createdAt).toLocaleString()}
                </Paragraph>
              </XStack>

              {paste.value.updatedAt &&
                paste.value.updatedAt !== paste.value.createdAt && (
                  <XStack alignItems="center" gap="$2">
                    <Paragraph fontSize="$4" fontWeight="500">
                      Updated:
                    </Paragraph>
                    <Paragraph fontSize="$4">
                      {new Date(paste.value.updatedAt).toLocaleString()}
                    </Paragraph>
                  </XStack>
                )}
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Paragraph fontSize="$3" fontWeight="500">
              Content:
            </Paragraph>
            {paste.content ? (
              <Card padding="$3" bordered>
                <ScrollView maxHeight={200}>
                  <pre
                    style={{
                      fontFamily: '"Inconsolata", monospace',
                      fontSize: 13,
                      lineHeight: 1.4,
                      margin: 0,
                      padding: 0,
                      overflow: "auto",
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
                <Paragraph fontSize="$3">Loading content...</Paragraph>
              </XStack>
            ) : (
              <XStack alignItems="center" gap="$2">
                <ClockIcon width={16} height={16} />
                <Paragraph fontSize="$3">
                  Content will load automatically...
                </Paragraph>
              </XStack>
            )}
          </YStack>

          {/* Only show edit/delete buttons if current user owns this paste */}
          {currentUserSession && userHandle === currentUserSession.handle && (
            <>
              {/* Delete button - subtle circle in corner */}
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <LoadingButton
                    position="absolute"
                    top="$3"
                    right="$3"
                    size="$3"
                    circular
                    theme="red"
                    outerRadius="50%"
                    innerRadius="50%"
                    paddingHorizontal="3px"
                    paddingVertical="3px"
                    flex={0}
                    flexShrink={0}
                    flexGrow={0}
                    cardPadding={0}
                    onPress={() => deletePaste(paste.uri)}
                    loading={deleteLoading}
                    opacity={0.8}
                    zIndex={1}
                    icon={<TrashIcon width={20} height={20} color="white" />}
                  ></LoadingButton>
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
                  <Paragraph>Delete this paste</Paragraph>
                </Tooltip.Content>
              </Tooltip>

              {/* Edit button */}
              <LoadingButton
                onPress={() => startEdit(paste)}
                size="$4"
                marginTop="$4"
                width="100%"
                icon={<PencilIcon width={20} height={20} color="white" />}
              >
                Edit
              </LoadingButton>
            </>
          )}

          {deleteError && (
            <InsetCard theme="red" padding="$3">
              <XStack alignItems="center" gap="$2">
                <XMarkIcon width={20} height={20} />
                <Paragraph fontWeight="600">Error: {deleteError}</Paragraph>
              </XStack>
            </InsetCard>
          )}

          {updateError && (
            <InsetCard theme="red" padding="$3">
              <XStack alignItems="center" gap="$2">
                <XMarkIcon width={20} height={20} />
                <Paragraph fontWeight="600">Error: {updateError}</Paragraph>
              </XStack>
            </InsetCard>
          )}
        </InsetCard>
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
