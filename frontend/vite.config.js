import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: "0.0.0.0",
  //   port: 5173,
  //   strictPort: true,
  //   origin:
  //     "https://5d62-2001-448a-2040-8cda-9061-7147-6a22-5b38.ngrok-free.app",
  // },

  // Nyalakan untuk menggunakan ngrok
});
