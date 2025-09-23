import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { TamaguiProvider, createTamagui, Theme } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";
import "./index.css";
import App from "./App.tsx";
import { PasteView } from "./components/PasteView.tsx";
import { pasteLoader } from "./loaders/pasteLoader.ts";

import "prismjs/themes/prism.css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

const tamaguiConfig = createTamagui(defaultConfig);

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/:handle/:rkey",
    element: <PasteView />,
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
          The paste you're looking for doesn't exist or couldn't be loaded.
        </p>
        <a
          href="/"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="dark">
        <RouterProvider router={router} />
      </Theme>
    </TamaguiProvider>
  </StrictMode>,
);
