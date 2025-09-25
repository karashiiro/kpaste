import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { TamaguiProvider, createTamagui, Theme } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";
import { App } from "./App.tsx";
import { LoadingFallback } from "./components/LoadingFallback.tsx";
import { pasteLoader } from "./loaders/pasteLoader.ts";

const PasteEditor = lazy(() =>
  import("./components/PasteEditor.tsx").then((m) => ({
    default: m.PasteEditor,
  })),
);
const PasteListPage = lazy(() =>
  import("./components/PasteListPage.tsx").then((m) => ({
    default: m.PasteListPage,
  })),
);
const PasteView = lazy(() =>
  import("./components/PasteView.tsx").then((m) => ({ default: m.PasteView })),
);
const OAuthCallbackHash = lazy(() =>
  import("./components/OAuthCallbackHash.tsx").then((m) => ({
    default: m.OAuthCallbackHash,
  })),
);

import { pasteListLoader } from "./loaders/pasteListLoader.ts";

const tamaguiConfig = createTamagui(defaultConfig);

const router = createHashRouter(
  [
    {
      path: "/",
      element: <App />,
      HydrateFallback: LoadingFallback,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <PasteEditor />
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
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <h1 style={{ color: "#dc3545", marginBottom: "1rem" }}>
                Paste Not Found
              </h1>
              <p style={{ color: "#666", marginBottom: "2rem" }}>
                The paste you're looking for doesn't exist or couldn't be
                loaded.
              </p>
              <a
                href="/"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "25px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                ← Back to KPaste
              </a>
            </div>
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
