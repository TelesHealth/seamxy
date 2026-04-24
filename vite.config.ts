import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isReplit = !!process.env.REPL_ID;

export default defineConfig(async () => {
  const plugins = [react()];

  if (isReplit) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    const { devBanner } = await import("@replit/vite-plugin-dev-banner");
    const runtimeErrorModal = (await import("@replit/vite-plugin-runtime-error-modal")).default;
    plugins.push(cartographer() as any, devBanner() as any, runtimeErrorModal() as any);
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client/src"),
        "@shared": path.resolve(__dirname, "./shared"),
        "@assets": path.resolve(__dirname, "./attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});
