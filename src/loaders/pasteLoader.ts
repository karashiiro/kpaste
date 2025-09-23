import { Client, simpleFetchHandler } from "@atcute/client";
import type { LoaderFunctionArgs } from "react-router";
import type { Main as PasteRecord } from "../lexicons/types/moe/karashiiro/kpaste/paste";

export interface PasteLoaderData {
  uri: string;
  cid: string;
  value: PasteRecord;
  handle: string;
  rkey: string;
  pdsUrl: string;
  content: string;
}

interface PlcDirectoryDoc {
  id: string;
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

export async function pasteLoader({
  params,
}: LoaderFunctionArgs): Promise<PasteLoaderData> {
  const { handle, rkey } = params;

  if (!handle || !rkey) {
    throw new Response("Invalid URL parameters", { status: 400 });
  }

  try {
    // Step 1: Resolve handle to DID using bsky.social
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

    // Step 2: Get user's PDS from plc.directory
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

    const pdsUrl = pdsService.serviceEndpoint;

    // Step 3: Get the paste record from user's PDS
    const pdsHandler = simpleFetchHandler({
      service: pdsUrl,
    });
    const pdsClient = new Client({ handler: pdsHandler });

    const recordResponse = await pdsClient.get("com.atproto.repo.getRecord", {
      params: {
        repo: did,
        collection: "moe.karashiiro.kpaste.paste",
        rkey: rkey!,
      },
    });

    if (!recordResponse.ok) {
      throw new Response("Paste not found", { status: 404 });
    }

    const pasteData = recordResponse.data;

    // Step 4: Load the blob content immediately
    const blobContent = (pasteData.value as PasteRecord).content;
    if (!blobContent || !("ref" in blobContent)) {
      throw new Response("Invalid blob reference in paste", { status: 500 });
    }

    const contentCid = blobContent.ref.$link;

    const blobHandler = simpleFetchHandler({
      service: pdsUrl,
    });
    const blobClient = new Client({ handler: blobHandler });

    const blobResponse = await blobClient.get("com.atproto.sync.getBlob", {
      params: {
        did: did,
        cid: contentCid,
      },
      as: "blob",
    });

    if (!blobResponse.ok) {
      throw new Response("Failed to load paste content", { status: 500 });
    }

    const blob = blobResponse.data as Blob;
    const content = await blob.text();

    return {
      uri: pasteData.uri,
      cid: pasteData.cid!,
      value: pasteData.value as PasteRecord,
      handle: handle!,
      rkey: rkey!,
      pdsUrl: pdsUrl!,
      content,
    };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    console.error("Failed to load paste:", error);
    throw new Response(
      error instanceof Error ? error.message : "Failed to load paste",
      { status: 500 },
    );
  }
}
