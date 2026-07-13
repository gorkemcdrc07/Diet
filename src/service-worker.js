import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
    let veri = {
        baslik: "Beslenme Hatırlatıcısı",
        mesaj: "Öğün saatini kontrol etmeyi unutma.",
        ikon: "/ikonlar/ikon-192.png",
        rozet: "/ikonlar/ikon-192.png",
        url: "/",
    };

    if (event.data) {
        try {
            veri = {
                ...veri,
                ...event.data.json(),
            };
        } catch {
            veri.mesaj = event.data.text();
        }
    }

    const bildirimSecenekleri = {
        body: veri.mesaj,
        icon: veri.ikon,
        badge: veri.rozet,
        image: veri.gorsel,
        vibrate: [200, 100, 200],
        tag: veri.tag || "beslenme-hatirlaticisi",
        renotify: true,
        requireInteraction: false,

        data: {
            url: veri.url || "/",
            ogunId: veri.ogunId || null,
        },

        actions: [
            {
                action: "uygulamayi-ac",
                title: "Programı Aç",
            },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(
            veri.baslik,
            bildirimSecenekleri,
        ),
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const hedefUrl =
        event.notification.data?.url ||
        "/";

    event.waitUntil(
        self.clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((istemciler) => {
                const acikSayfa = istemciler.find((istemci) => {
                    return "focus" in istemci;
                });

                if (acikSayfa) {
                    acikSayfa.navigate(hedefUrl);
                    return acikSayfa.focus();
                }

                if (self.clients.openWindow) {
                    return self.clients.openWindow(hedefUrl);
                }

                return undefined;
            }),
    );
});