import { useLoaderData, Link } from "react-router";
import { useMemo } from "react";
import { YStack, XStack, Text, Card, Button } from "tamagui";
import {
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { AtUriLink } from "./AtUriLink";
import { EditModal } from "./EditModal";
import { safeHighlight } from "../prismUtils";
import type { PasteLoaderData } from "../loaders/pasteLoader";
import { useAuth } from "../hooks/useAuth";
import { usePasteForm } from "../hooks/usePasteForm";
import { useUpdatePaste } from "../hooks/useUpdatePaste";
import { useDeletePaste } from "../hooks/useDeletePaste";

export function PasteView() {
  const paste = useLoaderData() as PasteLoaderData;
  const { session } = useAuth();
  const forms = usePasteForm();
  const { updatePaste, loading: updateLoading } = useUpdatePaste();
  const { deletePaste, loading: deleteLoading } = useDeletePaste();

  // Check if current user owns this paste (reactive to session changes)
  const isOwner = useMemo(
    () => session?.handle === paste.handle,
    [session?.handle, paste.handle],
  );

  const startEdit = () => {
    forms.setEditForm({
      uri: paste.uri,
      originalRecord: paste.value,
      title: paste.value.title || "",
      content: paste.content,
      language: paste.value.language || "text",
    });
  };

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <YStack
        padding="$4"
        maxWidth={1200}
        marginHorizontal="auto"
        width="100%"
        gap="$4"
      >
        <YStack gap="$2">
          <XStack alignItems="center" gap="$3" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <DocumentTextIcon width={32} height={32} />
              <Text fontSize="$8" fontWeight="700">
                {paste.value.title || "Untitled Paste"}
              </Text>
            </XStack>

            {/* Edit and Delete buttons for paste owner */}
            {isOwner && (
              <XStack gap="$3">
                <Button onPress={startEdit} size="$3" theme="blue">
                  <XStack alignItems="center" gap="$1">
                    <PencilIcon width={16} height={16} />
                    <Text>Edit</Text>
                  </XStack>
                </Button>

                <Button
                  onPress={() => deletePaste(paste.uri)}
                  disabled={deleteLoading}
                  size="$3"
                  theme="red"
                >
                  <XStack alignItems="center" gap="$1">
                    {deleteLoading ? (
                      <ArrowPathIcon
                        width={16}
                        height={16}
                        className="animate-spin"
                      />
                    ) : (
                      <TrashIcon width={16} height={16} />
                    )}
                    <Text>{deleteLoading ? "Deleting..." : "Delete"}</Text>
                  </XStack>
                </Button>
              </XStack>
            )}
          </XStack>
          <XStack alignItems="center" gap="$2">
            <Text fontSize="$4">
              by{" "}
              <Text fontWeight="600">
                <Link
                  to={`/pastes/${paste.handle}`}
                  style={{ color: "white", textDecoration: "underline" }}
                >
                  @{paste.handle}
                </Link>
              </Text>
            </Text>
            <Text fontSize="$4">•</Text>
            <Text
              fontSize="$4"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$3"
            >
              {paste.value.language || "text"}
            </Text>
            <Text fontSize="$4">•</Text>
            <Text fontSize="$4">
              Created: {new Date(paste.value.createdAt).toLocaleString()}
            </Text>
            {paste.value.updatedAt &&
              paste.value.updatedAt !== paste.value.createdAt && (
                <>
                  <Text fontSize="$4">•</Text>
                  <Text fontSize="$4">
                    Updated: {new Date(paste.value.updatedAt).toLocaleString()}
                  </Text>
                </>
              )}
          </XStack>
        </YStack>

        <Card padding="$0" bordered>
          <pre
            style={{
              fontFamily: '"Inconsolata", monospace',
              fontSize: 14,
              lineHeight: 1.4,
              margin: 0,
              padding: 12,
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{
              __html: safeHighlight(
                paste.content,
                paste.value.language || "text",
              ),
            }}
          />
        </Card>

        <AtUriLink uri={paste.uri} showLabel={true} />
      </YStack>

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
