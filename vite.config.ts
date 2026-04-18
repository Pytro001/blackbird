import type { Connect } from "vite";
import { defineConfig } from "vite";

/** Serve index.html for SPA routes (e.g. /product) in dev and preview. */
function spaFallback(): {
  name: string;
  configureServer: (server: { middlewares: Connect.Server }) => void;
  configurePreviewServer: (server: { middlewares: Connect.Server }) => void;
} {
  return {
    name: "spa-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const spa =
          url === "/product" ||
          url.startsWith("/product/") ||
          url === "/email" ||
          url.startsWith("/email/") ||
          url === "/thanks" ||
          url.startsWith("/thanks/") ||
          url === "/how-to-use" ||
          url.startsWith("/how-to-use/");
        if (spa) {
          const q = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
          req.url = "/" + q;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        const spa =
          url === "/product" ||
          url.startsWith("/product/") ||
          url === "/email" ||
          url.startsWith("/email/") ||
          url === "/thanks" ||
          url.startsWith("/thanks/") ||
          url === "/how-to-use" ||
          url.startsWith("/how-to-use/");
        if (spa) {
          const q = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
          req.url = "/" + q;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [spaFallback()],
  server: {
    port: 5173,
  },
});
