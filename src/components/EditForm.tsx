import { useCallback } from "react";
import styles from "./PasteManager.module.css";
import Editor from "react-simple-code-editor";
import type { EditPasteForm } from "../hooks/usePasteManager";
import { safeHighlight } from "../prismUtils";

const editorStyle = {
  fontFamily: '"Courier New", "Monaco", "Menlo", monospace',
  fontSize: 14,
  lineHeight: 1.4,
  minHeight: "200px",
};

interface EditFormProps {
  editForm: EditPasteForm;
  loading: boolean;
  onFormChange: (form: EditPasteForm) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function EditForm({
  editForm,
  loading,
  onFormChange,
  onSubmit,
  onCancel,
}: EditFormProps) {
  console.log("🔄 EditForm render");

  // Memoized highlight function
  const highlightCode = useCallback(
    (code: string) => safeHighlight(code, editForm.language),
    [editForm.language],
  );

  return (
    <div className={styles.createForm}>
      <h3>✏️ Edit Paste</h3>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Title (optional):</label>
        <input
          type="text"
          value={editForm.title}
          onChange={(e) => onFormChange({ ...editForm, title: e.target.value })}
          className={styles.formInput}
          placeholder="Enter a title for your paste..."
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Content:</label>
        <Editor
          value={editForm.content}
          onValueChange={(content) => onFormChange({ ...editForm, content })}
          highlight={highlightCode}
          padding={12}
          className={styles.formTextarea}
          placeholder="Paste your code or text here..."
          style={editorStyle}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formColumn}>
          <label className={styles.formLabel}>Language:</label>
          <select
            value={editForm.language}
            onChange={(e) =>
              onFormChange({ ...editForm, language: e.target.value })
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
      </div>

      <div className={styles.infoNote}>
        <p className={styles.infoText}>
          📝 Note: All pastes are public in AT Protocol repos
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onSubmit}
          disabled={loading || !editForm.content.trim()}
          className={styles.successButton}
        >
          {loading ? "Updating..." : "Update Paste"}
        </button>
        <button onClick={onCancel} disabled={loading} className={styles.button}>
          Cancel
        </button>
      </div>
    </div>
  );
}
