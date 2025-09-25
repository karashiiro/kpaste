/**
 * Check if a string is a valid AT URI format
 */
export function isAtUri(uri: string): boolean {
  return uri.startsWith("at://");
}
