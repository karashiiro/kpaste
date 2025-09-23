import { describe, it, expect } from "vitest";
import { getAtProtoViewerUrl, isAtUri } from "./atproto";

describe("atproto utils", () => {
  describe("getAtProtoViewerUrl", () => {
    it("should generate correct viewer URL with proper encoding", () => {
      const uri = "at://did:plc:abc123/moe.karashiiro.kpaste.paste/xyz789";
      const result = getAtProtoViewerUrl(uri);
      expect(result).toBe(
        "https://atproto.at/viewer?uri=at%3A%2F%2Fdid%3Aplc%3Aabc123%2Fmoe.karashiiro.kpaste.paste%2Fxyz789",
      );
    });

    it("should handle URIs with special characters", () => {
      const uri = "at://did:plc:test/collection/key with spaces & symbols!";
      const result = getAtProtoViewerUrl(uri);
      expect(result).toBe(
        "https://atproto.at/viewer?uri=at%3A%2F%2Fdid%3Aplc%3Atest%2Fcollection%2Fkey%20with%20spaces%20%26%20symbols!",
      );
    });

    it("should handle empty string", () => {
      const result = getAtProtoViewerUrl("");
      expect(result).toBe("https://atproto.at/viewer?uri=");
    });
  });

  describe("isAtUri", () => {
    it("should return true for valid AT URI format", () => {
      expect(isAtUri("at://did:plc:abc123/collection/record")).toBe(true);
      expect(isAtUri("at://handle.example.com/collection/record")).toBe(true);
      expect(isAtUri("at://")).toBe(true);
    });

    it("should return false for invalid formats", () => {
      expect(isAtUri("https://example.com")).toBe(false);
      expect(isAtUri("http://at://invalid")).toBe(false);
      expect(isAtUri("did:plc:abc123")).toBe(false);
      expect(isAtUri("")).toBe(false);
      expect(isAtUri("AT://uppercase")).toBe(false); // case sensitive
    });
  });
});
