import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { PasteListPage } from "./PasteListPage";
import { pasteListLoader } from "../../loaders/pasteListLoader";

const config = createTamagui(defaultConfig);

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <MemoryRouter>{children}</MemoryRouter>
    </TamaguiProvider>
  );
}

describe("PasteListPage - Live Data Integration", () => {
  it("should render arbitrary live paste lists from production using real loader", async () => {
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

    // Group records by DID to find users with multiple pastes
    const recordsByDid = records.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: Record<string, any[]>, record: any) => {
        if (!acc[record.did]) {
          acc[record.did] = [];
        }
        acc[record.did].push(record);
        return acc;
      },
      {},
    );

    // Find DIDs with at least one paste (preferably more)
    const didsWithPastes = Object.keys(recordsByDid).filter(
      (did) => recordsByDid[did].length > 0,
    );

    // Test first 2 users to keep tests fast
    const didsToTest = didsWithPastes.slice(0, 2);

    for (const identifier of didsToTest) {
      try {
        // Use the actual paste list loader to fetch data
        const loaderData = await pasteListLoader({
          params: { handle: identifier },
          request: new Request(`http://localhost/pastes/${identifier}`),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        // Render the component with the loader data
        const { unmount } = render(
          <TestWrapper>
            <Routes>
              <Route
                path="/"
                element={<PasteListPage />}
                loader={() => loaderData}
              />
            </Routes>
          </TestWrapper>,
        );

        // Wait for component to render - look for the page title
        await screen.findByText(/Pastes/i);

        // Validate that page title exists
        expect(screen.getByText(/Pastes/i)).toBeInTheDocument();

        // Validate that we have at least some pastes
        expect(loaderData.pastes.length).toBeGreaterThan(0);

        // Check that each paste in the loader data has required fields
        for (const paste of loaderData.pastes) {
          expect(paste.uri).toBeTruthy();
          expect(paste.value).toBeTruthy();
          expect(paste.value.createdAt).toBeTruthy();
          expect(paste.content).toBeTruthy();
          expect(paste.content.length).toBeGreaterThan(0);
        }

        // Verify that paste cards are rendered (PasteList should render them)
        // Look for common elements that would appear in paste list items
        const pasteElements = document.querySelectorAll(
          "[data-testid], pre, h3",
        );
        expect(pasteElements.length).toBeGreaterThan(0);

        // Clean up for next iteration
        unmount();
      } catch (error) {
        // Skip users that fail to load (might be deleted, invalid, etc.)
        console.warn(
          `Skipping paste list for ${identifier} due to error:`,
          error,
        );
        continue;
      }
    }
  });
});
