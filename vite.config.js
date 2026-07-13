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
                name: "GÃ¼zelim Ä°Ã§in Beslenme AsistanÄ±",
                short_name: "Beslenme",

                description:
                    "GÃ¼nlÃ¼k beslenme programÄ±, su takibi ve Ã¶ÄŸÃ¼n hatÄ±rlatÄ±cÄ±larÄ±.",

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
                enabled: true,
                type: "module",
            },

            injectManifest: {
                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,webp,json}",
                ],
            },
        }),
    ],
});