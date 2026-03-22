import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseAtUri, resolveUser, getTextBlobs } from "./pdsUtils";

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

  describe("resolveUser", () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      globalThis.fetch = vi.fn();
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it("should resolve handle to DID and PDS", async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            did: "did:plc:egymjjk6rg6td4wzhyxqnwlm",
            pds: "https://pds.bsky.ln4.net",
          }),
      });

      const result = await resolveUser("karashiiro.moe");

      expect(result).toMatchObject({
        did: expect.stringMatching(/^did:plc:/),
        pdsUrl: expect.stringMatching(/^https?:\/\/.+/),
        handle: "karashiiro.moe",
      });
      expect(result.did).toBeDefined();
      expect(result.pdsUrl).toBeDefined();
    });

    it("should throw error for non-existent handle", async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(
        resolveUser("definitely-not-a-real-handle-12345.bsky.social"),
      ).rejects.toThrow();
    });

    it("should throw error for invalid handle format", async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(resolveUser("invalid-handle-no-domain")).rejects.toThrow();
    });
  });

  describe("getTextBlobs", () => {
    it("should handle empty blob CID array", async () => {
      const pdsUrl = "https://pds.example.com";
      const did = "did:plc:test123";

      const result = await getTextBlobs(pdsUrl, did, []);
      expect(result).toEqual([]);
    });
  });
});
