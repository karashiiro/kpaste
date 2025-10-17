/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCreatePaste } from "./useCreatePaste";
import type { CreatePasteForm } from "./usePasteForm";

// Mock the dependencies
vi.mock("@kpaste-app/atproto-auth");
vi.mock("react-router");

// Mock useAuth hook
const mockGetClient = vi.fn();
const mockNavigate = vi.fn();

import { useAuth } from "@kpaste-app/atproto-auth";
import { useNavigate } from "react-router";

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

vi.mocked(useNavigate).mockReturnValue(mockNavigate);

describe("useCreatePaste", () => {
  const mockClient = {
    post: vi.fn(),
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
    const { result } = renderHook(() => useCreatePaste());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.createPaste).toBe("function");
  });

  it("should successfully create a paste", async () => {
    // Mock successful API responses
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
      }) // uploadBlob response
      .mockResolvedValueOnce({
        ok: true,
        data: {
          uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
          cid: "bafytest123",
        },
      }); // createRecord response

    const { result } = renderHook(() => useCreatePaste());

    const form: CreatePasteForm = {
      title: "Test Paste",
      content: "console.log('hello world');",
      language: "javascript",
    };

    await act(async () => {
      await result.current.createPaste(form);
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

    // Verify record creation was called correctly
    expect(mockClient.post).toHaveBeenNthCalledWith(
      2,
      "com.atproto.repo.createRecord",
      {
        input: {
          repo: "did:plc:test123",
          collection: "moe.karashiiro.kpaste.paste",
          record: {
            $type: "moe.karashiiro.kpaste.paste",
            content: {
              ref: { $link: "bafkreitest123" },
              mimeType: "text/plain",
              size: 100,
            },
            title: "Test Paste",
            language: "javascript",
            createdAt: expect.stringMatching(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
            ),
            updatedAt: expect.stringMatching(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
            ),
          },
        },
      },
    );

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith("/p/test.bsky.social/abc123");
  });

  it("should handle missing title gracefully", async () => {
    mockClient.post
      .mockResolvedValueOnce({
        ok: true,
        data: {
          blob: {
            ref: { $link: "bafkreitest123" },
            mimeType: "text/plain",
            size: 50,
          },
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/xyz789",
          cid: "bafytest456",
        },
      });

    const { result } = renderHook(() => useCreatePaste());

    const form: CreatePasteForm = {
      title: "", // Empty title
      content: "some content",
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(form);
    });

    // Verify record was created with undefined title
    expect(mockClient.post).toHaveBeenNthCalledWith(
      2,
      "com.atproto.repo.createRecord",
      {
        input: {
          repo: "did:plc:test123",
          collection: "moe.karashiiro.kpaste.paste",
          record: expect.objectContaining({
            title: undefined, // Empty string should become undefined
          }),
        },
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

    const { result } = renderHook(() => useCreatePaste());

    const form: CreatePasteForm = {
      title: "Test",
      content: "content",
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Not authenticated");
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should handle empty content error", async () => {
    const { result } = renderHook(() => useCreatePaste());

    const form: CreatePasteForm = {
      title: "Test",
      content: "   ", // Only whitespace
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Content is required!");
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should handle blob upload failure", async () => {
    mockClient.post.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCreatePaste());

    const form: CreatePasteForm = {
      title: "Test",
      content: "test content",
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to upload content: 500");
    expect(mockClient.post).toHaveBeenCalledTimes(1); // Only blob upload was attempted
  });

  it("should handle record creation failure", async () => {
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
        data: { error: "Invalid record" },
      });

    const { result } = renderHook(() => useCreatePaste());

    const form: CreatePasteForm = {
      title: "Test",
      content: "test content",
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to create paste: 400");
    expect(mockClient.post).toHaveBeenCalledTimes(2);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should handle network errors", async () => {
    mockClient.post.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCreatePaste());

    const form: CreatePasteForm = {
      title: "Test",
      content: "test content",
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(form);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("should clear error state when starting new operation", async () => {
    const { result } = renderHook(() => useCreatePaste());

    // First, create an error state
    const errorForm: CreatePasteForm = {
      title: "Test",
      content: "", // Empty content to trigger error
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(errorForm);
    });

    expect(result.current.error).toBe("Content is required!");

    // Now try with valid form
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
        ok: true,
        data: {
          uri: "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123",
          cid: "bafytest123",
        },
      });

    const validForm: CreatePasteForm = {
      title: "Test",
      content: "valid content",
      language: "text",
    };

    await act(async () => {
      await result.current.createPaste(validForm);
    });

    // Error should be cleared
    expect(result.current.error).toBe(null);
  });
});
