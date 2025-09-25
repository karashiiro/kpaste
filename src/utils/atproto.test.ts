import { describe, it, expect } from "vitest";
import { isAtUri } from "./atproto";

describe("atproto utils", () => {
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
