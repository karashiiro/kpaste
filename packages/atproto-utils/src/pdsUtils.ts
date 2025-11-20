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

/**
 * Converts a buffer-like object to a string using TextDecoder or Buffer.toString()
 */
function decodeBuffer(
  buffer: ArrayBuffer | Uint8Array | Buffer | unknown,
): string | null {
  if (buffer instanceof ArrayBuffer || buffer instanceof Uint8Array) {
    return new TextDecoder().decode(buffer);
  }
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(buffer)) {
    return buffer.toString("utf-8");
  }
  return null;
}

/**
 * Reads a blob using the stream() method by consuming all chunks
 */
async function readBlobStream(blob: any): Promise<string | null> {
  if (typeof blob.stream !== "function") {
    return null;
  }

  const stream = blob.stream();
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(combined);
}

/**
 * Attempts to extract buffer data from legacy Blob objects by checking internal properties
 */
function extractLegacyBlobBuffer(blob: any): string | null {
  // Check common internal buffer property names
  const bufferProps = [
    "_buffer",
    "buffer",
    "data",
    "_data",
    "_blob",
    "content",
    "_content",
  ];

  for (const prop of bufferProps) {
    if (prop in blob) {
      const decoded = decodeBuffer(blob[prop]);
      if (decoded) return decoded;
    }
  }

  // Scan all own properties (including non-enumerable)
  const allProps = Object.getOwnPropertyNames(blob);
  for (const prop of allProps) {
    try {
      const decoded = decodeBuffer(blob[prop]);
      if (decoded) return decoded;
    } catch {
      // Ignore property access errors
    }
  }

  return null;
}

/**
 * Reads a blob using FileReader (browser environments only)
 */
async function readBlobWithFileReader(blob: any): Promise<string | null> {
  if (typeof FileReader === "undefined" || blob.size === undefined) {
    return null;
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
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

  // Try direct buffer types
  const directBuffer = decodeBuffer(blob);
  if (directBuffer) return directBuffer;

  // Try modern Blob methods
  if (blob && typeof blob === "object") {
    // Try arrayBuffer() method
    if (typeof blob.arrayBuffer === "function") {
      const arrayBuffer = await blob.arrayBuffer();
      return new TextDecoder().decode(arrayBuffer);
    }

    // Try text() method
    if (typeof blob.text === "function") {
      return await blob.text();
    }

    // Try stream() method
    const streamResult = await readBlobStream(blob);
    if (streamResult) return streamResult;
  }

  // Handle legacy Blob objects (Node.js polyfills)
  if (blob && typeof blob === "object" && blob.constructor?.name === "Blob") {
    // Try extracting internal buffer
    const legacyBuffer = extractLegacyBlobBuffer(blob);
    if (legacyBuffer) return legacyBuffer;

    // Last resort: FileReader (browser environments)
    const fileReaderResult = await readBlobWithFileReader(blob);
    if (fileReaderResult) return fileReaderResult;
  }

  // If all else fails, throw an error
  throw data("Unable to convert blob to text", { status: 500 });
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
