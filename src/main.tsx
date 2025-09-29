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
      primary: "#364163ff",

      // Golden/accent colors
      accent: "#a58431", // rgba(165, 132, 49, 1)
      accentOverlay: "rgba(255, 219, 182, .8)", // transparent accent for loading overlay
      accentText: "#534116", // rgba(83, 65, 22, 1)

      // Green colors
      greenBase: "rgba(124, 255, 104, 1)", // soft green base color
      greenHover: "rgba(101, 233, 81, 1)", // slightly darker green for hover
      greenPress: "rgba(78, 197, 60, 1)", // darker green for press
      greenText: "rgba(29, 94, 19, 1)", // darker green for text on green backgrounds
      greenDisabled: "rgba(124, 255, 104, 0.5)", // faded green for disabled state

      // Blue colors
      blueBase: "rgba(61, 154, 253, 1)", // soft sky blue base color
      blueHover: "rgba(44, 130, 223, 1)", // slightly darker blue for hover
      bluePress: "rgba(31, 110, 196, 1)", // darker blue for press
      blueText: "rgba(30, 68, 114, 1)", // darker blue for text on blue backgrounds
      blueDisabled: "rgba(61, 154, 253, 0.5)", // faded blue for disabled state

      // Yellow colors (for create button)
      yellowBase: "#F4D03F", // bright sunny yellow base
      yellowHover: "#F1C40F", // golden yellow for hover
      yellowPress: "#D4AC0D", // deeper gold for press
      yellowText: "#7D6608", // dark golden text for readability

      // Red colors (for delete button)
      redBase: "#E74C3C", // bright red base
      redHover: "#C0392B", // darker red for hover
      redPress: "#A93226", // deep red for press
      redText: "#640000",

      // Overlay colors
      overlay: "rgba(255, 255, 255, 0.1)",

      // Shadow colors
      shadow: "rgba(0, 0, 0, 0.25)",

      // Text colors
      textTitle: "rgba(236, 241, 255, 1)",
      textMuted: "#999999",

      // InsetCard styling
      insetCardBackground: "rgba(107, 120, 158, 1)", // background for the outer card
      insetCardPublicBackground: "#F7A5A5", // cute peachy-pink for public cards
      insetCardBorderColor: "rgba(61, 71, 102, 1)", // dashed border color
      insetCardBorderRadius: "12px", // outer border radius
      insetCardInnerRadius: "8px", // inner border radius
      insetCardBorderWidth: "2px", // border thickness
      insetCardPadding: "$2", // default inset padding
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
