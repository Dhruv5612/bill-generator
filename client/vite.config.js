import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Invoice Generator',
        short_name: 'InvoiceGen',
        description: 'Create and manage your bills and invoices',
        theme_color: '#2563eb',
        background_color: '#f9fafb',
        display: 'standalone',
        icons: [
          {
            src: '/placeholder.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/placeholder.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
