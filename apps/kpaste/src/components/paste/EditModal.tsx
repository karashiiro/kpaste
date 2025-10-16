import { Sheet } from "@tamagui/sheet";
import type { EditPasteForm } from "../../hooks/usePasteForm";
import { PasteForm } from "./PasteForm";
import { Card } from "@tamagui/card";

function EditModelContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

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
      containerComponent={EditModelContainer}
      disableDrag
    >
      <Sheet.Frame
        padding="$4"
        alignItems="center"
        justifyContent="flex-start"
        borderTopLeftRadius="none"
        borderTopRightRadius="none"
        overflow="scroll"
        scrollbarWidth="none"
        marginTop={130}
        $sm={{ marginTop: 0 }}
      >
        <Card unstyled maxWidth={1200} width="100%">
          <div style={{ height: 40 }} />
          <PasteForm
            form={editForm}
            loading={loading}
            onFormChange={(form) => onFormChange(form as EditPasteForm)}
            onSubmit={onSubmit}
            onCancel={onClose}
            mode="edit"
          />
          {/* Spacer for when modal fills screen to avoid touching bottom */}
          <div style={{ height: 20 }} />
        </Card>
      </Sheet.Frame>
    </Sheet>
  );
}
