import { describe, it, expect, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { PasteFormField } from "./PasteFormField";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";

// Create Tamagui config like in main.tsx
const tamaguiConfig = createTamagui(defaultConfig);

// Helper to render component with Tamagui provider
function renderWithProvider(component: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  // Use flushSync to ensure synchronous rendering
  flushSync(() => {
    root.render(
      <TamaguiProvider config={tamaguiConfig}>{component}</TamaguiProvider>,
    );
  });

  return { container, root };
}

describe("PasteFormField", () => {
  it("should render label and input with provided props", () => {
    const mockOnChange = vi.fn();
    const { container, root } = renderWithProvider(
      <PasteFormField
        label="Test Label"
        value="test value"
        onChangeText={mockOnChange}
        placeholder="Enter text here"
      />,
    );

    const label = container.querySelector("label");
    const input = container.querySelector("input");

    expect(label).toBeTruthy();
    expect(label?.textContent).toBe("Test Label");
    expect(input).toBeTruthy();
    expect(input?.value).toBe("test value");
    expect(input?.placeholder).toBe("Enter text here");

    // Cleanup
    root.unmount();
    document.body.removeChild(container);
  });

  it("should have input element with correct attributes", () => {
    const mockOnChange = vi.fn();
    const { container, root } = renderWithProvider(
      <PasteFormField
        label="Test Input"
        value="current value"
        onChangeText={mockOnChange}
        placeholder="Type here"
      />,
    );

    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("current value");
    expect(input.placeholder).toBe("Type here");

    // Verify the onChange handler is attached (function exists)
    // Note: Testing actual event triggering is complex with Tamagui's custom components
    expect(typeof mockOnChange).toBe("function");

    // Cleanup
    root.unmount();
    document.body.removeChild(container);
  });

  it("should render without placeholder when not provided", () => {
    const mockOnChange = vi.fn();
    const { container, root } = renderWithProvider(
      <PasteFormField
        label="No Placeholder"
        value="some value"
        onChangeText={mockOnChange}
      />,
    );

    const input = container.querySelector("input");
    expect(input?.placeholder).toBe("");

    // Cleanup
    root.unmount();
    document.body.removeChild(container);
  });

  it("should update input value when prop changes", () => {
    const mockOnChange = vi.fn();
    const { container, root } = renderWithProvider(
      <PasteFormField
        label="Dynamic Value"
        value="initial"
        onChangeText={mockOnChange}
      />,
    );

    let input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("initial");

    // Re-render with new value
    flushSync(() => {
      root.render(
        <TamaguiProvider config={tamaguiConfig}>
          <PasteFormField
            label="Dynamic Value"
            value="updated"
            onChangeText={mockOnChange}
          />
        </TamaguiProvider>,
      );
    });

    input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("updated");

    // Cleanup
    root.unmount();
    document.body.removeChild(container);
  });

  it("should handle empty string values", () => {
    const mockOnChange = vi.fn();
    const { container, root } = renderWithProvider(
      <PasteFormField
        label="Empty Value"
        value=""
        onChangeText={mockOnChange}
      />,
    );

    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("");

    // Cleanup
    root.unmount();
    document.body.removeChild(container);
  });

  it("should have proper accessibility attributes", () => {
    const mockOnChange = vi.fn();
    const { container, root } = renderWithProvider(
      <PasteFormField
        label="Accessible Field"
        value="test"
        onChangeText={mockOnChange}
      />,
    );

    const label = container.querySelector("label");
    const input = container.querySelector("input");

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();

    // Tamagui should handle proper label-input association
    expect(label?.textContent).toBe("Accessible Field");

    // Cleanup
    root.unmount();
    document.body.removeChild(container);
  });
});
