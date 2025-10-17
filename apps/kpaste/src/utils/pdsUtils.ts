import type { Did, ResourceUri } from "@atcute/lexicons";
import {
  getRecord,
  getTextBlob as getTextBlobGeneric,
  getTextBlobs as getTextBlobsGeneric,
  parseAtUri as parseAtUriGeneric,
} from "@kpaste-app/atproto-utils";

// Re-export generic functions that don't need wrapping
export {
  resolveUser,
  type ResolveUserPdsResult,
} from "@kpaste-app/atproto-utils";

// Define paste collection constant
const PASTE_COLLECTION = "moe.karashiiro.kpaste.paste";

// Paste-specific record interface
export interface PasteRecord {
  uri: ResourceUri;
  value: Record<string, unknown>;
  cid?: string | undefined;
}

// Paste-specific wrapper for getRecord
export async function getPasteRecord(
  endpoint: string,
  did: Did,
  rkey: string,
): Promise<PasteRecord> {
  return (await getRecord(
    endpoint,
    PASTE_COLLECTION,
    did,
    rkey,
  )) as PasteRecord;
}

// Re-export generic blob functions
export const getTextBlob = getTextBlobGeneric;
export const getTextBlobs = getTextBlobsGeneric;

// Paste-specific wrapper for parseAtUri
export function parseAtUri(
  uri: string,
): { handle: string; rkey: string } | null {
  const result = parseAtUriGeneric(uri);
  if (!result) return null;

  // Return in the expected format for backward compatibility
  return { handle: result.did, rkey: result.rkey };
}
