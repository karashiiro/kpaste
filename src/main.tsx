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
      backgroundStrong: "#2b2b2b",
      backgroundSuperDark: "#0a0a0a",

      // Primary colors (header/accent)
      primary: "#5D688A",

      // Golden/accent colors
      accent: "#a58431", // rgba(165, 132, 49, 1)
      accentOverlay: "rgba(165, 132, 49, 0.8)", // transparent accent for loading overlay
      accentText: "#534116", // rgba(83, 65, 22, 1)

      // Green colors
      greenBase: "#A3DC9A", // soft mint green base color
      greenText: "#4A7C59", // darker green for text on green backgrounds
      greenOverlay: "rgba(163, 220, 154, 0.8)", // transparent green overlay

      // Soft accent colors
      accentSoft: "#FFDBB6", // warm peachy-cream for soft accents

      // Overlay colors
      overlay: "rgba(255, 255, 255, 0.1)",
      overlayStrong: "rgba(255, 255, 255, 0.2)",

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
