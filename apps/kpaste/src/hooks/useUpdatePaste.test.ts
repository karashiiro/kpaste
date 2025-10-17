/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUpdatePaste } from "./useUpdatePaste";
import type { EditPasteForm } from "./usePasteForm";
import type { Main as PasteRecord } from "@kpaste/lexicon/types";

// Mock the dependencies
vi.mock("@kpaste/atproto-auth");

// Mock location.reload
Object.defineProperty(window, "location", {
  value: { reload: vi.fn() },
  writable: true,
});

// Mock useAuth hook
const mockGetClient = vi.fn();

import { useAuth } from "@kpaste/atproto-auth";

vi.mocked(useAuth).mockReturnValue({
  getClient: mockGetClient,
  isAuthenticated: true,
  session: {
    did: "did:plc:test123",
    handle: "test.bsky.social",
    refreshJwt: "mock-refresh-jwt",
    accessJwt: "mock-access-jwt",
    active: true,
    endpoint: { url: "https://bsky.social" },
    createdAt: new Date(),
  },
  startLogin: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
  error: undefined,
} as any);

describe("useUpdatePaste", () => {
  const mockClient = {
    post: vi.fn(),
  };

  const mockOriginalRecord: PasteRecord = {
    $type: "moe.karashiiro.kpaste.paste",
    content: {
      $type: "blob",
      mimeType: "text/plain",
      size: 100,
      ref: { $link: "bafkreioriginal" },
    },
    title: "Original Title",
    language: "javascript",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetClient.mockReturnValue(mockClient);

    // Reset useAuth to authenticated state for each test
    vi.mocked(useAuth).mockReturnValue({
      getClient: mockGetClient,
      isAuthenticated: true,
      session: {
        did: "did:plc:test123",
        handle: "test.bsky.social",
        refreshJwt: "mock-refresh-jwt",
        accessJwt: "mock-access-jwt",
        active: true,
        endpoint: { url: "https://bsky.social" },
        createdAt: new Date(),
      },
      startLogin: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: undefined,
    } as any);
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useUpdatePaste());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.updatePaste).toBe("function");
  });

  it("should successfully update a paste", async () => {
    // Mock successful API responses
    mockClient.post
      .mockResolvedValueOnce({
        ok: true,
        data: {
          blob: {
            ref: { $link: "bafkreiupdated123" },
            mimeType: "text/plain",
            size: 150,
          },
        },
      }) // uploadBlob response
      .mockResolvedValueOnce({
        ok: true,
        data: {
          uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
          cid: "bafyupdated123",
        },
      }); // putRecord response

    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
      title: "Updated Title",
      content: "console.log('updated!');",
      language: "typescript",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Verify blob upload was called correctly
    expect(mockClient.post).toHaveBeenNthCalledWith(
      1,
      "com.atproto.repo.uploadBlob",
      {
        input: expect.any(Blob),
      },
    );

    // Verify record update was called correctly
    expect(mockClient.post).toHaveBeenNthCalledWith(
      2,
      "com.atproto.repo.putRecord",
      {
        input: {
          repo: "did:plc:test123",
          collection: "moe.karashiiro.kpaste.paste",
          rkey: "abc123",
          record: {
            $type: "moe.karashiiro.kpaste.paste",
            content: {
              ref: { $link: "bafkreiupdated123" },
              mimeType: "text/plain",
              size: 150,
            },
            title: "Updated Title",
            language: "typescript",
            createdAt: "2024-01-01T00:00:00Z", // Preserved from original
            updatedAt: expect.stringMatching(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
            ), // New timestamp
          },
        },
      },
    );

    // Verify page reload was called
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("should handle missing title gracefully", async () => {
    mockClient.post
      .mockResolvedValueOnce({
        ok: true,
        data: {
          blob: {
            ref: { $link: "bafkreiupdated456" },
            mimeType: "text/plain",
            size: 100,
          },
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/xyz789",
          cid: "bafyupdated456",
        },
      });

    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/xyz789",
      title: "", // Empty title
      content: "updated content",
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    // Verify record was updated with undefined title
    expect(mockClient.post).toHaveBeenNthCalledWith(
      2,
      "com.atproto.repo.putRecord",
      {
        input: {
          repo: "did:plc:test123",
          collection: "moe.karashiiro.kpaste.paste",
          rkey: "xyz789",
          record: expect.objectContaining({
            title: undefined, // Empty string should become undefined
          }),
        },
      },
    );
  });

  it("should preserve original createdAt timestamp", async () => {
    mockClient.post
      .mockResolvedValueOnce({
        ok: true,
        data: {
          blob: {
            ref: { $link: "bafkreitest" },
            mimeType: "text/plain",
            size: 50,
          },
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: { uri: "test-uri", cid: "test-cid" },
      });

    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/preserve123",
      title: "Test",
      content: "test",
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(mockClient.post).toHaveBeenNthCalledWith(
      2,
      "com.atproto.repo.putRecord",
      {
        input: expect.objectContaining({
          record: expect.objectContaining({
            createdAt: "2024-01-01T00:00:00Z", // Original timestamp preserved
            updatedAt: expect.not.stringMatching("2024-01-01T00:00:00Z"), // Different from original
          }),
        }),
      },
    );
  });

  it("should handle authentication errors", async () => {
    vi.mocked(useAuth).mockReturnValue({
      getClient: mockGetClient,
      isAuthenticated: false, // Not authenticated
      session: undefined,
      startLogin: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://test",
      title: "Test",
      content: "content",
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Not authenticated");
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should handle empty content error", async () => {
    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://test",
      title: "Test",
      content: "   ", // Only whitespace
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Content is required!");
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should handle invalid URI error", async () => {
    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "invalid-uri", // No trailing rkey
      title: "Test",
      content: "test content",
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid paste URI");
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should handle blob upload failure", async () => {
    mockClient.post.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/test123",
      title: "Test",
      content: "test content",
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to upload content: 500");
    expect(mockClient.post).toHaveBeenCalledTimes(1); // Only blob upload was attempted
  });

  it("should handle record update failure", async () => {
    mockClient.post
      .mockResolvedValueOnce({
        ok: true,
        data: {
          blob: {
            ref: { $link: "bafkreitest123" },
            mimeType: "text/plain",
            size: 100,
          },
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        data: { error: "Invalid update" },
      });

    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/test123",
      title: "Test",
      content: "test content",
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to update paste: 400");
    expect(mockClient.post).toHaveBeenCalledTimes(2);
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it("should handle network errors", async () => {
    mockClient.post.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useUpdatePaste());

    const form: EditPasteForm = {
      uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/test123",
      title: "Test",
      content: "test content",
      language: "text",
      originalRecord: mockOriginalRecord,
    };

    await act(async () => {
      await result.current.updatePaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });
});
