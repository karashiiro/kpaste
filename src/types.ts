import type { Main as PasteRecord } from "./lexicons/types/moe/karashiiro/kpaste/paste";

export type { PasteRecord };

export interface PasteListItem {
  uri: string;
  value: PasteRecord;
  content: string;
  contentLoading?: boolean; // Loading state for blob fetch
}
