import { Client, simpleFetchHandler } from "@atcute/client";
import { data, type LoaderFunctionArgs } from "react-router";
import type { Main as PasteRecord } from "../lexicons/types/moe/karashiiro/kpaste/paste";
import type { PasteListItem } from "../types";
import { getTextBlobs, resolveUser } from "../utils/pdsUtils";

export interface PasteListLoaderData {
  pastes: PasteListItem[];
  prevCursor?: string;
  cursor?: string;
  nextCursor?: string;
}

function getSearchString(url: string): string {
  const parsedUrl = new URL(url);
  return (
    parsedUrl.search || parsedUrl.hash.slice(parsedUrl.hash.indexOf("?")) || ""
  );
}

export async function pasteListLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<PasteListLoaderData> {
  const { handle } = params;
  const query = new URLSearchParams(getSearchString(request.url));
  const prevCursor = query.get("prev");
  const cursor = query.get("cursor");

  if (!handle) {
    throw data("Invalid URL parameters", { status: 400 });
  }

  const { did, pdsUrl } = await resolveUser(handle);

  const pdsHandler = simpleFetchHandler({
    service: pdsUrl,
  });
  const pdsClient = new Client({ handler: pdsHandler });

  const recordsResponse = await pdsClient.get("com.atproto.repo.listRecords", {
    params: {
      repo: did,
      collection: "moe.karashiiro.kpaste.paste",
      limit: 20,
      cursor: cursor || undefined,
    },
  });

  if (!recordsResponse.ok) {
    throw data("Pastes not found", { status: 404 });
  }

  const pastesData = recordsResponse.data;

  // Load the blob content
  const contentCids = recordsResponse.data.records.map((rec) => {
    const value = rec.value as PasteRecord;
    if (!value.content || !("ref" in value.content)) {
      throw data("Invalid blob reference in paste", { status: 500 });
    }
    return value.content.ref.$link;
  });
  const contents = await getTextBlobs(pdsUrl, did, contentCids);

  return {
    pastes: pastesData.records.map((rec, index) => ({
      uri: rec.uri,
      value: rec.value as PasteRecord,
      content: contents[index],
    })),
    prevCursor: prevCursor || undefined,
    cursor: cursor || undefined,
    nextCursor: cursor === pastesData.cursor ? undefined : pastesData.cursor,
  };
}
