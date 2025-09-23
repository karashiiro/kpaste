import { useAuth } from "../auth/useAuth";
import { usePasteManager } from "../hooks/usePasteManager";
import styles from "./PasteManager.module.css";

export function PasteManager() {
  const { isAuthenticated } = useAuth();
  const {
    pastes,
    loading,
    error,
    showCreateForm,
    createForm,
    loadPastes,
    createPaste,
    deletePaste,
    setShowCreateForm,
    setCreateForm,
  } = usePasteManager();

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
          onClick={loadPastes}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Loading..." : "Refresh Pastes"}
        </button>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={loading}
          className={styles.primaryButton}
        >
          {showCreateForm ? "Cancel" : "Create New Paste"}
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <h3>Create New Paste</h3>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title (optional):</label>
            <input
              type="text"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className={styles.formInput}
              placeholder="Enter a title for your paste..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Content:</label>
            <textarea
              value={createForm.content}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, content: e.target.value }))
              }
              className={styles.formTextarea}
              placeholder="Paste your code or text here..."
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <label className={styles.formLabel}>Language:</label>
              <select
                value={createForm.language}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
                className={styles.formInput}
              >
                <option value="text">Plain Text</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            <div className={styles.formColumn}>
              <label className={styles.formLabel}>Expires At (optional):</label>
              <input
                type="datetime-local"
                value={createForm.expiresAt}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    expiresAt: e.target.value,
                  }))
                }
                className={styles.formInput}
              />
            </div>
          </div>

          <button
            onClick={createPaste}
            disabled={loading || !createForm.content.trim()}
            className={styles.successButton}
          >
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </div>
      )}

      {error && <div className={styles.errorMessage}>Error: {error}</div>}

      {pastes.length === 0 && !loading && (
        <p className={styles.emptyState}>
          No pastes found. Create your first paste!
        </p>
      )}

      {pastes.length > 0 && (
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
              <p className={styles.pasteMetadata}>
                <strong>Content:</strong> Blob reference (
                {paste.value.content?.mimeType || "unknown type"})
              </p>

              <div className={styles.pasteActions}>
                <button
                  onClick={() => deletePaste(paste.uri)}
                  disabled={loading}
                  className={styles.dangerButton}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>

                <button disabled className={styles.disabledButton}>
                  Edit (Coming Soon!)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
