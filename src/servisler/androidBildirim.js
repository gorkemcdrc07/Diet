import { Capacitor } from "@capacitor/core";
import {
    LocalNotifications,
} from "@capacitor/local-notifications";

const BILDIRIM_KANALI =
    "genel-hatirlatmalar";

function nativeUygulamaMi() {
    return Capacitor.isNativePlatform();
}

async function androidKanaliniOlustur() {
    if (
        !nativeUygulamaMi() ||
        Capacitor.getPlatform() !== "android"
    ) {
        return;
    }

    await LocalNotifications.createChannel({
        id: BILDIRIM_KANALI,
        name: "KÜBRAM Hatırlatmaları",
        description:
            "İlaç, öğün ve günlük hedef bildirimleri",
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
    });
}

export async function bildirimIzniIste() {
    console.log(
        "Native platform:",
        Capacitor.isNativePlatform(),
    );

    console.log(
        "Platform:",
        Capacitor.getPlatform(),
    );

    if (!nativeUygulamaMi()) {
        throw new Error(
            "Uygulama native Android olarak algılanmadı.",
        );
    }

    let izin =
        await LocalNotifications
            .checkPermissions();

    console.log(
        "İzin istemeden önce:",
        izin,
    );

    if (izin.display !== "granted") {
        izin =
            await LocalNotifications
                .requestPermissions();
    }

    console.log(
        "İzin istendikten sonra:",
        izin,
    );

    if (izin.display !== "granted") {
        throw new Error(
            `Bildirim izni verilmedi: ${izin.display}`,
        );
    }

    await androidKanaliniOlustur();

    const aktiflik =
        await LocalNotifications.areEnabled();

    console.log(
        "Bildirimler aktif mi:",
        aktiflik,
    );

    return {
        native: true,
        izin: izin.display,
        aktif: Boolean(aktiflik.value),
    };
}

export async function testBildirimiGonder() {
    await bildirimIzniIste();

    const bildirimZamani =
        new Date(Date.now() + 5000);

    const sonuc =
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: 99001,
                    title: "KÜBRAM 💜",
                    body:
                        "Android bildirim sistemi başarıyla çalışıyor.",
                    channelId:
                        BILDIRIM_KANALI,
                    schedule: {
                        at: bildirimZamani,
                        allowWhileIdle: true,
                    },
                    extra: {
                        tur: "test",
                    },
                },
            ],
        });

    const bekleyenler =
        await LocalNotifications.getPending();

    console.log(
        "Planlama sonucu:",
        sonuc,
    );

    console.log(
        "Bekleyen bildirimler:",
        bekleyenler,
    );

    return {
        sonuc,
        bekleyenler,
    };
}