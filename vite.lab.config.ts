import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src/lab",
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  server: {
    host: true,
    port: 3001,
    proxy: {
      "/api/market": {
        target: "https://api.sunflower-land.com",
        changeOrigin: true,
        rewrite: () => "/community/trades/rates",
      },
      "/api/farm": {
        target: "https://api.sunflower-land.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/farm/, "/community/farms"),
      },
    },
  },
});
