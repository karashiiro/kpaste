import { Client, simpleFetchHandler } from "@atcute/client";
import type { Did } from "@atcute/lexicons";
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
  // Resolve handle to DID using slingshot
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
