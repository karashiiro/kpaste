import { describe, it, expect } from "vitest";
import { parseAtUri, resolveUser, getTextBlob, getTextBlobs } from "./pdsUtils";

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
    it("should resolve karashiiro.moe handle to DID and PDS", async () => {
      const result = await resolveUser("karashiiro.moe");

      expect(result).toMatchObject({
        did: expect.stringMatching(/^did:plc:/),
        pdsUrl: expect.stringMatching(/^https?:\/\/.+/),
      });
      expect(result.did).toBeDefined();
      expect(result.pdsUrl).toBeDefined();
    }, 10000);

    it("should throw error for non-existent handle", async () => {
      await expect(
        resolveUser("definitely-not-a-real-handle-12345.bsky.social"),
      ).rejects.toThrow();
    }, 10000);

    it("should throw error for invalid handle format", async () => {
      await expect(resolveUser("invalid-handle-no-domain")).rejects.toThrow();
    }, 10000);
  });

  describe("getTextBlob", () => {
    it("should fetch real blob content from karashiiro.moe's test paste", async () => {
      // Using real test data from /p/karashiiro.moe/3lzthufbnv22z
      const pdsUrl = "https://pds.bsky.ln4.net";
      const did = "did:plc:egymjjk6rg6td4wzhyxqnwlm";
      const blobCid =
        "bafkreigjuw53y3lsz5wpsy5ciey6apyj67w2oslhpjq45rtvto6mdq44hm";
      const expectedContent = 'const test = "This is a test.";';

      const content = await getTextBlob(pdsUrl, did, blobCid);

      expect(content).toBe(expectedContent);
      expect(content.length).toBe(31);
    }, 10000);

    it("should throw error for non-existent blob", async () => {
      const pdsUrl = "https://pds.bsky.ln4.net";
      const did = "did:plc:egymjjk6rg6td4wzhyxqnwlm";

      await expect(
        getTextBlob(pdsUrl, did, "nonexistent-cid-12345"),
      ).rejects.toThrow();
    }, 10000);
  });

  describe("getTextBlobs", () => {
    it("should handle empty blob CID array", async () => {
      const pdsUrl = "https://pds.bsky.ln4.net";
      const did = "did:plc:egymjjk6rg6td4wzhyxqnwlm";

      const result = await getTextBlobs(pdsUrl, did, []);
      expect(result).toEqual([]);
    }, 10000);

    it("should fetch multiple real blob contents", async () => {
      // Using real test data - testing with the same blob twice to verify batch fetching
      const pdsUrl = "https://pds.bsky.ln4.net";
      const did = "did:plc:egymjjk6rg6td4wzhyxqnwlm";
      const blobCid =
        "bafkreigjuw53y3lsz5wpsy5ciey6apyj67w2oslhpjq45rtvto6mdq44hm";
      const expectedContent = 'const test = "This is a test.";';

      const result = await getTextBlobs(pdsUrl, did, [blobCid, blobCid]);

      expect(result).toEqual([expectedContent, expectedContent]);
      expect(result).toHaveLength(2);
    }, 10000);

    it("should throw error for array with non-existent blobs", async () => {
      const pdsUrl = "https://pds.bsky.ln4.net";
      const did = "did:plc:egymjjk6rg6td4wzhyxqnwlm";

      await expect(
        getTextBlobs(pdsUrl, did, ["fake1", "fake2"]),
      ).rejects.toThrow();
    }, 10000);
  });
});
