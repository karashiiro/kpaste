import { describe, it, expect, vi, beforeEach } from "vitest";
import { pasteLoader } from "./pasteLoader";
import type { LoaderFunctionArgs } from "react-router";

// Mock the pdsUtils module to avoid network calls
vi.mock("../utils/pdsUtils", () => ({
  resolveUser: vi.fn(),
  getPasteRecord: vi.fn(),
  getTextBlob: vi.fn(),
}));

describe("pasteLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load paste data using resolved user", async () => {
    const { resolveUser, getPasteRecord, getTextBlob } = await import(
      "../utils/pdsUtils"
    );

    (resolveUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      did: "did:plc:test123",
      pdsUrl: "https://pds.example.com",
      handle: "karashiiro.moe",
    });

    (getPasteRecord as ReturnType<typeof vi.fn>).mockResolvedValue({
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/3lzthufbnv22z",
      cid: "bafyreicid123",
      value: {
        $type: "moe.karashiiro.kpaste.paste",
        title: "[DO NOT DELETE] Test data",
        language: "typescript",
        content: {
          $type: "blob",
          ref: { $link: "bafkreiblob123" },
          mimeType: "text/plain",
          size: 31,
        },
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    });

    (getTextBlob as ReturnType<typeof vi.fn>).mockResolvedValue(
      'const test = "This is a test.";',
    );

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
      pdsUrl: "https://pds.example.com",
      content: 'const test = "This is a test.";',
    });

    expect(result.uri).toMatch(/^at:\/\/did:plc:/);
    expect(result.cid).toBeDefined();
    expect(result.value).toMatchObject({
      title: "[DO NOT DELETE] Test data",
      language: "typescript",
      createdAt: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      ),
    });

    expect(resolveUser).toHaveBeenCalledWith("karashiiro.moe");
    expect(getPasteRecord).toHaveBeenCalledWith(
      "https://pds.example.com",
      "did:plc:test123",
      "3lzthufbnv22z",
    );
  });

  it("should use resolved handle when DID is in URL", async () => {
    const { resolveUser, getPasteRecord, getTextBlob } = await import(
      "../utils/pdsUtils"
    );

    (resolveUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      did: "did:plc:test123",
      pdsUrl: "https://pds.example.com",
      handle: "resolved.handle.social",
    });

    (getPasteRecord as ReturnType<typeof vi.fn>).mockResolvedValue({
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      cid: "bafyreicid123",
      value: {
        $type: "moe.karashiiro.kpaste.paste",
        title: "Test",
        language: "text",
        content: {
          $type: "blob",
          ref: { $link: "bafkreiblob123" },
          mimeType: "text/plain",
          size: 4,
        },
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    });

    (getTextBlob as ReturnType<typeof vi.fn>).mockResolvedValue("test");

    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "did:plc:test123",
        rkey: "abc123",
      },
      request: new Request("http://localhost/p/did:plc:test123/abc123"),
      context: {},
    };

    const result = await pasteLoader(mockArgs);

    // Should use the resolved handle, not the DID from the URL
    expect(result.handle).toBe("resolved.handle.social");
    expect(resolveUser).toHaveBeenCalledWith("did:plc:test123");
  });

  it("should throw 400 error for missing handle parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        rkey: "3lzthufbnv22z",
      },
      request: new Request("http://localhost/p/undefined/3lzthufbnv22z"),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  });

  it("should throw 400 error for missing rkey parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "karashiiro.moe",
      },
      request: new Request("http://localhost/p/karashiiro.moe/undefined"),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  });

  it("should throw error when resolveUser fails", async () => {
    const { resolveUser } = await import("../utils/pdsUtils");

    (resolveUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Failed to resolve"),
    );

    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "nonexistent.handle",
        rkey: "abc123",
      },
      request: new Request("http://localhost/p/nonexistent.handle/abc123"),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  });

  it("should throw error when paste record has invalid blob reference", async () => {
    const { resolveUser, getPasteRecord } = await import("../utils/pdsUtils");

    (resolveUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      did: "did:plc:test123",
      pdsUrl: "https://pds.example.com",
      handle: "test.handle",
    });

    (getPasteRecord as ReturnType<typeof vi.fn>).mockResolvedValue({
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      cid: "bafyreicid123",
      value: {
        $type: "moe.karashiiro.kpaste.paste",
        title: "Test",
        language: "text",
        content: null, // Invalid blob reference
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    });

    const mockArgs: LoaderFunctionArgs = {
      params: {
        handle: "test.handle",
        rkey: "abc123",
      },
      request: new Request("http://localhost/p/test.handle/abc123"),
      context: {},
    };

    await expect(pasteLoader(mockArgs)).rejects.toThrow();
  });
});
