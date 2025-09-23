/**
 * Generate a clickable link to the ATProto viewer for the given AT URI
 */
export function getAtProtoViewerUrl(uri: string): string {
  return `https://atproto.at/viewer?uri=${encodeURIComponent(uri)}`;
}

/**
 * Check if a string is a valid AT URI format
 */
export function isAtUri(uri: string): boolean {
  return uri.startsWith("at://");
}
