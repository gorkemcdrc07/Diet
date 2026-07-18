import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    BellOff,
    BellRing,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    RefreshCw,
    Send,
    ShieldCheck,
    Smartphone,
    TriangleAlert,
} from "lucide-react";

import {
    Capacitor,
} from "@capacitor/core";

import {
    LocalNotifications,
} from "@capacitor/local-notifications";

import {
    aktifBeslenmePlaniniGetir,
} from "../servisler/beslenmePlaniServisi";

import {
    bekleyenOgunBildirimleriniGetir,
    bildirimIzniIste,
    ogunBildirimleriniIptalEt,
    ogunBildirimleriniPlanla,
    tamAlarmAyariniAc,
    tamAlarmIzniniKontrolEt,
    testBildirimiGonder as nativeTestBildirimiGonder,
} from "../servisler/androidBildirim";

function izinMetniGetir(izin) {
    switch (izin) {
        case "granted":
            return "İzin verildi";

        case "denied":
            return "İzin reddedildi";

        case "prompt":
        case "prompt-with-rationale":
            return "İzin bekleniyor";

        case "unsupported":
            return "Desteklenmiyor";

        default:
            return "Kontrol ediliyor";
    }
}

function platformMetniGetir() {
    const platform =
        Capacitor.getPlatform();

    if (platform === "android") {
        return "Android uygulaması";
    }

    if (platform === "ios") {
        return "iOS uygulaması";
    }

    return "Web uygulaması";
}

function ogunleriBildirimFormatinaCevir(plan) {
    const ogunler =
        Array.isArray(plan?.ogunler)
            ? plan.ogunler
            : [];

    return ogunler
        .map((ogun, index) => {
            const ogunAdi =
                ogun?.ogun_adi ||
                ogun?.ogunAdi ||
                ogun?.baslik ||
                ogun?.ad ||
                ogun?.isim ||
                `Öğün ${index + 1}`;

            const saat =
                String(
                    ogun?.saat ||
                    ogun?.ogun_saati ||
                    "",
                ).slice(0, 5);

            return {
                ogunId:
                    ogun?.id ||
                    ogun?.ogun_id ||
                    ogun?.ogun_kodu ||
                    `ogun-${index}`,

                ogunAdi,
                saat,
                ikon:
                    ogun?.ikon ||
                    "🍽️",
            };
        })
        .filter(
            (ogun) =>
                Boolean(ogun.saat),
        );
}

