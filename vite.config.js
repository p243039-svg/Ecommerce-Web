import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Supabase or standard client code might use process.env in some places.
    // Vite uses import.meta.env, but we define process.env here as a fallback
    // to avoid breaking changes to the business logic.
    "process.env": {},
  },
});
