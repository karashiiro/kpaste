import { Sheet, YStack } from "tamagui";
import type { EditPasteForm } from "../hooks/usePasteForm";
import { EditForm } from "./EditForm";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editForm: EditPasteForm | null;
  loading: boolean;
  onFormChange: (form: EditPasteForm) => void;
  onSubmit: () => Promise<void>;
}

export function EditModal({
  isOpen,
  onClose,
  editForm,
  loading,
  onFormChange,
  onSubmit,
}: EditModalProps) {
  if (!editForm) return null;

  return (
    <Sheet
      forceRemoveScrollEnabled={isOpen}
      modal={true}
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[90, 50, 25]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame
        padding="$4"
        justifyContent="flex-start"
        alignItems="center"
        gap="$2"
      >
        <YStack maxWidth={600} width="100%">
          <EditForm
            editForm={editForm}
            loading={loading}
            onFormChange={onFormChange}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
