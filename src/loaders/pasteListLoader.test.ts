import { describe, it, expect } from "vitest";
import { pasteListLoader } from "./pasteListLoader";
import type { LoaderFunctionArgs } from "react-router";

describe("pasteListLoader", () => {
  it("should load real paste list from karashiiro.moe", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
      },
      request: new Request("http://localhost/pastes/karashiiro.moe"),
      context: {},
    };

    const result = await pasteListLoader(mockArgs);

    expect(result).toMatchObject({
      pastes: expect.arrayContaining([
        expect.objectContaining({
          uri: expect.stringMatching(/^at:\/\/did:plc:/),
          value: expect.objectContaining({
            title: expect.any(String),
            language: expect.any(String),
            createdAt: expect.stringMatching(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
            ),
          }),
          content: expect.any(String),
        }),
      ]),
    });

    expect(result.pastes.length).toBeGreaterThan(0);
    expect(result.pastes.length).toBeLessThanOrEqual(20); // default limit

    // Check if our test paste is in the list
    const testPaste = result.pastes.find(
      (paste) => paste.value.title === "[DO NOT DELETE] Test data",
    );
    expect(testPaste).toBeDefined();
    expect(testPaste?.content).toBe('const test = "This is a test.";');
  }, 15000);

  it("should handle pagination with cursor parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
      },
      request: new Request(
        "http://localhost/pastes/karashiiro.moe?cursor=some-cursor",
      ),
      context: {},
    };

    const result = await pasteListLoader(mockArgs);

    expect(result).toMatchObject({
      pastes: expect.any(Array),
      cursor: "some-cursor",
    });
  }, 15000);

  it("should handle previous cursor parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
      },
      request: new Request(
        "http://localhost/pastes/karashiiro.moe?prev=prev-cursor&cursor=current-cursor",
      ),
      context: {},
    };

    const result = await pasteListLoader(mockArgs);

    expect(result).toMatchObject({
      pastes: expect.any(Array),
      prevCursor: "prev-cursor",
      cursor: "current-cursor",
    });
  }, 15000);

  it("should handle hash-based URL parameters", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
      },
      request: new Request(
        "http://localhost/pastes/karashiiro.moe#/?cursor=hash-cursor",
      ),
      context: {},
    };

    const result = await pasteListLoader(mockArgs);

    expect(result).toMatchObject({
      pastes: expect.any(Array),
      cursor: "hash-cursor",
    });
  }, 15000);

  it("should throw 400 error for missing handle parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {},
      request: new Request("http://localhost/pastes/undefined"),
      context: {},
    };

    await expect(pasteListLoader(mockArgs)).rejects.toThrow();
  }, 10000);

  it("should throw error for non-existent handle", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "definitely-not-a-real-handle-12345.bsky.social",
      },
      request: new Request(
        "http://localhost/pastes/definitely-not-a-real-handle-12345.bsky.social",
      ),
      context: {},
    };

    await expect(pasteListLoader(mockArgs)).rejects.toThrow();
  }, 10000);

  // TODO: Make this test useful
  it.skip("should return empty list for handle with no pastes", async () => {
    // This test might be tricky since we need a real handle with no pastes
    // For now, we'll test the structure and let the real integration determine behavior
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "test.bsky.social", // This might not exist or have no pastes
      },
      request: new Request("http://localhost/pastes/test.bsky.social"),
      context: {},
    };

    // We expect this to either succeed with empty array or throw 404
    try {
      const result = await pasteListLoader(mockArgs);
      expect(result.pastes).toEqual([]);
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
    }
  }, 10000);
});
