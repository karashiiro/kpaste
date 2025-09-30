import { Client, simpleFetchHandler } from "@atcute/client";
import type { Did } from "@atcute/lexicons";
import { data } from "react-router";

interface DidDocument {
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
    throw data(`Failed to resolve handle: ${handle}`, {
      status: 404,
    });
  }

  const did = resolveResponse.data.did;

  // Split the DID to get the type
  const [didType] = did.split(":").slice(1);

  // Fetch the DID document from the appropriate service
  if (didType === "plc") {
    return await resolveUserPlc(did);
  } else if (didType === "web") {
    return await resolveUserWeb(did);
  } else {
    throw data(`Unsupported DID type: ${didType}`, { status: 400 });
  }
}

async function resolveUserPlc(did: Did): Promise<ResolveUserPdsResult> {
  // Get user's PDS from plc.directory
  const plcUrl = `https://plc.directory/${did}`;
  const plcResponse = await fetch(plcUrl);

  if (!plcResponse.ok) {
    throw data(`Failed to get PDS for DID: ${did}`, { status: 404 });
  }

  const didDoc: DidDocument = await plcResponse.json();
  const pdsService = extractPdsFromDidDocument(didDoc);

  return { did, pdsUrl: pdsService };
}

async function resolveUserWeb(did: Did): Promise<ResolveUserPdsResult> {
  // Fetch the DID document from the well-known endpoint
  const [endpoint] = did.split(":").slice(2);
  const didUrl = `https://${endpoint}/.well-known/did.json`;
  const didResponse = await fetch(didUrl);

  if (!didResponse.ok) {
    throw data(`Failed to get DID document for: ${did}`, { status: 404 });
  }

  const didDoc = await didResponse.json();
  const pdsService = extractPdsFromDidDocument(didDoc);

  return { did, pdsUrl: pdsService };
}

function extractPdsFromDidDocument(doc: DidDocument): string {
  // Find the atproto_pds service
  const pdsService = doc.service?.find(
    (s) => s.type === "AtprotoPersonalDataServer" || s.id === "#atproto_pds",
  );

  if (!pdsService) {
    throw data("No PDS found for user", { status: 404 });
  }

  return pdsService.serviceEndpoint;
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
