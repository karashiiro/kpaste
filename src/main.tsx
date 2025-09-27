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

const tamaguiConfig = createTamagui(defaultConfig);

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
