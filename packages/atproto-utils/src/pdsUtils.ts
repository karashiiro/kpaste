import { Client, simpleFetchHandler } from "@atcute/client";
import type { Did, ResourceUri } from "@atcute/lexicons";
import { data } from "react-router";

interface MiniDidDocument {
  did: Did;
  pds: string;
}

export interface ResolveUserPdsResult {
  did: Did;
  pdsUrl: string;
}

export async function resolveUser(
  handle: string,
): Promise<ResolveUserPdsResult> {
  // Resolve handle to DID/PDS using slingshot
  // TODO: Have some sort of fallback - manual PDS resolution is annoying though
  const endpoint = new URL(
    "https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc",
  );
  endpoint.searchParams.set("identifier", handle);

  const resolveResponse = await fetch(endpoint);
  if (!resolveResponse.ok) {
    throw data(`Failed to resolve handle: ${handle}`, {
      status: 404,
    });
  }

  const miniDidDocument: MiniDidDocument = await resolveResponse.json();
  const { did, pds } = miniDidDocument;

  return { did, pdsUrl: pds };
}

export interface AtProtoRecord {
  uri: ResourceUri;
  value: Record<string, unknown>;
  cid?: string | undefined;
}

async function getRecordCore(
  endpoint: string,
  collection: string,
  did: Did,
  rkey: string,
): Promise<AtProtoRecord> {
  const handler = simpleFetchHandler({
    service: endpoint,
  });
  const client = new Client<any>({ handler: handler });
  const recordResponse = await client.get("com.atproto.repo.getRecord", {
    params: {
      repo: did,
      collection: collection as `${string}.${string}.${string}`,
      rkey: rkey,
    },
  });

  if (!recordResponse.ok) {
    throw data("Record not found", { status: 404 });
  }

  return recordResponse.data as AtProtoRecord;
}

export async function getRecord(
  endpoint: string,
  collection: string,
  did: Did,
  rkey: string,
  useSlingshotFallback = true,
): Promise<AtProtoRecord> {
  if (useSlingshotFallback) {
    try {
      // Prefer slingshot for performance
      return await getRecordCore(
        "https://slingshot.microcosm.blue",
        collection,
        did,
        rkey,
      );
    } catch (error) {
      console.error("Not found on slingshot, trying user's PDS:", error);
      return await getRecordCore(endpoint, collection, did, rkey);
    }
  } else {
    return await getRecordCore(endpoint, collection, did, rkey);
  }
}

async function readTextBlob(client: Client<any>, did: Did, blobCid: string) {
  const blobResponse = await client.get("com.atproto.sync.getBlob", {
    params: {
      did: did,
      cid: blobCid,
    },
    as: "blob",
  });

  if (!blobResponse.ok) {
    throw data("Failed to load paste content", { status: 500 });
  }

  const blob = blobResponse.data;

  // Priority 1: ArrayBuffer (most common in Node.js)
  if (blob instanceof ArrayBuffer) {
    return new TextDecoder().decode(blob);
  }

  // Priority 2: Uint8Array
  if (blob instanceof Uint8Array) {
    return new TextDecoder().decode(blob);
  }

  // Priority 3: Node.js Buffer
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(blob)) {
    return blob.toString("utf-8");
  }

  // Priority 4: Try arrayBuffer() method (handles both Blob and Response objects)
  if (
    typeof blob === "object" &&
    blob !== null &&
    "arrayBuffer" in blob &&
    typeof blob.arrayBuffer === "function"
  ) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      if (arrayBuffer instanceof ArrayBuffer) {
        return new TextDecoder().decode(arrayBuffer);
      }
    } catch (error) {
      console.warn("blob.arrayBuffer() failed:", error);
    }
  }

  // Priority 5: Try text() method (for proper Blob objects)
  if (
    typeof blob === "object" &&
    blob !== null &&
    "text" in blob &&
    typeof blob.text === "function"
  ) {
    try {
      const result = await blob.text();
      if (typeof result === "string") {
        return result;
      }
    } catch (error) {
      console.warn("blob.text() failed:", error);
    }
  }

  // Last resort: throw error with debug info
  throw data(
    `Unable to convert blob to text. Type: ${typeof blob}, Constructor: ${blob?.constructor?.name}, Keys: ${blob ? Object.keys(blob).join(", ") : "none"}`,
    { status: 500 },
  );
}

export async function getTextBlob(
  pdsUrl: string,
  did: Did,
  blobCid: string,
): Promise<string> {
  const blobHandler = simpleFetchHandler({
    service: pdsUrl,
  });
  const blobClient = new Client<any>({ handler: blobHandler });
  return await readTextBlob(blobClient, did, blobCid);
}

export async function getTextBlobs(
  pdsUrl: string,
  did: Did,
  blobCids: string[],
): Promise<string[]> {
  const blobHandler = simpleFetchHandler({
    service: pdsUrl,
  });
  const blobClient = new Client<any>({ handler: blobHandler });
  return await Promise.all(
    blobCids.map((cid) => readTextBlob(blobClient, did, cid)),
  );
}

export function parseAtUri(
  uri: string,
): { did: string; collection: string; rkey: string } | null {
  // Example URI: at://did:plc:abc123/com.example.collection/xyz789
  const match = uri.match(/^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!match) return null;

  const did = match[1];
  const collection = match[2];
  const rkey = match[3];

  return { did, collection, rkey };
}
