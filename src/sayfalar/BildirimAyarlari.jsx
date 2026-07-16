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
    bildirimIzniIste,
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

export default function BildirimAyarlari() {
    const nativeUygulama =
        Capacitor.isNativePlatform();

    const [
        izin,
        setIzin,
    ] = useState("prompt");

    const [
        bildirimlerAcik,
        setBildirimlerAcik,
    ] = useState(false);

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

    const bildirimDurumunuKontrolEt =
        useCallback(async () => {
            setYukleniyor(true);
            setHata("");

            try {
                if (!nativeUygulama) {
                    setIzin("unsupported");
                    setBildirimlerAcik(false);

                    setHata(
                        "Native bildirimler yalnızca Android veya iOS uygulamasında kullanılabilir.",
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

                const aktifMi =
                    yeniIzin === "granted" &&
                    Boolean(
                        aktiflikSonucu?.value,
                    );

                setIzin(yeniIzin);
                setBildirimlerAcik(
                    aktifMi,
                );
            } catch (error) {
                console.error(
                    "Native bildirim durumu kontrol edilemedi:",
                    error,
                );

                setHata(
                    error?.message ||
                    "Bildirim durumu kontrol edilemedi.",
                );

                setBildirimlerAcik(false);
            } finally {
                setYukleniyor(false);
            }
        }, [nativeUygulama]);

    useEffect(() => {
        bildirimDurumunuKontrolEt();
    }, [bildirimDurumunuKontrolEt]);

    async function bildirimleriAc() {
        setIslem("aciliyor");
        setMesaj("");
        setHata("");

        try {
            if (!nativeUygulama) {
                throw new Error(
                    "Bu işlem yalnızca mobil uygulamada kullanılabilir.",
                );
            }

            const sonuc =
                await bildirimIzniIste();

            const yeniIzin =
                sonuc?.izin ||
                "prompt";

            setIzin(yeniIzin);

            if (
                yeniIzin !==
                "granted"
            ) {
                throw new Error(
                    "Bildirim izni verilmedi.",
                );
            }

            const aktiflik =
                await LocalNotifications
                    .areEnabled();

            const aktifMi =
                Boolean(
                    aktiflik?.value,
                );

            setBildirimlerAcik(
                aktifMi,
            );

            if (!aktifMi) {
                throw new Error(
                    "Android sistem ayarlarında bildirimler kapalı görünüyor.",
                );
            }

            setMesaj(
                "Android bildirimleri başarıyla açıldı.",
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

    async function bildirimleriKapat() {
        setIslem("kapatiliyor");
        setMesaj("");
        setHata("");

        try {
            await LocalNotifications
                .cancel({
                    notifications: [],
                })
                .catch(() => { });

            await LocalNotifications
                .removeAllDeliveredNotifications()
                .catch(() => { });

            setMesaj(
                "Planlanmış bildirimler temizlendi. Sistem iznini tamamen kapatmak için Android Ayarlar > Uygulamalar > Miço&Vicky > Bildirimler bölümünü kullan.",
            );

            await bildirimDurumunuKontrolEt();
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
            if (!nativeUygulama) {
                throw new Error(
                    "Test bildirimi yalnızca mobil uygulamada gönderilebilir.",
                );
            }

            await nativeTestBildirimiGonder();

            setIzin("granted");
            setBildirimlerAcik(true);

            setMesaj(
                "Test bildirimi planlandı. Uygulamayı arka plana al; yaklaşık 5 saniye içinde gelecek.",
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

            await bildirimDurumunuKontrolEt();
        } finally {
            setIslem("");
        }
    }

    return (
        <div className="standart-sayfa">
            <header className="sayfa-basligi">
                <div className="sayfa-baslik-ikon">
                    <BellRing size={22} />
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
                    <TriangleAlert size={21} />

                    <div>
                        <strong>
                            Mobil uygulama gerekli
                        </strong>

                        <span>
                            Native bildirimleri kullanmak
                            için uygulamayı Android veya
                            iOS uygulaması olarak aç.
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
                        <BellRing size={32} />
                    ) : (
                        <BellOff size={32} />
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
                                ? "Bildirimler açık"
                                : "Bildirimler kapalı"}
                    </strong>

                    <small>
                        {platformMetniGetir()}
                        {" · "}
                        Android izni:{" "}
                        {izinMetniGetir(
                            izin,
                        )}
                    </small>
                </div>
            </section>

            {hata && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert size={20} />

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
                    <CheckCircle2 size={20} />

                    <div>
                        <strong>
                            İşlem başarılı
                        </strong>

                        <span>
                            {mesaj}
                        </span>
                    </div>
                </section>
            )}

            <section className="bildirim-islemleri">
                {!bildirimlerAcik ? (
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
                ) : (
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
                                size={20}
                            />
                        ) : (
                            <BellOff
                                size={20}
                            />
                        )}

                        Bildirimleri Yönet
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
                        testBildirimiCalistir
                    }
                >
                    {islem === "test" ? (
                        <LoaderCircle
                            className="donen-ikon"
                            size={19}
                        />
                    ) : (
                        <Send size={19} />
                    )}

                    Test Bildirimi Gönder
                </button>

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
                    <Smartphone size={19} />

                    Durumu Yenile
                </button>
            </section>

            <section className="ayar-listesi">
                <div className="ayar-satiri">
                    <div className="ayar-ikon kucuk">
                        <Clock3 size={20} />
                    </div>

                    <div className="ayar-metin">
                        <strong>
                            Öğün hatırlatmaları
                        </strong>

                        <span>
                            Beslenme programındaki
                            öğün saatlerinde
                        </span>
                    </div>

                    <span
                        className={[
                            "durum-etiketi",
                            bildirimlerAcik
                                ? ""
                                : "kapali",
                        ].join(" ")}
                    >
                        {bildirimlerAcik
                            ? "Hazır"
                            : "Kapalı"}
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
                            Miço&Vicky uygulamasının
                            Android bildirim durumu
                        </span>
                    </div>

                    <span
                        className={[
                            "durum-etiketi",
                            bildirimlerAcik
                                ? ""
                                : "kapali",
                        ].join(" ")}
                    >
                        {bildirimlerAcik
                            ? "İzinli"
                            : "İzinsiz"}
                    </span>
                </div>
            </section>

            <section className="bilgi-kutusu">
                <ShieldCheck size={21} />

                <div>
                    <strong>
                        Cihaz üzerinde çalışır
                    </strong>

                    <span>
                        Yerel Android bildirimleri
                        internet bağlantısı olmasa bile
                        planlanan saatte gösterilebilir.
                        Bir sonraki adımda ilaç ve öğün
                        saatlerini bu sisteme
                        bağlayacağız.
                    </span>
                </div>
            </section>
        </div>
    );
}