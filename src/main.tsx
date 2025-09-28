import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { TamaguiProvider, createTamagui, Theme } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { LoadingFallback } from "./components/ui/LoadingFallback.tsx";
import { pasteLoader } from "./loaders/pasteLoader.ts";

const App = lazy(() =>
  import("./App.tsx").then((m) => ({
    default: m.App,
  })),
);
const Home = lazy(() =>
  import("./components/pages/Home.tsx").then((m) => ({
    default: m.Home,
  })),
);
const PasteListPage = lazy(() =>
  import("./components/pages/PasteListPage.tsx").then((m) => ({
    default: m.PasteListPage,
  })),
);
const PasteView = lazy(() =>
  import("./components/pages/PasteView.tsx").then((m) => ({
    default: m.PasteView,
  })),
);
const OAuthCallbackHash = lazy(() =>
  import("./components/pages/OAuthCallbackHash.tsx").then((m) => ({
    default: m.OAuthCallbackHash,
  })),
);
const ErrorPage = lazy(() =>
  import("./components/pages/ErrorPage.tsx").then((m) => ({
    default: m.ErrorPage,
  })),
);

import { pasteListLoader } from "./loaders/pasteListLoader.ts";

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    dark: {
      ...defaultConfig.themes.dark,
      // Background colors
      background: "#3a3a3a",
      backgroundSuperDark: "#0a0a0a",

      // Primary colors (header/accent)
      primary: "#5D688A",

      // Golden/accent colors
      accent: "#a58431", // rgba(165, 132, 49, 1)
      accentOverlay: "rgba(255, 219, 182, .8)", // transparent accent for loading overlay
      accentText: "#534116", // rgba(83, 65, 22, 1)

      // Green colors
      greenBase: "#A3DC9A", // soft mint green base color
      greenHover: "#8FD084", // slightly darker mint green for hover
      greenPress: "#7AC46F", // darker mint green for press
      greenText: "#4A7C59", // darker green for text on green backgrounds

      // Blue colors
      blueBase: "#7BB3F0", // soft sky blue base color
      blueHover: "#5A9BE8", // slightly darker blue for hover
      bluePress: "#4285E0", // darker blue for press
      blueText: "#2C5282", // darker blue for text on blue backgrounds

      // Yellow colors (for create button)
      yellowBase: "#F4D03F", // bright sunny yellow base - much more vibrant!
      yellowHover: "#F1C40F", // golden yellow for hover
      yellowPress: "#D4AC0D", // deeper gold for press
      yellowText: "#7D6608", // dark golden text for readability

      // Red colors (for delete button)
      redBase: "#E74C3C", // bright red base - clear danger signal
      redHover: "#C0392B", // darker red for hover
      redPress: "#A93226", // deep red for press
      redText: "#FFFFFF", // white text on red background

      // Overlay colors
      overlay: "rgba(255, 255, 255, 0.1)",

      // Shadow colors
      shadow: "rgba(0, 0, 0, 0.25)",

      // Text colors
      textMuted: "#999999",

      // InsetCard styling
      insetCardBackground: "#5D688A", // background for the outer card
      insetCardPublicBackground: "#F7A5A5", // cute peachy-pink for public cards
      insetCardBorderColor: "$color4", // dashed border color
      insetCardBorderRadius: "12px", // outer border radius
      insetCardInnerRadius: "8px", // inner border radius
      insetCardBorderWidth: "2px", // border thickness
      insetCardPadding: "$2", // default inset padding

      // Legacy mappings for tamagui compatibility
      color1: "#2b2b2b",
    },
  },
});

const router = createHashRouter(
  [
    {
      path: "/",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      ),
      HydrateFallback: LoadingFallback,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          ),
        },
        {
          path: "oauth-callback",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <OAuthCallbackHash />
            </Suspense>
          ),
        },
        {
          path: "pastes/:handle",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PasteListPage />
            </Suspense>
          ),
          loader: pasteListLoader,
        },
        {
          path: "p/:handle/:rkey",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PasteView />
            </Suspense>
          ),
          loader: pasteLoader,
          errorElement: (
            <Suspense fallback={<LoadingFallback />}>
              <ErrorPage />
            </Suspense>
          ),
        },
      ],
    },
  ],
  {
    future: {
      v7_partialHydration: true,
    },
  },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="dark">
        <RouterProvider router={router} />
      </Theme>
    </TamaguiProvider>
  </StrictMode>,
);
