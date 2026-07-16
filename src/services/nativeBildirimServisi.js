import { Capacitor } from "@capacitor/core";
import {
    LocalNotifications,
} from "@capacitor/local-notifications";

const BILDIRIM_KANALI =
    "ilac-hatirlatmalari";

function nativeUygulamaMi() {
    return Capacitor.isNativePlatform();
}

export async function bildirimDurumunuGetir() {
    if (!nativeUygulamaMi()) {
        return {
            native: false,
            izin: "web",
            aktif: false,
        };
    }

    const izin =
        await LocalNotifications
            .checkPermissions();

    const aktiflik =
        await LocalNotifications
            .areEnabled();

    return {
        native: true,
        izin: izin.display,
        aktif: Boolean(
            aktiflik.value,
        ),
    };
}

export async function bildirimIzniIste() {
    if (!nativeUygulamaMi()) {
        throw new Error(
            "Bu işlem yalnızca Android uygulamasında kullanılabilir.",
        );
    }

    let izin =
        await LocalNotifications
            .checkPermissions();

    if (izin.display !== "granted") {
        izin =
            await LocalNotifications
                .requestPermissions();
    }

    if (izin.display !== "granted") {
        throw new Error(
            "Bildirim izni verilmedi.",
        );
    }

    await androidBildirimKanaliOlustur();

    return izin;
}

export async function androidBildirimKanaliOlustur() {
    if (
        !nativeUygulamaMi() ||
        Capacitor.getPlatform() !==
        "android"
    ) {
        return;
    }

    await LocalNotifications
        .createChannel({
            id: BILDIRIM_KANALI,
            name: "İlaç Hatırlatmaları",
            description:
                "İlaç saatleri ve tekrar hatırlatmaları",
            importance: 5,
            visibility: 1,
            vibration: true,
            lights: true,
        });
}

export async function testBildirimiGonder() {
    await bildirimIzniIste();

    const tarih =
        new Date(
            Date.now() + 5000,
        );

    await LocalNotifications.schedule({
        notifications: [
            {
                id: 90001,
                title:
                    "💊 Test bildirimi",
                body:
                    "Android bildirimi başarıyla çalışıyor.",
                channelId:
                    BILDIRIM_KANALI,
                schedule: {
                    at: tarih,
                    allowWhileIdle: true,
                },
                extra: {
                    tur:
                        "bildirim-testi",
                },
            },
        ],
    });

    return {
        zaman: tarih,
    };
}