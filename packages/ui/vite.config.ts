import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "components/ui/index": resolve(__dirname, "src/components/ui/index.ts"),
        "components/auth/index": resolve(
          __dirname,
          "src/components/auth/index.ts",
        ),
        "components/layout/index": resolve(
          __dirname,
          "src/components/layout/index.ts",
        ),
        "constants/languages": resolve(__dirname, "src/constants/languages.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-error-boundary",
        "react-native-web",
        "@kpaste-app/atproto-auth",
        "@tamagui/button",
        "@tamagui/card",
        "@tamagui/core",
        "@tamagui/image",
        "@tamagui/input",
        "@tamagui/label",
        "@tamagui/lucide-icons",
        "@tamagui/scroll-view",
        "@tamagui/select",
        "@tamagui/sheet",
        "@tamagui/stacks",
        "@tamagui/text",
        "@tamagui/tooltip",
        "@heroicons/react",
      ],
      output: {
        assetFileNames: (assetInfo) => {
          // Keep CSS modules in their original structure
          if (assetInfo.name?.endsWith(".css")) {
            return assetInfo.name;
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: true,
  },
});
