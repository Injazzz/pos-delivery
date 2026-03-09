import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
        type: "module",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Navigation fallback for SPA
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          // API: Menu list — Cache First (menu jarang berubah)
          {
            urlPattern: /^https?:\/\/.*\/api\/menus(\?.*)?$/,
            handler: "CacheFirst",
            options: {
              cacheName: "api-menus",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 jam
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // API: Orders — Network First (harus fresh)
          {
            urlPattern:
              /^https?:\/\/.*\/api\/(customer|cashier|manager)\/orders(\?.*)?$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-orders",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 menit
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // API: Dashboard — Network First
          {
            urlPattern: /^https?:\/\/.*\/api\/manager\/dashboard/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-dashboard",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 2,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Images — Cache First
          {
            urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|webp|gif|svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 hari
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "POS & Delivery App",
        short_name: "POS App",
        description: "Point of Sale & Delivery Order Management",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Order Baru",
            url: "/cashier/new-order",
            icons: [{ src: "/icons/shortcut-order.png", sizes: "96x96" }],
          },
          {
            name: "Dashboard",
            url: "/manager/dashboard",
            icons: [{ src: "/icons/shortcut-dashboard.png", sizes: "96x96" }],
          },
        ],
        categories: ["business", "productivity"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
