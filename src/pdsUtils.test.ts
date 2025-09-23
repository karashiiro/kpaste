import { describe, it, expect } from "vitest";
import { parseAtUri } from "./pdsUtils";

describe("pdsUtils", () => {
  describe("parseAtUri", () => {
    it("should parse valid AT URI correctly", () => {
      const uri = "at://did:plc:abc123/moe.karashiiro.kpaste.paste/xyz789";
      const result = parseAtUri(uri);
      expect(result).toEqual({
        handle: "did:plc:abc123",
        rkey: "xyz789",
      });
    });

    it("should parse AT URI with different collection", () => {
      const uri = "at://handle.bsky.social/app.bsky.feed.post/record123";
      const result = parseAtUri(uri);
      expect(result).toEqual({
        handle: "handle.bsky.social",
        rkey: "record123",
      });
    });

    it("should return null for invalid URI format", () => {
      expect(parseAtUri("invalid-uri")).toBe(null);
      expect(parseAtUri("at://incomplete")).toBe(null);
      expect(parseAtUri("at://did:plc:abc123/collection")).toBe(null); // missing rkey
      expect(parseAtUri("at://did:plc:abc123/collection/rkey/extra")).toBe(
        null,
      ); // too many parts
      expect(parseAtUri("")).toBe(null);
    });

    it("should handle DIDs with complex formats", () => {
      const uri =
        "at://did:plc:abc123def456ghi789/com.example.app.record/key-with-dashes";
      const result = parseAtUri(uri);
      expect(result).toEqual({
        handle: "did:plc:abc123def456ghi789",
        rkey: "key-with-dashes",
      });
    });

    it("should handle URIs with special characters in rkey", () => {
      const uri =
        "at://did:plc:test123/collection.name/rkey_with-special.chars";
      const result = parseAtUri(uri);
      expect(result).toEqual({
        handle: "did:plc:test123",
        rkey: "rkey_with-special.chars",
      });
    });
  });
});
