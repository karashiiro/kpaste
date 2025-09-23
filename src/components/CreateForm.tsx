import { useCallback } from "react";
import styles from "./PasteManager.module.css";
import Editor from "react-simple-code-editor";

import type { CreatePasteForm } from "../hooks/usePasteManager";
import { safeHighlight } from "../prismUtils";

const editorStyle = {
  fontFamily: '"Courier New", "Monaco", "Menlo", monospace',
  fontSize: 14,
  lineHeight: 1.4,
  minHeight: "200px",
};

interface CreateFormProps {
  createForm: CreatePasteForm;
  loading: boolean;
  onFormChange: (form: CreatePasteForm) => void;
  onSubmit: () => Promise<void>;
}

export function CreateForm({
  createForm,
  loading,
  onFormChange,
  onSubmit,
}: CreateFormProps) {
  console.log("🔄 CreateForm render");

  // Memoized highlight function
  const highlightCode = useCallback(
    (code: string) => safeHighlight(code, createForm.language),
    [createForm.language],
  );

  return (
    <div className={styles.createForm}>
      <h3>Create New Paste</h3>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Title (optional):</label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            onFormChange({ ...createForm, title: e.target.value })
          }
          className={styles.formInput}
          placeholder="Enter a title for your paste..."
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Content:</label>
        <Editor
          value={createForm.content}
          onValueChange={(content) => onFormChange({ ...createForm, content })}
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
            value={createForm.language}
            onChange={(e) =>
              onFormChange({ ...createForm, language: e.target.value })
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
              onFormChange({ ...createForm, expiresAt: e.target.value })
            }
            className={styles.formInput}
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !createForm.content.trim()}
        className={styles.successButton}
      >
        {loading ? "Creating..." : "Create Paste"}
      </button>
    </div>
  );
}
