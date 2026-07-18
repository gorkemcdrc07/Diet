import { Capacitor } from "@capacitor/core";
import {
    LocalNotifications,
} from "@capacitor/local-notifications";

const BILDIRIM_KANALI =
    "ogun-hatirlatmalari-v2";

const BILDIRIM_KAYNAGI =
    "mico-vicky-ogun";

const VARSAYILAN_GUN_SAYISI = 7;

const HATIRLATMA_TURLERI = [
    {
        tur: "15-dakika-once",
        dakikaOnce: 15,
        baslik: (ogunAdi) =>
            `${ogunAdi} için 15 dakika kaldı ⏰`,
        mesaj:
            "Öğününü hazırlamaya başlayabilirsin.",
    },
    {
        tur: "5-dakika-once",
        dakikaOnce: 5,
        baslik: (ogunAdi) =>
            `${ogunAdi} için 5 dakika kaldı 🍽️`,
        mesaj:
            "Miço ve Vicky seni bekliyor.",
    },
    {
        tur: "tam-saat",
        dakikaOnce: 0,
        baslik: (ogunAdi) =>
            `${ogunAdi} zamanı geldi 💜`,
        mesaj:
            "Öğününü tamamlamayı unutma.",
    },
];

function nativeUygulamaMi() {
    return Capacitor.isNativePlatform();
}

function androidMi() {
    return (
        Capacitor.getPlatform() ===
        "android"
    );
}

function saatBilgisiniAyir(saatDegeri) {
    const temizSaat = String(
        saatDegeri || "",
    )
        .trim()
        .replace(".", ":");

    const eslesme =
        temizSaat.match(
            /^(\d{1,2}):(\d{2})/,
        );

    if (!eslesme) {
        return null;
    }

    const saat = Number(eslesme[1]);
    const dakika = Number(eslesme[2]);

    if (
        saat < 0 ||
        saat > 23 ||
        dakika < 0 ||
        dakika > 59
    ) {
        return null;
    }

    return {
        saat,
        dakika,
    };
}

function ogunBilgisiniDuzenle(
    ogun,
    index,
) {
    const ogunId = String(
        ogun?.ogunId ||
        ogun?.ogun_id ||
        ogun?.id ||
        ogun?.ogun_kodu ||
        `ogun-${index}`,
    );

    const ogunAdi = String(
        ogun?.ogunAdi ||
        ogun?.ogun_adi ||
        ogun?.baslik ||
        ogun?.ad ||
        ogun?.isim ||
        "Öğün",
    ).trim();

    const saat = String(
        ogun?.saat ||
        ogun?.ogun_saati ||
        ogun?.zaman ||
        "",
    ).slice(0, 5);

    return {
        ogunId,
        ogunAdi,
        saat,
    };
}

function tarihAnahtariOlustur(tarih) {
    const yil =
        tarih.getFullYear();

    const ay = String(
        tarih.getMonth() + 1,
    ).padStart(2, "0");

    const gun = String(
        tarih.getDate(),
    ).padStart(2, "0");

    return `${yil}-${ay}-${gun}`;
}

function bildirimIdOlustur(metin) {
    let hash = 0;

    const kaynak =
        String(metin || "");

    for (
        let index = 0;
        index < kaynak.length;
        index += 1
    ) {
        hash =
            (
                hash * 31 +
                kaynak.charCodeAt(index)
            ) &
            0x7fffffff;
    }

    return Math.max(1, hash);
}

function bildirimTarihiOlustur({
    tarih,
    saat,
    dakika,
    dakikaOnce,
}) {
    const bildirimTarihi =
        new Date(tarih);

    bildirimTarihi.setHours(
        saat,
        dakika,
        0,
        0,
    );

    bildirimTarihi.setMinutes(
        bildirimTarihi.getMinutes() -
        dakikaOnce,
    );

    return bildirimTarihi;
}

export async function androidKanaliniOlustur() {
    if (
        !nativeUygulamaMi() ||
        !androidMi()
    ) {
        return;
    }

    await LocalNotifications
        .createChannel({
            id: BILDIRIM_KANALI,
            name:
                "Miço & Vicky Öğün Hatırlatmaları",
            description:
                "Öğünlerden 15 dakika önce, 5 dakika önce ve tam saatinde bildirim gönderir.",
            importance: 5,
            visibility: 1,
            vibration: true,
            lights: true,
        });
}

