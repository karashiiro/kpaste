import { useLoaderData, useLocation } from "react-router";
import { useEffect, useMemo } from "react";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import {
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { EditModal } from "../paste/EditModal";
import { safeHighlight } from "@kpaste-app/ui";
import type { PasteLoaderData } from "../../loaders/pasteLoader";
import { useAuth } from "@kpaste-app/atproto-auth";
import { usePasteForm } from "../../hooks/usePasteForm";
import { useUpdatePaste } from "../../hooks/useUpdatePaste";
import { useDeletePaste } from "../../hooks/useDeletePaste";
import { PageContainer } from "@kpaste-app/ui";
import { PasteMetadata } from "../paste/PasteMetadata";
import { LoadingButton } from "@kpaste-app/ui";
import { Card } from "@tamagui/card";

export function PasteView() {
  const paste = useLoaderData() as PasteLoaderData;
  const { session } = useAuth();
  const forms = usePasteForm();
  const { updatePaste, loading: updateLoading } = useUpdatePaste();
  const { deletePaste, loading: deleteLoading } = useDeletePaste();
  const location = useLocation();

  // Close edit modal when navigating to a different paste
  useEffect(() => {
    if (forms.editForm) {
      forms.cancelEdit();
    }
    // TODO: nasty hack, figure out how to remove this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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
      <PageContainer gap="$4">
        <YStack gap="$2">
          <XStack alignItems="center" gap="$3" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <DocumentTextIcon width={32} height={32} />
              <Paragraph fontSize="$8" fontWeight="700">
                {paste.value.title || "Untitled Paste"}
              </Paragraph>
            </XStack>

            {/* Edit and Delete buttons for paste owner */}
            {isOwner && (
              <XStack
                gap="$3"
                flexDirection="column"
                $xs={{ flexDirection: "row", gap: "$2" }}
              >
                <LoadingButton
                  onPress={startEdit}
                  size="$3"
                  colorVariant="blue"
                  icon={
                    <PencilIcon
                      width={16}
                      height={16}
                      color="var(--blueText)"
                    />
                  }
                >
                  Edit
                </LoadingButton>

                <LoadingButton
                  onPress={() => deletePaste(paste.uri)}
                  loading={deleteLoading}
                  loadingText="Deleting..."
                  size="$3"
                  colorVariant="red"
                  icon={
                    <TrashIcon width={16} height={16} color="var(--redText)" />
                  }
                >
                  Delete
                </LoadingButton>
              </XStack>
            )}
          </XStack>

          <PasteMetadata
            paste={paste.value}
            handle={paste.handle}
            responsive
            variant="inline"
          />
        </YStack>

        <Card padding={0} bordered>
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
      </PageContainer>

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
