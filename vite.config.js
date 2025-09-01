import { defineConfig } from "vite";
import path from "path"; // ✅ import path for alias
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
	plugins: [react(), tailwindcss()],

	// ✅ Import alias for Shadcn UI
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},

	// Vite options tailored for Tauri
	clearScreen: false,
	server: {
		port: 5173,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
				protocol: "ws",
				host,
				port: 1421,
			}
			: undefined,
		watch: {
			// ignore Tauri rust files
			ignored: ["**/src-tauri/**"],
		},
	},
}));