export async function bildirimIzniIste() {
    if (!nativeUygulamaMi()) {
        throw new Error(
            "Uygulama native Android veya iOS olarak algılanmadı.",
        );
    }

    let izin =
        await LocalNotifications
            .checkPermissions();

    if (
        izin?.display === "prompt" ||
        izin?.display ===
        "prompt-with-rationale"
    ) {
        izin =
            await LocalNotifications
                .requestPermissions();
    }

    if (
        izin?.display !==
        "granted"
    ) {
        throw new Error(
            `Bildirim izni verilmedi: ${izin?.display || "bilinmiyor"}`,
        );
    }

    await androidKanaliniOlustur();

    const aktiflik =
        await LocalNotifications
            .areEnabled();

    return {
        native: true,
        izin:
            izin.display,
        aktif:
            Boolean(
                aktiflik?.value,
            ),
    };
}

export async function tamAlarmIzniniKontrolEt() {
    if (!nativeUygulamaMi()) {
        return {
            durum: "unsupported",
            tamAlarmAcik: false,
        };
    }

    if (!androidMi()) {
        return {
            durum: "granted",
            tamAlarmAcik: true,
        };
    }

    try {
        const sonuc =
            await LocalNotifications
                .checkExactNotificationSetting();

        const durum =
            sonuc?.exact_alarm ||
            "unknown";

        return {
            durum,
            tamAlarmAcik:
                durum === "granted",
        };
    } catch (error) {
        console.error(
            "Tam alarm izni kontrol edilemedi:",
            error,
        );

        return {
            durum: "unknown",
            tamAlarmAcik: false,
        };
    }
}

export async function tamAlarmAyariniAc() {
    if (
        !nativeUygulamaMi() ||
        !androidMi()
    ) {
        return {
            durum: "granted",
            tamAlarmAcik: true,
        };
    }

    const sonuc =
        await LocalNotifications
            .changeExactNotificationSetting();

    const durum =
        sonuc?.exact_alarm ||
        "unknown";

    return {
        durum,
        tamAlarmAcik:
            durum === "granted",
    };
}

export async function bekleyenOgunBildirimleriniGetir() {
    if (!nativeUygulamaMi()) {
        return [];
    }

    const sonuc =
        await LocalNotifications
            .getPending();

    return (
        sonuc?.notifications || []
    ).filter(
        (bildirim) =>
            bildirim?.extra?.kaynak ===
            BILDIRIM_KAYNAGI,
    );
}

export async function ogunBildirimleriniIptalEt() {
    if (!nativeUygulamaMi()) {
        return 0;
    }

    const bekleyenler =
        await bekleyenOgunBildirimleriniGetir();

    if (
        bekleyenler.length === 0
    ) {
        return 0;
    }

    await LocalNotifications.cancel({
        notifications:
            bekleyenler.map(
                (bildirim) => ({
                    id: bildirim.id,
                }),
            ),
    });

    return bekleyenler.length;
}

function planlanacakBildirimleriOlustur(
    ogunler,
    gunSayisi,
) {
    const simdi = new Date();

    const minimumTarih =
        new Date(
            simdi.getTime() +
            10_000,
        );

    const duzenlenmisOgunler =
        (
            Array.isArray(ogunler)
                ? ogunler
                : []
        )
            .map(
                ogunBilgisiniDuzenle,
            )
            .filter(
                (ogun) =>
                    Boolean(
                        saatBilgisiniAyir(
                            ogun.saat,
                        ),
                    ),
            );

    const bildirimler = [];

    for (
        let gunFarki = 0;
        gunFarki < gunSayisi;
        gunFarki += 1
    ) {
        const gunTarihi =
            new Date();

        gunTarihi.setHours(
            0,
            0,
            0,
            0,
        );

        gunTarihi.setDate(
            gunTarihi.getDate() +
            gunFarki,
        );

        duzenlenmisOgunler
            .forEach((ogun) => {
                const saatBilgisi =
                    saatBilgisiniAyir(
                        ogun.saat,
                    );

                HATIRLATMA_TURLERI
                    .forEach(
                        (
                            hatirlatma,
                        ) => {
                            const bildirimTarihi =
                                bildirimTarihiOlustur({
                                    tarih:
                                        gunTarihi,
                                    saat:
                                        saatBilgisi.saat,
                                    dakika:
                                        saatBilgisi.dakika,
                                    dakikaOnce:
                                        hatirlatma.dakikaOnce,
                                });

                            if (
                                bildirimTarihi <=
                                minimumTarih
                            ) {
                                return;
                            }

                            const gunAnahtari =
                                tarihAnahtariOlustur(
                                    gunTarihi,
                                );

                            const idAnahtari = [
                                BILDIRIM_KAYNAGI,
                                gunAnahtari,
                                ogun.ogunId,
                                hatirlatma.tur,
                            ].join("-");

                            bildirimler.push({
                                id:
                                    bildirimIdOlustur(
                                        idAnahtari,
                                    ),

                                title:
                                    hatirlatma
                                        .baslik(
                                            ogun.ogunAdi,
                                        ),

                                body:
                                    hatirlatma
                                        .mesaj,

                                largeBody:
                                    hatirlatma
                                        .mesaj,

                                channelId:
                                    BILDIRIM_KANALI,

                                group:
                                    "ogun-hatirlatmalari",

                                autoCancel: true,

                                schedule: {
                                    at:
                                        bildirimTarihi,

                                    allowWhileIdle:
                                        true,
                                },

                                extra: {
                                    kaynak:
                                        BILDIRIM_KAYNAGI,

                                    tur:
                                        hatirlatma.tur,

                                    ogunId:
                                        ogun.ogunId,

                                    ogunAdi:
                                        ogun.ogunAdi,

                                    ogunSaati:
                                        ogun.saat,

                                    tarih:
                                        gunAnahtari,

                                    hedefSayfa:
                                        "program",
                                },
                            });
                        },
                    );
            });
    }

    return bildirimler;
}

