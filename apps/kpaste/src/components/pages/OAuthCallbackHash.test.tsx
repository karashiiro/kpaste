import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { OAuthCallbackHash } from "./OAuthCallbackHash";

const config = createTamagui(defaultConfig);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useAuth hook
const mockHandleOAuthCallback = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@kpaste/atproto-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock InsetCard
vi.mock("../ui/InsetCard", () => ({
  InsetCard: vi.fn(({ children }) => (
    <div data-testid="inset-card">{children}</div>
  )),
}));

describe("OAuthCallbackHash", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock auth hook - default to authenticating state
    mockUseAuth.mockReturnValue({
      handleOAuthCallback: mockHandleOAuthCallback,
      authState: { state: "authenticating", isLoading: false },
    });
  });

  describe("loading state", () => {
    it("should show loading state by default", () => {
      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      expect(screen.getByText("Completing Login...")).toBeInTheDocument();
      expect(
        screen.getByText("Processing your authentication from storage."),
      ).toBeInTheDocument();
    });

    it("should render InsetCard with blue theme during loading", async () => {
      const { InsetCard } = await import("../ui/InsetCard");

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      const callArgs = (InsetCard as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        theme: "blue",
      });
    });

    it("should render spinning arrow icon during loading", () => {
      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      // Check for SVG element (ArrowPathIcon)
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("authenticated state", () => {
    it("should show success message when authenticated", () => {
      mockUseAuth.mockReturnValue({
        handleOAuthCallback: mockHandleOAuthCallback,
        authState: { state: "authenticated", isLoading: false },
      });

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      expect(screen.getByText("Login Successful!")).toBeInTheDocument();
      expect(screen.getByText("Redirecting you now...")).toBeInTheDocument();
    });

    it("should render InsetCard with green theme when authenticated", async () => {
      mockUseAuth.mockReturnValue({
        handleOAuthCallback: mockHandleOAuthCallback,
        authState: { state: "authenticated", isLoading: false },
      });

      const { InsetCard } = await import("../ui/InsetCard");

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      const callArgs = (InsetCard as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        theme: "green",
      });
    });

    it("should render check circle icon when authenticated", () => {
      mockUseAuth.mockReturnValue({
        handleOAuthCallback: mockHandleOAuthCallback,
        authState: { state: "authenticated", isLoading: false },
      });

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      // Check for SVG element (CheckCircleIcon)
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("error state", () => {
    it("should show error message when authentication fails", () => {
      mockUseAuth.mockReturnValue({
        handleOAuthCallback: mockHandleOAuthCallback,
        authState: {
          state: "error",
          isLoading: false,
          error: { code: "AUTH_ERROR", message: "Authentication failed" },
        },
      });

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      expect(screen.getByText("Login Failed")).toBeInTheDocument();
      expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });

    it("should show default error message when no error details provided", () => {
      mockUseAuth.mockReturnValue({
        handleOAuthCallback: mockHandleOAuthCallback,
        authState: {
          state: "error",
          isLoading: false,
        },
      });

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      expect(
        screen.getByText("An error occurred during login"),
      ).toBeInTheDocument();
    });

    it("should render InsetCard with red theme on error", async () => {
      mockUseAuth.mockReturnValue({
        handleOAuthCallback: mockHandleOAuthCallback,
        authState: {
          state: "error",
          isLoading: false,
          error: { code: "AUTH_ERROR", message: "Test error" },
        },
      });

      const { InsetCard } = await import("../ui/InsetCard");

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      const callArgs = (InsetCard as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        theme: "red",
      });
    });

    it("should render back to home link on error", () => {
      mockUseAuth.mockReturnValue({
        handleOAuthCallback: mockHandleOAuthCallback,
        authState: {
          state: "error",
          isLoading: false,
        },
      });

      render(
        <TestWrapper>
          <OAuthCallbackHash />
        </TestWrapper>,
      );

      expect(screen.getByText("← Back to KPaste")).toBeInTheDocument();
    });
  });
});
