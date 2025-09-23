import { Client, simpleFetchHandler } from "@atcute/client";
import type { LoaderFunctionArgs } from "react-router";
import type { Main as PasteRecord } from "../lexicons/types/moe/karashiiro/kpaste/paste";
import type { PasteListItem } from "../types";
import { getTextBlobs, resolveUser } from "../pdsUtils";

export interface PasteListLoaderData {
  pastes: PasteListItem[];
  prevCursor?: string;
  nextCursor?: string;
}

export async function pasteListLoader({
  params,
}: LoaderFunctionArgs): Promise<PasteListLoaderData> {
  const { handle } = params;
  const query = new URLSearchParams(window.location.search);
  const after = query.get("after");

  if (!handle) {
    throw new Response("Invalid URL parameters", { status: 400 });
  }

  try {
    const { did, pdsUrl } = await resolveUser(handle);

    const pdsHandler = simpleFetchHandler({
      service: pdsUrl,
    });
    const pdsClient = new Client({ handler: pdsHandler });

    const recordsResponse = await pdsClient.get(
      "com.atproto.repo.listRecords",
      {
        params: {
          repo: did,
          collection: "moe.karashiiro.kpaste.paste",
          limit: 20,
          cursor: after || undefined,
        },
      },
    );

    if (!recordsResponse.ok) {
      throw new Response("Pastes not found", { status: 404 });
    }

    const pastesData = recordsResponse.data;

    // Load the blob content
    const contentCids = recordsResponse.data.records.map((rec) => {
      const value = rec.value as PasteRecord;
      if (!value.content || !("ref" in value.content)) {
        throw new Response("Invalid blob reference in paste", { status: 500 });
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
      prevCursor: after || undefined,
      nextCursor: pastesData.cursor,
    };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    console.error("Failed to load pastes:", error);
    throw new Response(
      error instanceof Error ? error.message : "Failed to load pastes",
      { status: 500 },
    );
  }
}
