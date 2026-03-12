import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const openaiKey = env.VITE_OPENAI_API_KEY?.trim();

  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/openai": {
        target: "https://api.openai.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            if (openaiKey) proxyReq.setHeader("Authorization", `Bearer ${openaiKey}`);
          });
        },
        secure: true,
        ws: false,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: false,
      },
      "/angelo-media": {
        target: "http://localhost:9000",
        changeOrigin: false,
        secure: false,
        ws: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
