import type { Main as PasteRecord } from "@kpaste-app/lexicon/types";

export type { PasteRecord };

export interface PasteListItem {
  uri: string;
  value: PasteRecord;
  content: string;
}
