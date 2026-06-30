// Vite configuration — React + Tailwind CSS v4
// Runs: npm run dev | npm run build | npm run preview

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
});
