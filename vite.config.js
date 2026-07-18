import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),

        VitePWA({
            registerType: "autoUpdate",

            strategies: "injectManifest",

            srcDir: "src",
            filename: "service-worker.js",

            injectRegister: "auto",

            includeAssets: [
                "ikonlar/ikon-192.png",
                "ikonlar/ikon-512.png",
                "ikonlar/ikon-maskable-512.png",
            ],

            manifest: {
                name: "Güzelim İçin Beslenme Asistanı",
                short_name: "Beslenme",

                description:
                    "Günlük beslenme programı, su takibi ve öğün hatırlatıcıları.",

                lang: "tr",
                dir: "ltr",

                start_url: "/",
                scope: "/",

                display: "standalone",
                orientation: "portrait",

                background_color: "#f7f4f8",
                theme_color: "#e96f91",

                categories: [
                    "health",
                    "lifestyle",
                ],

                icons: [
                    {
                        src: "/ikonlar/ikon-192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/ikonlar/ikon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/ikonlar/ikon-maskable-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },

            devOptions: {
                enabled: false,
            },

            injectManifest: {
                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,webp,json}",
                ],

                maximumFileSizeToCacheInBytes:
                    5 * 1024 * 1024,
            },
        }),
    ],
});