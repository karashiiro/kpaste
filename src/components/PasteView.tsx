import { useLoaderData, Link } from "react-router";
import { safeHighlight } from "../prismUtils";
import type { PasteLoaderData } from "../loaders/pasteLoader";
import styles from "./PasteView.module.css";

export function PasteView() {
  console.log("🔄 PasteView render");

  const paste = useLoaderData() as PasteLoaderData;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.homeLink}>
            ← Back to KPaste
          </Link>
          <div className={styles.title}>
            <h1>{paste.value.title || "Untitled Paste"}</h1>
            <div className={styles.metadata}>
              <span>
                by <strong>@{paste.handle}</strong>
              </span>
              <span>•</span>
              <span>{paste.value.language || "text"}</span>
              <span>•</span>
              <span>{new Date(paste.value.createdAt).toLocaleString()}</span>
              {paste.value.expiresAt && (
                <>
                  <span>•</span>
                  <span>
                    expires {new Date(paste.value.expiresAt).toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.codeBlock}>
          <pre
            className={styles.code}
            dangerouslySetInnerHTML={{
              __html: safeHighlight(
                paste.content,
                paste.value.language || "text",
              ),
            }}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.uri}>
          <strong>URI:</strong> <code>{paste.uri}</code>
        </div>
      </div>
    </div>
  );
}
