import { data, type LoaderFunctionArgs } from "react-router";
import type { Main as PasteRecord } from "@kpaste/lexicon/types";
import { getPasteRecord, getTextBlob, resolveUser } from "../utils/pdsUtils";

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
    throw data("Invalid URL parameters", { status: 400 });
  }

  const { did, pdsUrl } = await resolveUser(handle);

  const pasteData = await getPasteRecord(pdsUrl, did, rkey);

  // Load the blob content
  const blobContent = (pasteData.value as PasteRecord).content;
  if (!blobContent || !("ref" in blobContent)) {
    throw data("Invalid blob reference in paste", { status: 500 });
  }

  const contentCid = blobContent.ref.$link;
  const content = await getTextBlob(pdsUrl, did, contentCid);

  return {
    uri: pasteData.uri,
    cid: pasteData.cid!,
    value: pasteData.value as PasteRecord,
    handle,
    rkey,
    pdsUrl,
    content,
  };
}
