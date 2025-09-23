import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  type CreatePasteForm,
  type EditPasteForm,
  usePasteForm,
} from "./usePasteForm";
import type { PasteListItem } from "../types";

// Hook for blob content handling
function useBlobContent(
  pastes: PasteListItem[],
  setPastes: React.Dispatch<React.SetStateAction<PasteListItem[]>>,
) {
  const { getClient, isAuthenticated, session } = useAuth();

  const fetchBlobContent = useCallback(
    async (pasteUri: string) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        return;
      }

      // Find the paste and its blob reference
      const paste = pastes.find((p) => p.uri === pasteUri);
      if (!paste || paste.content !== undefined) {
        return; // Already fetched or not found
      }

      // Set loading state for this specific paste
      setPastes((prev) =>
        prev.map((p) =>
          p.uri === pasteUri ? { ...p, contentLoading: true } : p,
        ),
      );

      try {
        // Extract the CID from the blob reference
        // AT Protocol blob structure should be: { $type: "blob", ref: { $link: "cid..." }, mimeType: "...", size: number }
        let cid: string;
        const content = paste.value.content;

        if (content && "ref" in content) {
          const ref = content.ref;
          cid = ref.$link;
        } else {
          throw new Error("Could not extract CID from blob reference");
        }

        // Get the blob using com.atproto.sync.getBlob
        const response = await client.get("com.atproto.sync.getBlob", {
          params: {
            did: session.did,
            cid: cid,
          },
          as: "blob",
        });

        if (response.ok) {
          // Response data is a web Blob, use .text() to get string content
          const blob = response.data as Blob;
          const text = await blob.text();

          // Update the paste with the fetched content
          setPastes((prev) =>
            prev.map((p) =>
              p.uri === pasteUri
                ? { ...p, content: text, contentLoading: false }
                : p,
            ),
          );
        } else {
          console.error("Failed to fetch blob:", response.data);
          // Set loading to false on error
          setPastes((prev) =>
            prev.map((p) =>
              p.uri === pasteUri ? { ...p, contentLoading: false } : p,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch blob content:", err);
        // Set loading to false on error
        setPastes((prev) =>
          prev.map((p) =>
            p.uri === pasteUri ? { ...p, contentLoading: false } : p,
          ),
        );
      }
    },
    [getClient, isAuthenticated, session?.did, pastes, setPastes],
  );

  return {
    fetchBlobContent,
  };
}

export interface UsePasteManagerReturn {
  // State
  pastes: PasteListItem[];
  loading: boolean;
  error: string | null;
  cursor?: string; // Pagination cursor

  // Form state
  showCreateForm: boolean;
  createForm: CreatePasteForm;
  editForm: EditPasteForm | null;

  // Actions
  loadPastes: (cursor?: string) => Promise<string | undefined>;
  createPaste: () => Promise<void>;
  updatePaste: () => Promise<void>;
  deletePaste: (uri: string) => Promise<void>;
  fetchBlobContent: (pasteUri: string) => Promise<void>;
  startEdit: (paste: PasteListItem) => void;
  cancelEdit: () => void;
  setShowCreateForm: (show: boolean) => void;
  setCreateForm: React.Dispatch<React.SetStateAction<CreatePasteForm>>;
  setEditForm: React.Dispatch<React.SetStateAction<EditPasteForm | null>>;
  resetForm: () => void;
}

export function usePasteManager(): UsePasteManagerReturn {
  const { isAuthenticated, getClient, session } = useAuth();

  // CRUD operations state
  const [pastes, setPastes] = useState<PasteListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Use the smaller hooks for form and blob handling
  const forms = usePasteForm();
  const blobContent = useBlobContent(pastes, setPastes);

  // CRUD operations
  const loadPastes = useCallback(
    async (cursor?: string) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated or missing DID");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await client.get("com.atproto.repo.listRecords", {
          params: {
            repo: session.did,
            collection: "moe.karashiiro.kpaste.paste",
            limit: 10,
            cursor,
          },
        });

        if (response.ok) {
          // The response records need to be cast more carefully
          const loadedPastes = response.data
            .records as unknown as PasteListItem[];
          setPastes(loadedPastes);

          // Store the cursor for pagination
          setCursor(response.data.cursor);

          // Eagerly fetch content for all pastes
          for (const paste of loadedPastes) {
            if (paste.value.content && "ref" in paste.value.content) {
              // Fetch content in background without blocking UI
              setTimeout(() => {
                blobContent.fetchBlobContent(paste.uri);
              }, 0);
            }
          }

          return response.data.cursor; // Return cursor for pagination logic
        } else {
          console.error("API error:", response.data);
          setError(`API error: ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to load pastes:", err);
        setError(err instanceof Error ? err.message : "Failed to load pastes");
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, session?.did, blobContent],
  );

  const createPasteOperation = useCallback(
    async (form: CreatePasteForm) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return false;
      }

      if (!form.content.trim()) {
        setError("Content is required!");
        return false;
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
        const record = {
          $type: "moe.karashiiro.kpaste.paste",
          content: blobResponse.data.blob,
          title: form.title || undefined,
          language: form.language || "text",
          createdAt: new Date().toISOString(),
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
          await loadPastes();
          return true;
        } else {
          console.error("Create error:", createResponse.data);
          setError(`Failed to create paste: ${createResponse.status}`);
          return false;
        }
      } catch (err) {
        console.error("Failed to create paste:", err);
        setError(err instanceof Error ? err.message : "Failed to create paste");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, session?.did, loadPastes],
  );

  const updatePasteOperation = useCallback(
    async (form: EditPasteForm) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return false;
      }

      if (!form.content.trim()) {
        setError("Content is required!");
        return false;
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

        // Extract the record key from the URI
        const rkey = form.uri.split("/").pop();
        if (!rkey) {
          throw new Error("Invalid paste URI");
        }

        // Create the updated record
        const updatedRecord = {
          $type: "moe.karashiiro.kpaste.paste",
          content: blobResponse.data.blob,
          title: form.title || undefined,
          language: form.language || "text",
          createdAt: form.originalRecord.createdAt, // Keep original creation date
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
          await loadPastes();
          return true;
        } else {
          console.error("Update error:", updateResponse.data);
          setError(`Failed to update paste: ${updateResponse.status}`);
          return false;
        }
      } catch (err) {
        console.error("Failed to update paste:", err);
        setError(err instanceof Error ? err.message : "Failed to update paste");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, session?.did, loadPastes],
  );

  const deletePaste = useCallback(
    async (uri: string) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return;
      }

      if (!confirm("Are you sure you want to delete this paste?")) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Extract the record key from the URI
        const rkey = uri.split("/").pop();
        if (!rkey) {
          throw new Error("Invalid paste URI");
        }

        const response = await client.post("com.atproto.repo.deleteRecord", {
          input: {
            repo: session.did,
            collection: "moe.karashiiro.kpaste.paste",
            rkey,
          },
        });

        if (response.ok) {
          await loadPastes();
        } else {
          console.error("Delete error:", response.data);
          setError(`Failed to delete paste: ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to delete paste:", err);
        setError(err instanceof Error ? err.message : "Failed to delete paste");
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, session?.did, loadPastes],
  );

  // Edit functionality using form and operations
  const startEdit = useCallback(
    (paste: PasteListItem) => {
      if (!paste.content) {
        // Need to fetch content first before editing
        blobContent.fetchBlobContent(paste.uri).then(() => {
          const updatedPaste = pastes.find((p) => p.uri === paste.uri);
          if (updatedPaste?.content) {
            forms.setEditForm({
              uri: paste.uri,
              originalRecord: paste.value,
              title: paste.value.title || "",
              content: updatedPaste.content,
              language: paste.value.language || "text",
            });
          }
        });
      } else {
        forms.setEditForm({
          uri: paste.uri,
          originalRecord: paste.value,
          title: paste.value.title || "",
          content: paste.content,
          language: paste.value.language || "text",
        });
      }
    },
    [blobContent, pastes, forms],
  );

  // Wrapper functions for CRUD operations that handle form state
  const createPaste = useCallback(async () => {
    const success = await createPasteOperation(forms.createForm);
    if (success) {
      forms.resetForm();
      forms.setShowCreateForm(false);
    }
  }, [createPasteOperation, forms]);

  const updatePaste = useCallback(async () => {
    if (!forms.editForm) return;
    const success = await updatePasteOperation(forms.editForm);
    if (success) {
      forms.cancelEdit();
    }
  }, [updatePasteOperation, forms]);

  // Load pastes when authentication changes
  useEffect(() => {
    if (isAuthenticated && session) {
      loadPastes();
    }
  }, [isAuthenticated, session, loadPastes]);

  return {
    // State - now local to this hook
    pastes,
    loading,
    error,
    cursor,

    // Form state
    showCreateForm: forms.showCreateForm,
    createForm: forms.createForm,
    editForm: forms.editForm,

    // Actions - mix of local and form handling
    loadPastes,
    createPaste,
    updatePaste,
    deletePaste,
    fetchBlobContent: blobContent.fetchBlobContent,
    startEdit,
    cancelEdit: forms.cancelEdit,
    setShowCreateForm: forms.setShowCreateForm,
    setCreateForm: forms.setCreateForm,
    setEditForm: forms.setEditForm,
    resetForm: forms.resetForm,
  };
}
