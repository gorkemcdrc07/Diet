import React from "react";
import ReactDOM from "react-dom/client";
import { Capacitor } from "@capacitor/core";

import App from "./App.jsx";
import "./index.css";

async function nativeOnbellegiTemizle() {
    if (!Capacitor.isNativePlatform()) {
        return;
    }

    try {
        if ("serviceWorker" in navigator) {
            const kayitlar =
                await navigator.serviceWorker.getRegistrations();

            await Promise.all(
                kayitlar.map((kayit) => kayit.unregister()),
            );
        }

        if ("caches" in window) {
            const cacheAdlari = await caches.keys();

            await Promise.all(
                cacheAdlari.map((cacheAdi) =>
                    caches.delete(cacheAdi),
                ),
            );
        }
    } catch (error) {
        console.warn(
            "Native uygulama önbelleği temizlenemedi:",
            error,
        );
    }
}

async function uygulamayiBaslat() {
    await nativeOnbellegiTemizle();

    ReactDOM.createRoot(
        document.getElementById("root"),
    ).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}

uygulamayiBaslat();