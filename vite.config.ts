import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import metadata from "./public/oauth-client-metadata.json" with { type: "json" };

const SERVER_HOST = "127.0.0.1";
const SERVER_PORT = 5173;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "tamagui-vendor": ["tamagui", "@tamagui/config"],
          "atproto-vendor": [
            "@atcute/client",
            "@atcute/atproto",
            "@atcute/oauth-browser-client",
          ],
          "react-vendor": ["react", "react-dom", "react-router"],
          "prism-vendor": ["prismjs"],
          "utils-vendor": ["react-simple-code-editor"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
