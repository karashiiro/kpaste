import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeletePaste } from "./useDeletePaste";
import { useAuth } from "@kpaste-app/atproto-auth";

const mockNavigate = vi.hoisted(() => vi.fn());

// Mock the dependencies
vi.mock("@kpaste-app/atproto-auth");
vi.mock("react-router", async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await importActual()) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.confirm
Object.defineProperty(window, "confirm", {
  value: vi.fn(),
  writable: true,
});

const mockGetClient = vi.fn();

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

describe("useDeletePaste", () => {
  const mockClient = {
    post: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Mock confirm to return true by default
    vi.mocked(window.confirm).mockReturnValue(true);
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useDeletePaste());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.deletePaste).toBe("function");
  });

  it("should successfully delete a paste", async () => {
    // Mock successful API response
    mockClient.post.mockResolvedValueOnce({
      ok: true,
      data: {},
    });

    const { result } = renderHook(() => useDeletePaste());

    const uri = "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123";

    await act(async () => {
      await result.current.deletePaste(uri);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Verify confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this paste?",
    );

    // Verify delete API was called correctly
    expect(mockClient.post).toHaveBeenCalledWith(
      "com.atproto.repo.deleteRecord",
      {
        input: {
          repo: "did:plc:test123",
          collection: "moe.karashiiro.kpaste.paste",
          rkey: "abc123",
        },
      },
    );

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should extract rkey from different URI formats", async () => {
    mockClient.post.mockResolvedValueOnce({
      ok: true,
      data: {},
    });

    const { result } = renderHook(() => useDeletePaste());

    const uri = "at://did:plc:different123/moe.karashiiro.kpaste.paste/xyz789";

    await act(async () => {
      await result.current.deletePaste(uri);
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      "com.atproto.repo.deleteRecord",
      {
        input: {
          repo: "did:plc:test123", // Uses session DID, not URI DID
          collection: "moe.karashiiro.kpaste.paste",
          rkey: "xyz789", // Extracted from URI
        },
      },
    );
  });

  it("should not delete when user cancels confirmation", async () => {
    vi.mocked(window.confirm).mockReturnValue(false); // User cancels

    const { result } = renderHook(() => useDeletePaste());

    const uri = "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123";

    await act(async () => {
      await result.current.deletePaste(uri);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Verify confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this paste?",
    );

    // Verify delete API was NOT called
    expect(mockClient.post).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useDeletePaste());

    const uri = "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123";

    await act(async () => {
      await result.current.deletePaste(uri);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Not authenticated");

    // Should not show confirmation or call API when not authenticated
    expect(window.confirm).not.toHaveBeenCalled();
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should handle invalid URI error", async () => {
    const { result } = renderHook(() => useDeletePaste());

    const invalidUri = "invalid-uri"; // No trailing rkey

    await act(async () => {
      await result.current.deletePaste(invalidUri);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid paste URI");

    // Should show confirmation but fail before API call
    expect(window.confirm).toHaveBeenCalled();
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should handle delete API failure", async () => {
    mockClient.post.mockResolvedValueOnce({
      ok: false,
      status: 404,
      data: { error: "Not found" },
    });

    const { result } = renderHook(() => useDeletePaste());

    const uri = "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123";

    await act(async () => {
      await result.current.deletePaste(uri);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to delete paste: 404");

    expect(mockClient.post).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should handle network errors", async () => {
    mockClient.post.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useDeletePaste());

    const uri = "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123";

    await act(async () => {
      await result.current.deletePaste(uri);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("should handle missing session DID", async () => {
    vi.mocked(useAuth).mockReturnValue({
      getClient: mockGetClient,
      isAuthenticated: true,
      session: {
        did: undefined, // Missing DID
        handle: "test.bsky.social",
        refreshJwt: "mock-refresh-jwt",
        accessJwt: "mock-access-jwt",
        active: true,
        endpoint: { url: "https://bsky.social" },
        createdAt: new Date(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      startLogin: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      error: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { result } = renderHook(() => useDeletePaste());

    const uri = "at://did:plc:test123/moe.karashiiro.kpaste.paste/abc123";

    await act(async () => {
      await result.current.deletePaste(uri);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Not authenticated");
    expect(mockClient.post).not.toHaveBeenCalled();
  });

  it("should clear error state when starting new operation", async () => {
    const { result } = renderHook(() => useDeletePaste());

    // First, create an error state with invalid URI
    const invalidUri = "invalid";

    await act(async () => {
      await result.current.deletePaste(invalidUri);
    });

    expect(result.current.error).toBe("Invalid paste URI");

    // Now try with valid URI
    mockClient.post.mockResolvedValueOnce({
      ok: true,
      data: {},
    });

    const validUri =
      "at://did:plc:test123/moe.karashiiro.kpaste.paste/valid123";

    await act(async () => {
      await result.current.deletePaste(validUri);
    });

    // Error should be cleared
    expect(result.current.error).toBe(null);
  });
});
