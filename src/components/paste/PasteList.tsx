import { YStack, XStack } from "@tamagui/stacks";
import { ScrollView } from "@tamagui/scroll-view";
import { InsetCard } from "../ui/InsetCard";
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
import { safeHighlight } from "../../utils/prismUtils";
import { parseAtUri } from "../../utils/pdsUtils";
import { Card } from "@tamagui/card";
import { InsetCircleButton } from "../ui/CircleInsetButton";

interface PasteListProps {
  pastes: PasteListItem[];
  userHandle: string;
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
          {(() => {
            // Extract rkey from URI for view link
            const uriParts = parseAtUri(paste.uri);
            const rkey = uriParts?.rkey || paste.uri.split("/").pop();

            return (
              <XStack>
                <Link
                  to={`/p/${userHandle}/${rkey}`}
                  style={{ textDecoration: "none" }}
                >
                  <XStack
                    alignItems="center"
                    gap="$2"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <DocumentTextIcon
                      width={24}
                      height={24}
                      color="var(--textTitle)"
                      style={{ marginLeft: -4 }}
                    />
                    <Paragraph
                      fontSize="$7"
                      fontWeight="600"
                      color="$textTitle"
                    >
                      {paste.value.title || "Untitled Paste"}
                    </Paragraph>
                  </XStack>
                </Link>
              </XStack>
            );
          })()}

          <YStack gap="$3" marginTop="$2">
            <XStack
              alignItems="center"
              gap="$1"
              flexWrap="wrap"
              $xs={{
                flexDirection: "column",
                alignItems: "flex-start",
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

          <YStack gap="$2" marginTop="$2">
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
            <Card
              unstyled
              position="absolute"
              top={0}
              right={-48}
              $xs={{ right: 0 }}
            >
              {/* Delete button */}
              <InsetCircleButton
                position="absolute"
                top="$3"
                right="$3"
                zIndex={1}
                colorVariant="red"
                onPress={() => deletePaste(paste.uri)}
                loading={deleteLoading}
                icon={
                  <TrashIcon width={20} height={20} color="var(--redText)" />
                }
                tooltipText="Delete this paste"
              />

              {/* Edit button */}
              <InsetCircleButton
                position="absolute"
                top="$11"
                right="$3"
                zIndex={1}
                onPress={() => startEdit(paste)}
                icon={<PencilIcon width={20} height={20} color="white" />}
                tooltipText="Edit this paste"
                $xs={{ top: "$3", right: "$11" }}
              />
            </Card>
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
