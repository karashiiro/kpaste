import type { Main as PasteRecord } from "@kpaste/lexicon/types";

export type { PasteRecord };

export interface PasteListItem {
  uri: string;
  value: PasteRecord;
  content: string;
}
