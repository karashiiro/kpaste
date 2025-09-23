import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import type { Main as PasteRecord } from "../lexicons/types/moe/karashiiro/kpaste/paste";

export interface PasteListItem {
  uri: string;
  value: PasteRecord;
  content?: string; // Fetched blob content
  contentLoading?: boolean; // Loading state for blob fetch
}

export interface CreatePasteForm {
  title: string;
  content: string;
  language: string;
  expiresAt: string;
}

export interface UsePasteManagerReturn {
  // State
  pastes: PasteListItem[];
  loading: boolean;
  error: string | null;

  // Form state
  showCreateForm: boolean;
  createForm: CreatePasteForm;

  // Actions
  loadPastes: () => Promise<void>;
  createPaste: () => Promise<void>;
  deletePaste: (uri: string) => Promise<void>;
  fetchBlobContent: (pasteUri: string) => Promise<void>;
  setShowCreateForm: (show: boolean) => void;
  setCreateForm: React.Dispatch<React.SetStateAction<CreatePasteForm>>;
  resetForm: () => void;
}

const defaultCreateForm: CreatePasteForm = {
  title: "",
  content: "",
  language: "text",
  expiresAt: "",
};

export function usePasteManager(): UsePasteManagerReturn {
  const { getClient, isAuthenticated, session } = useAuth();
  const [pastes, setPastes] = useState<PasteListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreatePasteForm>(defaultCreateForm);

  const loadPastes = useCallback(async () => {
    const client = getClient();
    if (!client || !isAuthenticated || !session?.did) {
      setError("Not authenticated or missing DID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use com.atproto.repo.listRecords to get our pastes (it's a query, so use get())
      const response = await client.get("com.atproto.repo.listRecords", {
        params: {
          repo: session.did,
          collection: "moe.karashiiro.kpaste.paste",
          limit: 50,
        },
      });

      if (response.ok) {
        // The response records need to be cast more carefully
        setPastes(response.data.records as unknown as PasteListItem[]);
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
  }, [getClient, isAuthenticated, session?.did]);

  const createPaste = useCallback(async () => {
    const client = getClient();
    if (!client || !isAuthenticated || !session?.did) {
      setError("Not authenticated");
      return;
    }

    if (!createForm.content.trim()) {
      setError("Content is required!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a blob for the content
      const contentBlob = new Blob([createForm.content], {
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
        title: createForm.title || undefined,
        language: createForm.language || "text",
        createdAt: new Date().toISOString(),
        expiresAt: createForm.expiresAt
          ? new Date(createForm.expiresAt).toISOString()
          : undefined,
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
        // Reset form and refresh list
        setCreateForm(defaultCreateForm);
        setShowCreateForm(false);
        await loadPastes();
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
  }, [getClient, isAuthenticated, session?.did, createForm, loadPastes]);

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
          setError(`Failed to fetch content: ${response.status}`);
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
    [getClient, isAuthenticated, session?.did, pastes],
  );

  const resetForm = useCallback(() => {
    setCreateForm(defaultCreateForm);
  }, []);

  // Load pastes when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadPastes();
    }
  }, [isAuthenticated, loadPastes]);

  return {
    // State
    pastes,
    loading,
    error,

    // Form state
    showCreateForm,
    createForm,

    // Actions
    loadPastes,
    createPaste,
    deletePaste,
    fetchBlobContent,
    setShowCreateForm,
    setCreateForm,
    resetForm,
  };
}
