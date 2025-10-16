import { describe, it, expect } from "vitest";
import { pasteLoader } from "./pasteLoader";
import type { LoaderFunctionArgs } from "react-router";

describe("pasteLoader", () => {
  it("should load real paste data from karashiiro.moe", async () => {
    // Using real test data from /p/karashiiro.moe/3lzthufbnv22z
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
        rkey: "3lzthufbnv22z",
      },
      request: new Request("http://localhost/p/karashiiro.moe/3lzthufbnv22z"),
      context: {},
    };

    const result = await pasteLoader(mockArgs);

    expect(result).toMatchObject({
      handle: "karashiiro.moe",
      rkey: "3lzthufbnv22z",
      pdsUrl: "https://pds.bsky.ln4.net",
      content: 'const test = "This is a test.";',
    });

    expect(result.uri).toMatch(/^at:\/\/did:plc:/);
    expect(result.cid).toBeDefined();
    expect(result.value).toMatchObject({
      title: "[DO NOT DELETE] Test data",
      language: "typescript",
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
    });
  }, 15000);

  it("should throw 400 error for missing handle parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        rkey: "3lzthufbnv22z",
      },
      request: new Request("http://localhost/p/undefined/3lzthufbnv22z"),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  }, 10000);

  it("should throw 400 error for missing rkey parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
      },
      request: new Request("http://localhost/p/karashiiro.moe/undefined"),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  }, 10000);

  it("should throw 404 error for non-existent paste", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
        rkey: "nonexistent-paste-key-12345",
      },
      request: new Request(
        "http://localhost/p/karashiiro.moe/nonexistent-paste-key-12345",
      ),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  }, 10000);

  it("should throw error for non-existent handle", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "definitely-not-a-real-handle-12345.bsky.social",
        rkey: "3lzthufbnv22z",
      },
      request: new Request(
        "http://localhost/p/definitely-not-a-real-handle-12345.bsky.social/3lzthufbnv22z",
      ),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  }, 10000);
});
