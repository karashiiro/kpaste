import { Client, simpleFetchHandler } from "@atcute/client";
import type { Did } from "@atcute/lexicons";

interface PlcDirectoryDoc {
  id: string;
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

export interface ResolveUserPdsResult {
  did: Did;
  pdsUrl: string;
}

export async function resolveUser(
  handle: string,
): Promise<ResolveUserPdsResult> {
  // Resolve handle to DID using bsky.social
  const bskyHandler = simpleFetchHandler({
    service: "https://bsky.social",
  });
  const bskyClient = new Client({ handler: bskyHandler });

  const resolveResponse = await bskyClient.get(
    "com.atproto.identity.resolveHandle",
    {
      params: { handle: handle as `${string}.${string}` },
    },
  );

  if (!resolveResponse.ok) {
    throw new Response(`Failed to resolve handle: ${handle}`, {
      status: 404,
    });
  }

  const did = resolveResponse.data.did;

  // Get user's PDS from plc.directory
  const plcUrl = `https://plc.directory/${did}`;
  const plcResponse = await fetch(plcUrl);

  if (!plcResponse.ok) {
    throw new Response(`Failed to get PDS for DID: ${did}`, { status: 404 });
  }

  const plcDoc: PlcDirectoryDoc = await plcResponse.json();

  // Find the atproto_pds service
  const pdsService = plcDoc.service?.find(
    (s) => s.type === "AtprotoPersonalDataServer" || s.id === "#atproto_pds",
  );

  if (!pdsService) {
    throw new Response("No PDS found for user", { status: 404 });
  }

  return { did, pdsUrl: pdsService.serviceEndpoint };
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
    throw new Response("Failed to load paste content", { status: 500 });
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
