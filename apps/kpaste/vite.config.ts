import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import prismjs from "vite-plugin-prismjs";
import metadata from "./public/oauth-client-metadata.json" with { type: "json" };

const SERVER_HOST = "127.0.0.1";
const SERVER_PORT = 5173;

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  plugins: [
    prismjs({
      languages: [
        "javascript",
        "typescript",
        "python",
        "java",
        "cpp",
        "csharp",
        "rust",
        "go",
        "html",
        "css",
        "json",
        "markdown",
        "bash",
      ],
      theme: "tomorrow",
      css: true,
    }),
    react(),
    {
      name: "oauth-env-injection",
      config(_conf, { command }) {
        if (command === "build") {
          process.env.VITE_OAUTH_CLIENT_ID = metadata.client_id;
          process.env.VITE_OAUTH_REDIRECT_URI = metadata.redirect_uris[0];
          process.env.VITE_OAUTH_SCOPE = metadata.scope;
        } else {
          const redirectUri = `http://${SERVER_HOST}:${SERVER_PORT}/oauth/callback.html`;
          const clientId = `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(metadata.scope)}`;

          process.env.VITE_OAUTH_CLIENT_ID = clientId;
          process.env.VITE_OAUTH_REDIRECT_URI = redirectUri;
          process.env.VITE_OAUTH_SCOPE = metadata.scope;
        }
      },
    },
  ],
  server: {
    host: SERVER_HOST,
    port: SERVER_PORT,
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "src/vite-env.d.ts",
        "src/lexicons/types/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "src/main.tsx",
        "scripts/",
        "public/",
        "dist/",
        "*.config.{ts,js}",
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 75,
          statements: 75,
        },
        "src/hooks/": {
          branches: 85,
          functions: 85,
          lines: 90,
          statements: 90,
        },
        "src/auth/": {
          branches: 80,
          functions: 80,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
});
