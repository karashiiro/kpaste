import { useState, useCallback } from "react";
import { useAuth } from "@kpaste/atproto-auth";
import type { EditPasteForm } from "./usePasteForm";

export function useUpdatePaste() {
  const { getClient, isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePaste = useCallback(
    async (form: EditPasteForm) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return;
      }

      if (!form.content.trim()) {
        setError("Content is required!");
        return;
      }

      // Validate URI format and extract the record key
      if (
        !form.uri.startsWith("at://") ||
        !form.uri.includes("moe.karashiiro.kpaste.paste")
      ) {
        setError("Invalid paste URI");
        return;
      }

      const rkey = form.uri.split("/").pop();
      if (!rkey || rkey === "moe.karashiiro.kpaste.paste") {
        setError("Invalid paste URI");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a blob for the updated content
        const contentBlob = new Blob([form.content], { type: "text/plain" });

        // Upload the blob first
        const blobResponse = await client.post("com.atproto.repo.uploadBlob", {
          input: contentBlob,
        });

        if (!blobResponse.ok) {
          throw new Error(`Failed to upload content: ${blobResponse.status}`);
        }

        // Create the updated record
        const updatedRecord = {
          $type: "moe.karashiiro.kpaste.paste",
          content: blobResponse.data.blob,
          title: form.title || undefined,
          language: form.language || "text",
          createdAt: form.originalRecord.createdAt, // Keep original creation date
          updatedAt: new Date().toISOString(), // Set current timestamp for update
        };

        // Use putRecord to update the existing record
        const updateResponse = await client.post("com.atproto.repo.putRecord", {
          input: {
            repo: session.did,
            collection: "moe.karashiiro.kpaste.paste",
            rkey: rkey,
            record: updatedRecord,
          },
        });

        if (updateResponse.ok) {
          // Wait a moment for consistency and then reload
          // Fetching too soon can lead to a 404 on getBlob
          await new Promise((resolve) => setTimeout(resolve, 500));
          location.reload();
        } else {
          console.error("Update error:", updateResponse.data);
          setError(`Failed to update paste: ${updateResponse.status}`);
        }
      } catch (err) {
        console.error("Failed to update paste:", err);
        setError(err instanceof Error ? err.message : "Failed to update paste");
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, session?.did],
  );

  return { updatePaste, loading, error };
}
