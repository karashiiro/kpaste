import { useCallback, useState } from "react";
import type { CreatePasteForm } from "./usePasteForm";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router";

export function useCreatePaste() {
  const { getClient, isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const createPaste = useCallback(
    async (form: CreatePasteForm) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return;
      }

      if (!form.content.trim()) {
        setError("Content is required!");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a blob for the content
        const contentBlob = new Blob([form.content], {
          type: "text/plain",
        });

        // Upload the blob first
        const blobResponse = await client.post("com.atproto.repo.uploadBlob", {
          input: contentBlob,
        });

        if (!blobResponse.ok) {
          throw new Error(`Failed to upload content: ${blobResponse.status}`);
        }

        // Create the paste record
        const now = new Date().toISOString();
        const record = {
          $type: "moe.karashiiro.kpaste.paste",
          content: blobResponse.data.blob,
          title: form.title || undefined,
          language: form.language || "text",
          createdAt: now,
          updatedAt: now,
        };

        const createResponse = await client.post(
          "com.atproto.repo.createRecord",
          {
            input: {
              repo: session.did,
              collection: "moe.karashiiro.kpaste.paste",
              record,
            },
          },
        );

        if (createResponse.ok) {
          // Go to paste page
          const rkey = createResponse.data.uri.split("/").pop();
          navigate(`/p/${session.handle}/${rkey}`);
        } else {
          console.error("Create error:", createResponse.data);
          setError(`Failed to create paste: ${createResponse.status}`);
        }
      } catch (err) {
        console.error("Failed to create paste:", err);
        setError(err instanceof Error ? err.message : "Failed to create paste");
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, navigate, session?.did, session?.handle],
  );

  return { createPaste, loading, error };
}
