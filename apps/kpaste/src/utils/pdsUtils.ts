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

interface PasteRecord {
  uri: ResourceUri;
  value: Record<string, unknown>;
  cid?: string | undefined;
}

async function getPasteRecordCore(
  endpoint: string,
  did: Did,
  rkey: string,
): Promise<PasteRecord> {
  const handler = simpleFetchHandler({
    service: endpoint,
  });
  const client = new Client({ handler: handler });
  const recordResponse = await client.get("com.atproto.repo.getRecord", {
    params: {
      repo: did,
      collection: "moe.karashiiro.kpaste.paste",
      rkey: rkey,
    },
  });

  if (!recordResponse.ok) {
    throw data("Paste not found", { status: 404 });
  }

  return recordResponse.data;
}

export async function getPasteRecord(
  endpoint: string,
  did: Did,
  rkey: string,
): Promise<PasteRecord> {
  try {
    // Prefer slingshot for performance
    return await getPasteRecordCore(
      "https://slingshot.microcosm.blue",
      did,
      rkey,
    );
  } catch (error) {
    console.error("Not found on slingshot, trying user's PDS:", error);
    return await getPasteRecordCore(endpoint, did, rkey);
  }
}

async function readTextBlob(client: Client, did: Did, blobCid: string) {
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

  const blob = blobResponse.data as Blob;
  const content = await blob.text();

  return content;
}

export async function getTextBlob(
  pdsUrl: string,
  did: Did,
  blobCid: string,
): Promise<string> {
  const blobHandler = simpleFetchHandler({
    service: pdsUrl,
  });
  const blobClient = new Client({ handler: blobHandler });
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
  const blobClient = new Client({ handler: blobHandler });
  return await Promise.all(
    blobCids.map((cid) => readTextBlob(blobClient, did, cid)),
  );
}

export function parseAtUri(
  uri: string,
): { handle: string; rkey: string } | null {
  // Example URI: at://did:plc:abc123/moe.karashiiro.kpaste.paste/xyz789
  const match = uri.match(/^at:\/\/([^/]+)\/[^/]+\/([^/]+)$/);
  if (!match) return null;

  const did = match[1];
  const rkey = match[2];

  return { handle: did, rkey };
}