export async function ogunBildirimleriniPlanla(
    ogunler,
    {
        gunSayisi =
        VARSAYILAN_GUN_SAYISI,
    } = {},
) {
    if (!nativeUygulamaMi()) {
        throw new Error(
            "Öğün bildirimleri yalnızca mobil uygulamada planlanabilir.",
        );
    }

    await bildirimIzniIste();
    await androidKanaliniOlustur();

    if (androidMi()) {
        const tamAlarm =
            await tamAlarmIzniniKontrolEt();

        if (
            !tamAlarm.tamAlarmAcik
        ) {
            return {
                planlananBildirimSayisi:
                    0,

                ogunSayisi:
                    Array.isArray(
                        ogunler,
                    )
                        ? ogunler.length
                        : 0,

                tamAlarmGerekli:
                    true,
            };
        }
    }

    await ogunBildirimleriniIptalEt();

    const guvenliGunSayisi =
        Math.min(
            Math.max(
                Number(gunSayisi) ||
                VARSAYILAN_GUN_SAYISI,
                1,
            ),
            14,
        );

    const bildirimler =
        planlanacakBildirimleriOlustur(
            ogunler,
            guvenliGunSayisi,
        );

    if (
        bildirimler.length === 0
    ) {
        return {
            planlananBildirimSayisi:
                0,

            ogunSayisi:
                Array.isArray(
                    ogunler,
                )
                    ? ogunler.length
                    : 0,

            tamAlarmGerekli:
                false,
        };
    }

    const PARCA_BOYUTU = 40;

    for (
        let index = 0;
        index < bildirimler.length;
        index += PARCA_BOYUTU
    ) {
        const parca =
            bildirimler.slice(
                index,
                index +
                PARCA_BOYUTU,
            );

        await LocalNotifications
            .schedule({
                notifications:
                    parca,
            });
    }

    const bekleyenler =
        await bekleyenOgunBildirimleriniGetir();

    return {
        planlananBildirimSayisi:
            bekleyenler.length,

        ogunSayisi:
            Array.isArray(
                ogunler,
            )
                ? ogunler.length
                : 0,

        tamAlarmGerekli:
            false,
    };
}

export async function testBildirimiGonder() {
    await bildirimIzniIste();

    const bildirimZamani =
        new Date(
            Date.now() + 5000,
        );

    const sonuc =
        await LocalNotifications
            .schedule({
                notifications: [
                    {
                        id:
                            bildirimIdOlustur(
                                `test-${Date.now()}`,
                            ),

                        title:
                            "Miço & Vicky 💜",

                        body:
                            "Android bildirim sistemi başarıyla çalışıyor.",

                        channelId:
                            BILDIRIM_KANALI,

                        autoCancel:
                            true,

                        schedule: {
                            at:
                                bildirimZamani,

                            allowWhileIdle:
                                true,
                        },

                        extra: {
                            kaynak:
                                "mico-vicky-test",

                            tur:
                                "test",
                        },
                    },
                ],
            });

    const bekleyenler =
        await LocalNotifications
            .getPending();

    return {
        sonuc,
        bekleyenler,
    };
}