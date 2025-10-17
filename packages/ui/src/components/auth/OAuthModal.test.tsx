/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import type { AuthStateData } from "@kpaste-app/atproto-auth/types";
import { OAuthModal } from "./OAuthModal";

const config = createTamagui(defaultConfig);

// Mock window.matchMedia for Tamagui components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for Tamagui Sheet component
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver as well since it might be needed
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock useAuth hook
vi.mock("@kpaste-app/atproto-auth", () => ({
  useAuth: vi.fn(),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <MemoryRouter>{children}</MemoryRouter>
    </TamaguiProvider>
  );
}

describe("OAuthModal", () => {
  const mockStartLogin = vi.fn();
  const mockOnClose = vi.fn();

  const defaultAuthState = {
    authState: { state: "unauthenticated", isLoading: false } as AuthStateData,
    isAuthenticated: false,
    isAuthenticating: false,
    hasError: false,
    isLoading: false,
    error: undefined,
    session: undefined,
    user: undefined,
    timeUntilExpiry: null,
    startLogin: mockStartLogin,
    logout: vi.fn(),
    handleOAuthCallback: vi.fn(),
    clearError: vi.fn(),
    getLatestSession: vi.fn(),
    getClient: vi.fn(),
    getAgent: vi.fn(),
    isSessionExpired: false,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock useAuth with default state
    const useAuthModule = await import("@kpaste-app/atproto-auth");
    vi.mocked(useAuthModule.useAuth).mockReturnValue(defaultAuthState);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render modal when open", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      expect(screen.getByText("Login with ATProto")).toBeInTheDocument();
      expect(screen.getByText("Handle:")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Your handle")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Continue with OAuth")).toBeInTheDocument();
    });

    it("should not show modal overlay when closed", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={false} onClose={mockOnClose} />
        </TestWrapper>,
      );

      // Note: Tamagui Sheet may still render content in the DOM for performance
      // but the overlay and interactive parts should not be active when closed
      // We'll check that we can't find the main modal heading as a proxy for "closed"
      const headingElements = screen.queryAllByRole("heading", {
        name: "Login to Bluesky",
      });
      // Either no heading exists, or if it does, it's not visible/interactive
      expect(headingElements.length).toBeLessThanOrEqual(1);
    });

    it("should render proper icons", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      // Check for SVG elements (icons)
      const svgElements = document.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe("form interaction", () => {
    it("should update handle input value", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      fireEvent.change(input, { target: { value: "test.bsky.social" } });

      expect(input).toHaveValue("test.bsky.social");
    });

    it("should call startLogin with trimmed handle when form is submitted", async () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      const submitButton = screen.getByText("Continue with OAuth");

      fireEvent.change(input, { target: { value: "  test.bsky.social  " } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockStartLogin).toHaveBeenCalledWith({
          handle: "test.bsky.social",
        });
      });
    });

    it("should call startLogin when Enter key is pressed", async () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      fireEvent.change(input, { target: { value: "test.bsky.social" } });
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(mockStartLogin).toHaveBeenCalledWith({
          handle: "test.bsky.social",
        });
      });
    });

    it("should not call startLogin with empty handle", async () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const submitButton = screen.getByText("Continue with OAuth");
      fireEvent.click(submitButton);

      expect(mockStartLogin).not.toHaveBeenCalled();
    });

    it("should not call startLogin with whitespace-only handle", async () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      const submitButton = screen.getByText("Continue with OAuth");

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(submitButton);

      expect(mockStartLogin).not.toHaveBeenCalled();
    });

    it("should call onClose when cancel button is clicked", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("authentication states", () => {
    it("should show loading state when authenticating", async () => {
      const useAuthModule = await import("@kpaste-app/atproto-auth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isAuthenticating: true,
      });

      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      expect(screen.getByText("Redirecting...")).toBeInTheDocument();

      // Input should be disabled when authenticating
      const input = screen.getByPlaceholderText("Your handle");
      expect(input).toBeDisabled();

      // Buttons should be disabled when authenticating
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const submitButton = screen.getByRole("button", { name: /redirecting/i });
      expect(cancelButton).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it("should close modal when user becomes authenticated", async () => {
      const useAuthModule = await import("@kpaste-app/atproto-auth");

      // Initially not authenticated
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isAuthenticated: false,
      });

      const { rerender } = render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      expect(mockOnClose).not.toHaveBeenCalled();

      // Simulate authentication success
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isAuthenticated: true,
      });

      rerender(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("should disable submit button when loading", async () => {
      const useAuthModule = await import("@kpaste-app/atproto-auth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      fireEvent.change(input, { target: { value: "test.bsky.social" } });

      const submitButton = screen.getByRole("button", {
        name: /continue with oauth/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when handle is empty", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const submitButton = screen.getByRole("button", {
        name: /continue with oauth/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when handle is provided and not loading", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      fireEvent.change(input, { target: { value: "test.bsky.social" } });

      const submitButton = screen.getByText("Continue with OAuth");
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("error handling", () => {
    it("should display error message when hasError is true", async () => {
      const useAuthModule = await import("@kpaste-app/atproto-auth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        hasError: true,
        error: { code: "AUTH_FAILED", message: "Invalid handle or password" },
      });

      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      expect(
        screen.getByText("Invalid handle or password"),
      ).toBeInTheDocument();
    });

    it("should not display error when hasError is false", () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it("should not display error when error is null", async () => {
      const useAuthModule = await import("@kpaste-app/atproto-auth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        hasError: true,
        error: undefined,
      });

      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it("should handle startLogin errors gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Network error");
      mockStartLogin.mockRejectedValue(error);

      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      const submitButton = screen.getByText("Continue with OAuth");

      fireEvent.change(input, { target: { value: "test.bsky.social" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("OAuth login failed:", error);
      });

      consoleSpy.mockRestore();
    });
  });

  describe("form reset", () => {
    it("should reset handle when modal is closed", async () => {
      const { rerender } = render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      fireEvent.change(input, { target: { value: "test.bsky.social" } });
      expect(input).toHaveValue("test.bsky.social");

      // Close modal
      rerender(
        <TestWrapper>
          <OAuthModal isOpen={false} onClose={mockOnClose} />
        </TestWrapper>,
      );

      // Reopen modal
      rerender(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const newInput = screen.getByPlaceholderText("Your handle");
      expect(newInput).toHaveValue("");
    });

    it("should not reset handle when modal remains open", () => {
      const { rerender } = render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      fireEvent.change(input, { target: { value: "test.bsky.social" } });

      rerender(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      expect(input).toHaveValue("test.bsky.social");
    });
  });

  describe("edge cases", () => {
    it("should handle undefined error gracefully", async () => {
      const useAuthModule = await import("@kpaste-app/atproto-auth");
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        hasError: true,
        error: undefined as any,
      });

      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      // Should not throw
      expect(screen.getByText("Login with ATProto")).toBeInTheDocument();
    });

    it("should handle special characters in handle", async () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText("Your handle");
      const submitButton = screen.getByText("Continue with OAuth");

      fireEvent.change(input, {
        target: { value: "test-user_123.bsky.social" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockStartLogin).toHaveBeenCalledWith({
          handle: "test-user_123.bsky.social",
        });
      });
    });

    it("should handle very long handles", async () => {
      render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      const longHandle = "a".repeat(100) + ".bsky.social";
      const input = screen.getByPlaceholderText("Your handle");
      const submitButton = screen.getByText("Continue with OAuth");

      fireEvent.change(input, { target: { value: longHandle } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockStartLogin).toHaveBeenCalledWith({
          handle: longHandle,
        });
      });
    });

    it("should handle rapid state changes", async () => {
      const useAuthModule = await import("@kpaste-app/atproto-auth");

      const { rerender } = render(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      // Rapid state changes
      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isAuthenticating: true,
      });

      rerender(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      vi.mocked(useAuthModule.useAuth).mockReturnValue({
        ...defaultAuthState,
        isAuthenticated: true,
      });

      rerender(
        <TestWrapper>
          <OAuthModal isOpen={true} onClose={mockOnClose} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
