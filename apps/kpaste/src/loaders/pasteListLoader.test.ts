import { describe, it, expect, vi, beforeEach } from "vitest";
import { pasteListLoader } from "./pasteListLoader";
import type { LoaderFunctionArgs } from "react-router";

// Mock the pdsUtils module to avoid network calls
vi.mock("../utils/pdsUtils", () => ({
  resolveUser: vi.fn(),
  getTextBlobs: vi.fn(),
}));

// Mock @atcute/client
vi.mock("@atcute/client", () => {
  const mockGet = vi.fn();
  return {
    simpleFetchHandler: vi.fn(() => ({})),
    Client: vi.fn(() => ({ get: mockGet })),
    __mockGet: mockGet,
  };
});

describe("pasteListLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load paste list from resolved user", async () => {
    const { resolveUser, getTextBlobs } = await import("../utils/pdsUtils");
    const atcute = await import("@atcute/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGet = (atcute as any).__mockGet;

    (resolveUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      did: "did:plc:test123",
      pdsUrl: "https://pds.example.com",
      handle: "karashiiro.moe",
    });

    mockGet.mockResolvedValue({
      ok: true,
      data: {
        records: [
          {
            uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
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
          },
        ],
        cursor: undefined,
      },
    });

    (getTextBlobs as ReturnType<typeof vi.fn>).mockResolvedValue([
      'const test = "This is a test.";',
    ]);

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
      handle: "karashiiro.moe",
    });

    expect(result.pastes.length).toBeGreaterThan(0);
    expect(result.pastes.length).toBeLessThanOrEqual(20);

    const testPaste = result.pastes.find(
      (paste) => paste.value.title === "[DO NOT DELETE] Test data",
    );
    expect(testPaste).toBeDefined();
    expect(testPaste?.content).toBe('const test = "This is a test.";');
  });

  it("should handle pagination with cursor parameter", async () => {
    const { resolveUser, getTextBlobs } = await import("../utils/pdsUtils");
    const atcute = await import("@atcute/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGet = (atcute as any).__mockGet;

    (resolveUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      did: "did:plc:test123",
      pdsUrl: "https://pds.example.com",
      handle: "karashiiro.moe",
    });

    mockGet.mockResolvedValue({
      ok: true,
      data: { records: [], cursor: undefined },
    });

    (getTextBlobs as ReturnType<typeof vi.fn>).mockResolvedValue([]);

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
      handle: "karashiiro.moe",
      cursor: "some-cursor",
    });
  });

  it("should handle previous cursor parameter", async () => {
    const { resolveUser, getTextBlobs } = await import("../utils/pdsUtils");
    const atcute = await import("@atcute/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGet = (atcute as any).__mockGet;

    (resolveUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      did: "did:plc:test123",
      pdsUrl: "https://pds.example.com",
      handle: "karashiiro.moe",
    });

    mockGet.mockResolvedValue({
      ok: true,
      data: { records: [], cursor: undefined },
    });

    (getTextBlobs as ReturnType<typeof vi.fn>).mockResolvedValue([]);

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
      handle: "karashiiro.moe",
      prevCursor: "prev-cursor",
      cursor: "current-cursor",
    });
  });

  it("should handle hash-based URL parameters", async () => {
    const { resolveUser, getTextBlobs } = await import("../utils/pdsUtils");
    const atcute = await import("@atcute/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGet = (atcute as any).__mockGet;

    (resolveUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      did: "did:plc:test123",
      pdsUrl: "https://pds.example.com",
      handle: "karashiiro.moe",
    });

    mockGet.mockResolvedValue({
      ok: true,
      data: { records: [], cursor: undefined },
    });

    (getTextBlobs as ReturnType<typeof vi.fn>).mockResolvedValue([]);

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
      handle: "karashiiro.moe",
      cursor: "hash-cursor",
    });
  });

  it("should throw 400 error for missing handle parameter", async () => {
    const mockArgs: LoaderFunctionArgs = {
      params: {},
      request: new Request("http://localhost/pastes/undefined"),
      context: {},
    };

    await expect(pasteListLoader(mockArgs)).rejects.toThrow();
  });

  it("should throw error for non-existent handle", async () => {
    const { resolveUser } = await import("../utils/pdsUtils");

    (resolveUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Failed to resolve"),
    );

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
  });
});
