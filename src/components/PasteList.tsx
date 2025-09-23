import styles from "./PasteManager.module.css";
import type { PasteListItem } from "../hooks/usePasteManager";

interface PasteListProps {
  pastes: PasteListItem[];
  loading: boolean;
  onDelete: (uri: string) => Promise<void>;
  onEdit: (paste: PasteListItem) => void;
  onFetchContent: (pasteUri: string) => Promise<void>;
}

export function PasteList({
  pastes,
  loading,
  onDelete,
  onEdit,
  onFetchContent,
}: PasteListProps) {
  console.log("🔄 PasteList render");

  if (pastes.length === 0 && !loading) {
    return (
      <p className={styles.emptyState}>
        No pastes found. Create your first paste!
      </p>
    );
  }

  if (pastes.length === 0) {
    return null;
  }

  return (
    <div className={styles.pasteList}>
      {pastes.map((paste) => (
        <div key={paste.uri} className={styles.pasteItem}>
          <h3 className={styles.pasteTitle}>
            {paste.value.title || "Untitled Paste"}
          </h3>
          <p className={styles.pasteMetadata}>
            <strong>Language:</strong> {paste.value.language || "text"}
          </p>
          <p className={styles.pasteMetadata}>
            <strong>Created:</strong>{" "}
            {new Date(paste.value.createdAt).toLocaleString()}
          </p>
          {paste.value.expiresAt && (
            <p className={styles.pasteMetadata}>
              <strong>Expires:</strong>{" "}
              {new Date(paste.value.expiresAt).toLocaleString()}
            </p>
          )}
          <p className={styles.pasteMetadata}>
            <strong>URI:</strong>{" "}
            <code className={styles.pasteUri}>{paste.uri}</code>
          </p>
          <div className={styles.pasteMetadata}>
            <strong>Content:</strong>
            {paste.content ? (
              <div className={styles.contentDisplay}>
                <pre className={styles.contentText}>{paste.content}</pre>
              </div>
            ) : paste.contentLoading ? (
              <span className={styles.loadingText}> Loading content...</span>
            ) : (
              <button
                onClick={() => onFetchContent(paste.uri)}
                className={styles.loadContentButton}
                disabled={loading}
              >
                📄 Load Content
              </button>
            )}
          </div>

          <div className={styles.pasteActions}>
            <button
              onClick={() => onDelete(paste.uri)}
              disabled={loading}
              className={styles.dangerButton}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>

            <button
              onClick={() => onEdit(paste)}
              disabled={loading}
              className={styles.secondaryButton}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
