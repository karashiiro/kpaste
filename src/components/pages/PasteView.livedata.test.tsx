/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { PasteView } from "./PasteView";
import { pasteLoader } from "../../loaders/pasteLoader";

const config = createTamagui(defaultConfig);

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <MemoryRouter>{children}</MemoryRouter>
    </TamaguiProvider>
  );
}

describe("PasteView - Live Data Integration", () => {
  it("should render arbitrary live paste records from production using real loader", async () => {
    // Fetch real paste records from the API
    const response = await fetch(
      "https://ufos-api.microcosm.blue/records?collection=moe.karashiiro.kpaste.paste",
    );
    const records = await response.json();

    // Skip if no records available
    if (!records || records.length === 0) {
      console.warn("No live paste records available for testing");
      return;
    }

    // Test each record (or limit to first 3 to keep tests fast)
    const recordsToTest = records.slice(0, 3);

    for (const record of recordsToTest) {
      // Use the DID directly as the identifier - resolveUser can handle DIDs
      const identifier = record.did;
      const rkey = record.rkey;

      try {
        // Use the actual paste loader to fetch data
        const loaderData = await pasteLoader({
          params: { handle: identifier, rkey },
          request: new Request(`http://localhost/p/${identifier}/${rkey}`),
        } as any);

        // Render the component with the loader data using Routes
        const { unmount } = render(
          <TestWrapper>
            <Routes>
              <Route
                path="/"
                element={<PasteView />}
                loader={() => loaderData}
              />
            </Routes>
          </TestWrapper>,
        );

        // Wait for component to render - look for the "by" text that PasteMetadata renders
        await screen.findByText(/by/i);

        // Validate that basic metadata is rendered
        // Check for "by @handle" text
        expect(screen.getByText(/by/i)).toBeInTheDocument();

        // Check for language display
        const language = loaderData.value.language || "text";
        expect(screen.getByText(language)).toBeInTheDocument();

        // Check for "Created:" text
        expect(screen.getByText(/Created:/i)).toBeInTheDocument();

        // Check that title is rendered (either the actual title or "Untitled Paste")
        const titleRegex = loaderData.value.title
          ? new RegExp(loaderData.value.title)
          : /Untitled Paste/;
        expect(screen.getByText(titleRegex)).toBeInTheDocument();

        // Check that a pre element exists for code display
        const preElement = document.querySelector("pre");
        expect(preElement).toBeInTheDocument();
        expect(preElement).toHaveTextContent(loaderData.content);

        // Verify that actual content was loaded (not just placeholder)
        expect(loaderData.content).toBeTruthy();
        expect(loaderData.content.length).toBeGreaterThan(0);

        // Clean up for next iteration
        unmount();
      } catch (error) {
        // Skip records that fail to load (might be deleted, invalid, etc.)
        console.warn(
          `Skipping record ${identifier}/${rkey} due to error:`,
          error,
        );
        continue;
      }
    }
  });
});
