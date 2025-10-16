import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { ErrorPage } from "./ErrorPage";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router", async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await importActual()) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const config = createTamagui(defaultConfig);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

// Mock PageContainer and ActionButton
vi.mock("../layout/PageContainer", () => ({
  PageContainer: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock("../ui/ActionButton", () => ({
  ActionButton: vi.fn(({ children, onPress, icon }) => (
    <button onClick={onPress} data-testid="action-button">
      {icon}
      {children}
    </button>
  )),
}));

describe("ErrorPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("error kind variants", () => {
    it("should render not-found error when kind is not-found", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      expect(screen.getByText("Paste Not Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The paste you're looking for doesn't exist or couldn't be loaded.",
        ),
      ).toBeInTheDocument();
    });

    it("should render generic error when kind is generic", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="generic" />
        </TestWrapper>,
      );

      expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
      expect(
        screen.getByText(
          "An unexpected error occurred. Please try refreshing the page or going back to home.",
        ),
      ).toBeInTheDocument();
    });

    it("should render generic error by default when kind is not provided", () => {
      render(
        <TestWrapper>
          <ErrorPage />
        </TestWrapper>,
      );

      expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
      expect(
        screen.getByText(
          "An unexpected error occurred. Please try refreshing the page or going back to home.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("title display", () => {
    it("should display correct title for not-found error", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      const title = screen.getByText("Paste Not Found");
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H1");
    });

    it("should display correct title for generic error", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="generic" />
        </TestWrapper>,
      );

      const title = screen.getByText("An Error Occurred");
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H1");
    });
  });

  describe("message display", () => {
    it("should display helpful message for not-found error", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      expect(
        screen.getByText(
          "The paste you're looking for doesn't exist or couldn't be loaded.",
        ),
      ).toBeInTheDocument();
    });

    it("should display helpful message for generic error", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="generic" />
        </TestWrapper>,
      );

      expect(
        screen.getByText(
          "An unexpected error occurred. Please try refreshing the page or going back to home.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("navigation button", () => {
    it("should render Back to KPaste button", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      expect(screen.getByText("Back to KPaste")).toBeInTheDocument();
    });

    it("should navigate to home when button is clicked", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      const button = screen.getByTestId("action-button");
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should render button with home icon", async () => {
      render(
        <TestWrapper>
          <ErrorPage kind="generic" />
        </TestWrapper>,
      );

      // Check that ActionButton was called with an icon
      const { ActionButton } = await import("../ui/ActionButton");
      const callArgs = (ActionButton as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        icon: expect.anything(),
      });
    });
  });

  describe("default behavior", () => {
    it("should use generic error as default when no kind provided", () => {
      render(
        <TestWrapper>
          <ErrorPage />
        </TestWrapper>,
      );

      expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
    });

    it("should render with all required elements", () => {
      render(
        <TestWrapper>
          <ErrorPage />
        </TestWrapper>,
      );

      // Title, message, and button should all be present
      expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
      expect(
        screen.getByText(
          "An unexpected error occurred. Please try refreshing the page or going back to home.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Back to KPaste")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      const heading = screen.getByText("Paste Not Found");
      expect(heading.tagName).toBe("H1");
    });

    it("should center content for better readability", async () => {
      const { PageContainer } = await import("../layout/PageContainer");

      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      // Check that PageContainer was called with centering props
      const pageContainerCalls = (PageContainer as ReturnType<typeof vi.fn>)
        .mock.calls[0];
      expect(pageContainerCalls[0]).toMatchObject({
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      });
    });

    it("should have clickable button for navigation", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="generic" />
        </TestWrapper>,
      );

      const button = screen.getByTestId("action-button");
      expect(button).toBeInTheDocument();

      // Button should be clickable
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("component integration", () => {
    it("should pass correct props to PageContainer", async () => {
      const { PageContainer } = await import("../layout/PageContainer");

      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      const callArgs = (PageContainer as ReturnType<typeof vi.fn>).mock
        .calls[0];
      expect(callArgs[0]).toMatchObject({
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      });
    });

    it("should pass correct props to ActionButton", async () => {
      const { ActionButton } = await import("../ui/ActionButton");

      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      const callArgs = (ActionButton as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        colorVariant: "blue",
        size: "$4",
        marginTop: "$3",
      });
      expect(callArgs[0].onPress).toBeDefined();
      expect(callArgs[0].icon).toBeDefined();
    });
  });

  describe("visual elements", () => {
    it("should render home icon in button", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      // HomeIcon should be rendered (check by looking for svg elements)
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("should render all content within a YStack container", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="generic" />
        </TestWrapper>,
      );

      // All main elements should be present
      expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
      expect(
        screen.getByText(
          "An unexpected error occurred. Please try refreshing the page or going back to home.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Back to KPaste")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle multiple renders without side effects", () => {
      const { rerender } = render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      expect(screen.getByText("Paste Not Found")).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ErrorPage kind="generic" />
        </TestWrapper>,
      );

      expect(screen.getByText("An Error Occurred")).toBeInTheDocument();
      expect(screen.queryByText("Paste Not Found")).not.toBeInTheDocument();
    });

    it("should handle rapid button clicks", () => {
      render(
        <TestWrapper>
          <ErrorPage kind="not-found" />
        </TestWrapper>,
      );

      const button = screen.getByTestId("action-button");

      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should still navigate correctly
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
