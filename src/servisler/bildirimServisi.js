function base64UrlToUint8Array(base64Url) {
    const padding = "=".repeat(
        (4 - (base64Url.length % 4)) % 4,
    );

    const base64 = (base64Url + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const hamVeri = window.atob(base64);

    return Uint8Array.from(
        [...hamVeri].map((karakter) =>
            karakter.charCodeAt(0),
        ),
    );
}

export function bildirimDestekleniyorMu() {
    return (
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
    );
}

export function bildirimIzniGetir() {
    if (!("Notification" in window)) {
        return "desteklenmiyor";
    }

    return Notification.permission;
}

export async function serviceWorkerKaydiniGetir() {
    if (!("serviceWorker" in navigator)) {
        throw new Error(
            "Bu tarayıcı Service Worker özelliğini desteklemiyor.",
        );
    }

    return navigator.serviceWorker.ready;
}

export async function mevcutAboneligiGetir() {
    const kayit = await serviceWorkerKaydiniGetir();

    return kayit.pushManager.getSubscription();
}

export async function bildirimIzniIste() {
    if (!bildirimDestekleniyorMu()) {
        throw new Error(
            "Bu cihaz veya tarayıcı push bildirimlerini desteklemiyor.",
        );
    }

    const izin = await Notification.requestPermission();

    if (izin !== "granted") {
        if (izin === "denied") {
            throw new Error(
                "Bildirim izni reddedildi. Tarayıcı ayarlarından tekrar açabilirsin.",
            );
        }

        throw new Error(
            "Bildirim izni verilmedi.",
        );
    }

    return izin;
}

export async function pushAboneligiOlustur() {
    const vapidPublicKey =
        import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
        throw new Error(
            "VAPID public key henüz tanımlanmadı.",
        );
    }

    await bildirimIzniIste();

    const kayit = await serviceWorkerKaydiniGetir();

    const mevcutAbonelik =
        await kayit.pushManager.getSubscription();

    if (mevcutAbonelik) {
        return mevcutAbonelik;
    }

    return kayit.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
            base64UrlToUint8Array(vapidPublicKey),
    });
}

export async function aboneligiKapat() {
    const abonelik = await mevcutAboneligiGetir();

    if (!abonelik) {
        return false;
    }

    return abonelik.unsubscribe();
}

export async function yerelTestBildirimiGoster() {
    const izin = await bildirimIzniIste();

    if (izin !== "granted") {
        throw new Error(
            "Bildirim izni verilmedi.",
        );
    }

    const kayit = await serviceWorkerKaydiniGetir();

    await kayit.showNotification(
        "Test bildirimi başarılı ❤️",
        {
            body: "Beslenme hatırlatıcıların bu telefonda çalışabilecek.",
            icon: "/ikonlar/ikon-192.png",
            badge: "/ikonlar/ikon-192.png",
            vibrate: [200, 100, 200],
            tag: "test-bildirimi",

            data: {
                url: "/",
            },
        },
    );
}