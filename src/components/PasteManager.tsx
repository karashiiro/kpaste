import { useAuth } from "../auth/useAuth";
import { usePasteManager } from "../hooks/usePasteManager";
import styles from "./PasteManager.module.css";
import { PasteList } from "./PasteList";
import { CreateForm } from "./CreateForm";
import { EditForm } from "./EditForm";

export function PasteManager() {
  const { isAuthenticated } = useAuth();
  const pasteManager = usePasteManager();

  if (!isAuthenticated) {
    return (
      <div className={styles.pasteManager}>
        <h2>Paste Manager</h2>
        <p>Please log in to manage your pastes!</p>
      </div>
    );
  }

  return (
    <div className={styles.pasteManager}>
      <h2>Your Pastes</h2>

      <div className={styles.buttonGroup}>
        <button
          onClick={pasteManager.loadPastes}
          disabled={pasteManager.loading}
          className={styles.button}
        >
          {pasteManager.loading ? "Loading..." : "Refresh Pastes"}
        </button>

        <button
          onClick={() =>
            pasteManager.setShowCreateForm(!pasteManager.showCreateForm)
          }
          disabled={pasteManager.loading}
          className={styles.primaryButton}
        >
          {pasteManager.showCreateForm ? "Cancel" : "Create New Paste"}
        </button>
      </div>

      {pasteManager.showCreateForm && (
        <CreateForm
          createForm={pasteManager.createForm}
          loading={pasteManager.loading}
          onFormChange={pasteManager.setCreateForm}
          onSubmit={pasteManager.createPaste}
        />
      )}

      {pasteManager.editForm && (
        <EditForm
          editForm={pasteManager.editForm}
          loading={pasteManager.loading}
          onFormChange={pasteManager.setEditForm}
          onSubmit={pasteManager.updatePaste}
          onCancel={pasteManager.cancelEdit}
        />
      )}

      {pasteManager.error && (
        <div className={styles.errorMessage}>Error: {pasteManager.error}</div>
      )}

      <PasteList
        pastes={pasteManager.pastes}
        loading={pasteManager.loading}
        onDelete={pasteManager.deletePaste}
        onEdit={pasteManager.startEdit}
        onFetchContent={pasteManager.fetchBlobContent}
      />
    </div>
  );
}
