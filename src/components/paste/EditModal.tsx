import { Sheet } from "@tamagui/sheet";
import { ScrollView } from "@tamagui/scroll-view";
import type { EditPasteForm } from "../../hooks/usePasteForm";
import { PasteForm } from "./PasteForm";

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
      modal={true}
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[90]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Handle />
      <Sheet.Frame
        padding="$4"
        justifyContent="flex-start"
        alignItems="center"
        gap="$2"
        flex={1}
      >
        <ScrollView
          maxWidth={600}
          width="100%"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start",
          }}
        >
          <PasteForm
            form={editForm}
            loading={loading}
            onFormChange={(form) => onFormChange(form as EditPasteForm)}
            onSubmit={onSubmit}
            onCancel={onClose}
            mode="edit"
          />
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
