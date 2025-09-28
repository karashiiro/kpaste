import { Client, simpleFetchHandler } from "@atcute/client";
import type { LoaderFunctionArgs } from "react-router";
import type { Main as PasteRecord } from "../lexicons/types/moe/karashiiro/kpaste/paste";
import { getTextBlob, resolveUser } from "../utils/pdsUtils";

export interface PasteLoaderData {
  uri: string;
  cid: string;
  value: PasteRecord;
  handle: string;
  rkey: string;
  pdsUrl: string;
  content: string;
}

export async function pasteLoader({
  params,
}: LoaderFunctionArgs): Promise<PasteLoaderData> {
  const { handle, rkey } = params;

  if (!handle || !rkey) {
    throw new Response("Invalid URL parameters", { status: 400 });
  }

  try {
    const { did, pdsUrl } = await resolveUser(handle);

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

    // Load the blob content
    const blobContent = (pasteData.value as PasteRecord).content;
    if (!blobContent || !("ref" in blobContent)) {
      throw new Response("Invalid blob reference in paste", { status: 500 });
    }

    const contentCid = blobContent.ref.$link;
    const content = await getTextBlob(pdsUrl, did, contentCid);

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
