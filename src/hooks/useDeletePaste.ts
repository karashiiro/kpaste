import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";

export function useDeletePaste() {
  const { getClient, isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Validate URI format and extract the record key
      if (
        !uri.startsWith("at://") ||
        !uri.includes("moe.karashiiro.kpaste.paste")
      ) {
        setError("Invalid paste URI");
        return;
      }

      const rkey = uri.split("/").pop();
      if (!rkey || rkey === "moe.karashiiro.kpaste.paste") {
        setError("Invalid paste URI");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await client.post("com.atproto.repo.deleteRecord", {
          input: {
            repo: session.did,
            collection: "moe.karashiiro.kpaste.paste",
            rkey,
          },
        });

        if (response.ok) {
          location.reload(); // Reload the page to reflect changes
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
    [getClient, isAuthenticated, session?.did],
  );

  return { deletePaste, loading, error };
}