export default function BildirimAyarlari() {
    const nativeUygulama =
        Capacitor.isNativePlatform();

    const androidUygulamasi =
        Capacitor.getPlatform() ===
        "android";

    const [
        izin,
        setIzin,
    ] = useState("prompt");

    const [
        bildirimlerAcik,
        setBildirimlerAcik,
    ] = useState(false);

    const [
        tamAlarmAcik,
        setTamAlarmAcik,
    ] = useState(false);

    const [
        planlananBildirimSayisi,
        setPlanlananBildirimSayisi,
    ] = useState(0);

    const [
        aktifPlanAdi,
        setAktifPlanAdi,
    ] = useState("");

    const [
        aktifOgunSayisi,
        setAktifOgunSayisi,
    ] = useState(0);

    const [
        yukleniyor,
        setYukleniyor,
    ] = useState(true);

    const [
        islem,
        setIslem,
    ] = useState("");

    const [
        mesaj,
        setMesaj,
    ] = useState("");

    const [
        hata,
        setHata,
    ] = useState("");

    const aktifPlaniGetir =
        useCallback(async () => {
            const plan =
                await aktifBeslenmePlaniniGetir();

            const ogunler =
                ogunleriBildirimFormatinaCevir(
                    plan,
                );

            setAktifPlanAdi(
                plan?.plan_adi ||
                plan?.planAdi ||
                plan?.ad ||
                "",
            );

            setAktifOgunSayisi(
                ogunler.length,
            );

            return {
                plan,
                ogunler,
            };
        }, []);

    const bildirimDurumunuKontrolEt =
        useCallback(async () => {
            setYukleniyor(true);
            setHata("");

            try {
                if (!nativeUygulama) {
                    setIzin(
                        "unsupported",
                    );

                    setBildirimlerAcik(
                        false,
                    );

                    setTamAlarmAcik(
                        false,
                    );

                    setPlanlananBildirimSayisi(
                        0,
                    );

                    return;
                }

                const izinSonucu =
                    await LocalNotifications
                        .checkPermissions();

                const aktiflikSonucu =
                    await LocalNotifications
                        .areEnabled();

                const yeniIzin =
                    izinSonucu?.display ||
                    "prompt";

                const sistemAktif =
                    yeniIzin ===
                    "granted" &&
                    Boolean(
                        aktiflikSonucu
                            ?.value,
                    );

                setIzin(
                    yeniIzin,
                );

                const tamAlarmSonucu =
                    await tamAlarmIzniniKontrolEt();

                setTamAlarmAcik(
                    Boolean(
                        tamAlarmSonucu
                            ?.tamAlarmAcik,
                    ),
                );

                const bekleyenler =
                    await bekleyenOgunBildirimleriniGetir();

                setPlanlananBildirimSayisi(
                    bekleyenler.length,
                );

                setBildirimlerAcik(
                    sistemAktif &&
                    bekleyenler.length >
                    0,
                );

                await aktifPlaniGetir();
            } catch (error) {
                console.error(
                    "Bildirim durumu kontrol edilemedi:",
                    error,
                );

                setHata(
                    error?.message ||
                    "Bildirim durumu kontrol edilemedi.",
                );

                setBildirimlerAcik(
                    false,
                );
            } finally {
                setYukleniyor(
                    false,
                );
            }
        }, [
            aktifPlaniGetir,
            nativeUygulama,
        ]);

    useEffect(() => {
        bildirimDurumunuKontrolEt();
    }, [
        bildirimDurumunuKontrolEt,
    ]);

    async function aktifPlaniBildirimlereBagla() {
        const {
            ogunler,
        } = await aktifPlaniGetir();

        if (
            ogunler.length === 0
        ) {
            throw new Error(
                "Aktif beslenme planında geçerli saat bilgisine sahip öğün bulunamadı.",
            );
        }

        const sonuc =
            await ogunBildirimleriniPlanla(
                ogunler,
                {
                    gunSayisi: 7,
                },
            );

        if (
            sonuc
                ?.tamAlarmGerekli
        ) {
            return {
                ...sonuc,
                ogunler,
            };
        }

        setPlanlananBildirimSayisi(
            sonuc
                ?.planlananBildirimSayisi ||
            0,
        );

        setAktifOgunSayisi(
            ogunler.length,
        );

        setBildirimlerAcik(
            Number(
                sonuc
                    ?.planlananBildirimSayisi ||
                0,
            ) > 0,
        );

        return {
            ...sonuc,
            ogunler,
        };
    }

    async function bildirimleriAc() {
        setIslem(
            "aciliyor",
        );

        setMesaj("");
        setHata("");

        try {
            if (!nativeUygulama) {
                throw new Error(
                    "Bu işlem yalnızca mobil uygulamada kullanılabilir.",
                );
            }

            const izinSonucu =
                await bildirimIzniIste();

            setIzin(
                izinSonucu?.izin ||
                "prompt",
            );

            if (
                !izinSonucu?.aktif
            ) {
                throw new Error(
                    "Android sistem ayarlarında uygulama bildirimleri kapalı görünüyor.",
                );
            }

            if (
                androidUygulamasi
            ) {
                const tamAlarm =
                    await tamAlarmIzniniKontrolEt();

                setTamAlarmAcik(
                    Boolean(
                        tamAlarm
                            ?.tamAlarmAcik,
                    ),
                );

                if (
                    !tamAlarm
                        ?.tamAlarmAcik
                ) {
                    setMesaj(
                        "Bildirim izni verildi. Şimdi açılacak Android ekranından Miço & Vicky için Alarmlar ve hatırlatıcılar iznini aç.",
                    );

                    await tamAlarmAyariniAc();

                    return;
                }
            }

            const planSonucu =
                await aktifPlaniBildirimlereBagla();

            if (
                planSonucu
                    ?.tamAlarmGerekli
            ) {
                setMesaj(
                    "Tam zamanlı bildirim için Android Alarmlar ve hatırlatıcılar iznini açman gerekiyor.",
                );

                await tamAlarmAyariniAc();

                return;
            }

            setTamAlarmAcik(
                true,
            );

            setMesaj(
                `${planSonucu.planlananBildirimSayisi} bildirim başarıyla planlandı. Her öğün için 15 dakika önce, 5 dakika önce ve tam saatinde hatırlatma yapılacak.`,
            );
        } catch (error) {
            console.error(
                "Bildirimler açılamadı:",
                error,
            );

            setHata(
                error?.message ||
                "Bildirimler açılamadı.",
            );
        } finally {
            setIslem("");
        }
    }

    async function tamAlarmIzniniAc() {
        setIslem(
            "tam-alarm",
        );

        setMesaj("");
        setHata("");

        try {
            if (
                !nativeUygulama
            ) {
                throw new Error(
                    "Bu işlem yalnızca mobil uygulamada kullanılabilir.",
                );
            }

            if (
                !androidUygulamasi
            ) {
                setTamAlarmAcik(
                    true,
                );

                return;
            }

            await tamAlarmAyariniAc();

            setMesaj(
                "Android ayar ekranı açıldı. Alarmlar ve hatırlatıcılar iznini açtıktan sonra uygulamaya dönüp Bildirimleri Planla butonuna tekrar bas.",
            );
        } catch (error) {
            console.error(
                "Tam alarm ayarı açılamadı:",
                error,
            );

            setHata(
                error?.message ||
                "Tam alarm ayarı açılamadı.",
            );
        } finally {
            setIslem("");
        }
    }

    async function bildirimleriYenidenPlanla() {
        setIslem(
            "planliyor",
        );

        setMesaj("");
        setHata("");

        try {
            if (
                !nativeUygulama
            ) {
                throw new Error(
                    "Bildirimler yalnızca mobil uygulamada planlanabilir.",
                );
            }

            await bildirimIzniIste();

            if (
                androidUygulamasi
            ) {
                const tamAlarm =
                    await tamAlarmIzniniKontrolEt();

                setTamAlarmAcik(
                    Boolean(
                        tamAlarm
                            ?.tamAlarmAcik,
                    ),
                );

                if (
                    !tamAlarm
                        ?.tamAlarmAcik
                ) {
                    throw new Error(
                        "Önce Alarmlar ve hatırlatıcılar iznini açmalısın.",
                    );
                }
            }

            const sonuc =
                await aktifPlaniBildirimlereBagla();

            setMesaj(
                `${sonuc.planlananBildirimSayisi} bildirim yeniden planlandı.`,
            );
        } catch (error) {
            console.error(
                "Bildirimler planlanamadı:",
                error,
            );

            setHata(
                error?.message ||
                "Bildirimler planlanamadı.",
            );
        } finally {
            setIslem("");
        }
    }

    async function bildirimleriKapat() {
        setIslem(
            "kapatiliyor",
        );

        setMesaj("");
        setHata("");

        try {
            const silinenSayisi =
                await ogunBildirimleriniIptalEt();

            await LocalNotifications
                .removeAllDeliveredNotifications()
                .catch(() => { });

            setPlanlananBildirimSayisi(
                0,
            );

            setBildirimlerAcik(
                false,
            );

            setMesaj(
                `${silinenSayisi} planlanmış öğün bildirimi kaldırıldı.`,
            );
        } catch (error) {
            console.error(
                "Bildirimler temizlenemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Bildirimler kapatılamadı.",
            );
        } finally {
            setIslem("");
        }
    }

    async function testBildirimiCalistir() {
        setIslem("test");
        setMesaj("");
        setHata("");

        try {
            if (
                !nativeUygulama
            ) {
                throw new Error(
                    "Test bildirimi yalnızca mobil uygulamada gönderilebilir.",
                );
            }

            await nativeTestBildirimiGonder();

            setIzin(
                "granted",
            );

            setMesaj(
                "Test bildirimi planlandı. Uygulamayı arka plana al; yaklaşık 5 saniye içinde gelmeli.",
            );
        } catch (error) {
            console.error(
                "Test bildirimi gönderilemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Test bildirimi gönderilemedi.",
            );
        } finally {
            setIslem("");
        }
    }

    return (
        <div className="standart-sayfa">
            <header className="sayfa-basligi">
                <div className="sayfa-baslik-ikon">
                    <BellRing
                        size={22}
                    />
                </div>

                <div>
                    <span>
                        Native hatırlatıcılar
                    </span>

                    <h1>
                        Bildirimler
                    </h1>
                </div>
            </header>

            {!nativeUygulama && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert
                        size={21}
                    />

                    <div>
                        <strong>
                            Mobil uygulama gerekli
                        </strong>

                        <span>
                            Yerel bildirimler Android
                            veya iOS uygulamasında
                            kullanılabilir.
                        </span>
                    </div>
                </section>
            )}

            <section className="bildirim-durum-karti">
                <div
                    className={[
                        "buyuk-bildirim-ikon",
                        bildirimlerAcik
                            ? "aktif"
                            : "",
                    ].join(" ")}
                >
                    {bildirimlerAcik ? (
                        <BellRing
                            size={32}
                        />
                    ) : (
                        <BellOff
                            size={32}
                        />
                    )}
                </div>

                <div className="bildirim-durum-metin">
                    <span>
                        Bildirim durumu
                    </span>

                    <strong>
                        {yukleniyor
                            ? "Kontrol ediliyor"
                            : bildirimlerAcik
                                ? "Bildirimler planlandı"
                                : "Bildirimler planlanmadı"}
                    </strong>

                    <small>
                        {platformMetniGetir()}
                        {" · "}
                        İzin:{" "}
                        {izinMetniGetir(
                            izin,
                        )}
                    </small>
                </div>
            </section>

            {hata && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert
                        size={20}
                    />

                    <div>
                        <strong>
                            İşlem başarısız
                        </strong>

                        <span>
                            {hata}
                        </span>
                    </div>
                </section>
            )}

            {mesaj && (
                <section className="bildirim-uyari basarili">
                    <CheckCircle2
                        size={20}
                    />

                    <div>
                        <strong>
                            İşlem tamamlandı
                        </strong>

                        <span>
                            {mesaj}
                        </span>
                    </div>
                </section>
            )}

            <section className="bildirim-islemleri">
                <button
                    type="button"
                    className="ana-bildirim-butonu"
                    disabled={
                        !nativeUygulama ||
                        Boolean(islem) ||
                        yukleniyor
                    }
                    onClick={
                        bildirimleriAc
                    }
                >
                    {islem ===
                        "aciliyor" ? (
                        <LoaderCircle
                            className="donen-ikon"
                            size={20}
                        />
                    ) : (
                        <BellRing
                            size={20}
                        />
                    )}

                    Bildirimleri Aç
                </button>

                {androidUygulamasi &&
                    !tamAlarmAcik && (
                        <button
                            type="button"
                            className="test-bildirimi-butonu"
                            disabled={
                                Boolean(
                                    islem,
                                )
                            }
                            onClick={
                                tamAlarmIzniniAc
                            }
                        >
                            {islem ===
                                "tam-alarm" ? (
                                <LoaderCircle
                                    className="donen-ikon"
                                    size={19}
                                />
                            ) : (
                                <Clock3
                                    size={19}
                                />
                            )}

                            Tam Alarm İznini Aç
                        </button>
                    )}

                <button
                    type="button"
                    className="test-bildirimi-butonu"
                    disabled={
                        !nativeUygulama ||
                        Boolean(islem) ||
                        yukleniyor
                    }
                    onClick={
                        bildirimleriYenidenPlanla
                    }
                >
                    {islem ===
                        "planliyor" ? (
                        <LoaderCircle
                            className="donen-ikon"
                            size={19}
                        />
                    ) : (
                        <RefreshCw
                            size={19}
                        />
                    )}

                    Bildirimleri Planla
                </button>

                <button
                    type="button"
                    className="test-bildirimi-butonu"
                    disabled={
                        !nativeUygulama ||
                        Boolean(islem) ||
                        yukleniyor
                    }
                    onClick={
                        testBildirimiCalistir
                    }
                >
                    {islem === "test" ? (
                        <LoaderCircle
                            className="donen-ikon"
                            size={19}
                        />
                    ) : (
                        <Send
                            size={19}
                        />
                    )}

                    Test Bildirimi Gönder
                </button>

                {planlananBildirimSayisi >
                    0 && (
                        <button
                            type="button"
                            className="bildirim-kapat-butonu"
                            disabled={
                                Boolean(islem)
                            }
                            onClick={
                                bildirimleriKapat
                            }
                        >
                            {islem ===
                                "kapatiliyor" ? (
                                <LoaderCircle
                                    className="donen-ikon"
                                    size={19}
                                />
                            ) : (
                                <BellOff
                                    size={19}
                                />
                            )}

                            Planı Temizle
                        </button>
                    )}

                <button
                    type="button"
                    className="test-bildirimi-butonu"
                    disabled={
                        Boolean(islem) ||
                        yukleniyor
                    }
                    onClick={
                        bildirimDurumunuKontrolEt
                    }
                >
                    <Smartphone
                        size={19}
                    />

                    Durumu Yenile
                </button>
            </section>

            <section className="ayar-listesi">
                <div className="ayar-satiri">
                    <div className="ayar-ikon kucuk">
                        <Clock3
                            size={20}
                        />
                    </div>

                    <div className="ayar-metin">
                        <strong>
                            Aktif beslenme planı
                        </strong>

                        <span>
                            {aktifPlanAdi ||
                                "Aktif plan bulunamadı"}
                        </span>
                    </div>

                    <span
                        className={[
                            "durum-etiketi",
                            aktifOgunSayisi >
                                0
                                ? ""
                                : "kapali",
                        ].join(" ")}
                    >
                        {aktifOgunSayisi} öğün
                    </span>
                </div>

                <div className="ayar-satiri">
                    <div className="ayar-ikon kucuk">
                        <BellRing
                            size={20}
                        />
                    </div>

                    <div className="ayar-metin">
                        <strong>
                            Planlanan bildirimler
                        </strong>

                        <span>
                            Önümüzdeki 7 gün için
                            oluşturulan bildirimler
                        </span>
                    </div>

                    <span
                        className={[
                            "durum-etiketi",
                            planlananBildirimSayisi >
                                0
                                ? ""
                                : "kapali",
                        ].join(" ")}
                    >
                        {
                            planlananBildirimSayisi
                        }
                    </span>
                </div>

                <div className="ayar-satiri">
                    <div className="ayar-ikon kucuk">
                        <Clock3
                            size={20}
                        />
                    </div>

                    <div className="ayar-metin">
                        <strong>
                            Tam zamanlı alarm
                        </strong>

                        <span>
                            Android'in bildirimleri
                            geciktirmeden çalıştırması
                            için gereklidir
                        </span>
                    </div>

                    <span
                        className={[
                            "durum-etiketi",
                            tamAlarmAcik
                                ? ""
                                : "kapali",
                        ].join(" ")}
                    >
                        {tamAlarmAcik
                            ? "İzinli"
                            : "İzin gerekli"}
                    </span>
                </div>

                <div className="ayar-satiri">
                    <div className="ayar-ikon kucuk">
                        <Smartphone
                            size={20}
                        />
                    </div>

                    <div className="ayar-metin">
                        <strong>
                            Bu cihaz
                        </strong>

                        <span>
                            Miço & Vicky Android
                            bildirim durumu
                        </span>
                    </div>

                    <span
                        className={[
                            "durum-etiketi",
                            izin ===
                                "granted"
                                ? ""
                                : "kapali",
                        ].join(" ")}
                    >
                        {izin ===
                            "granted"
                            ? "İzinli"
                            : "İzinsiz"}
                    </span>
                </div>
            </section>

            <section className="bilgi-kutusu">
                <ShieldCheck
                    size={21}
                />

                <div>
                    <strong>
                        Üç aşamalı hatırlatma
                    </strong>

                    <span>
                        Her öğün için 15 dakika
                        önce, 5 dakika önce ve tam
                        saatinde yerel Android
                        bildirimi oluşturulur.
                        Bildirimler internet
                        bağlantısı olmadan da
                        çalışabilir.
                    </span>
                </div>
            </section>
        </div>
    );
}