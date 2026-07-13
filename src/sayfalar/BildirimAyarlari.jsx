import { useEffect, useState } from "react";
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
    aboneligiKapat,
    bildirimDestekleniyorMu,
    bildirimIzniGetir,
    mevcutAboneligiGetir,
    pushAboneligiOlustur,
    yerelTestBildirimiGoster,
} from "../servisler/bildirimServisi";

import {
    telefonuKaydet,
    telefonuPasifYap,
} from "../servisler/telefonBildirimServisi";

function izinMetniGetir(izin) {
    switch (izin) {
        case "granted":
            return "İzin verildi";

        case "denied":
            return "İzin reddedildi";

        case "default":
            return "Henüz izin verilmedi";

        default:
            return "Desteklenmiyor";
    }
}

export default function BildirimAyarlari() {
    const [destekleniyor] = useState(
        bildirimDestekleniyorMu(),
    );

    const [izin, setIzin] = useState(
        bildirimIzniGetir(),
    );

    const [bildirimlerAcik, setBildirimlerAcik] =
        useState(false);

    const [yukleniyor, setYukleniyor] =
        useState(true);

    const [islem, setIslem] = useState("");
    const [mesaj, setMesaj] = useState("");
    const [hata, setHata] = useState("");

    useEffect(() => {
        async function bildirimDurumunuKontrolEt() {
            if (!destekleniyor) {
                setYukleniyor(false);
                return;
            }

            try {
                const mevcutBildirimKaydi =
                    await mevcutAboneligiGetir();

                setBildirimlerAcik(
                    Boolean(mevcutBildirimKaydi),
                );

                setIzin(
                    bildirimIzniGetir(),
                );
            } catch (error) {
                console.error(error);

                setHata(
                    error?.message ||
                    "Bildirim durumu kontrol edilemedi.",
                );
            } finally {
                setYukleniyor(false);
            }
        }

        bildirimDurumunuKontrolEt();
    }, [destekleniyor]);

    async function bildirimleriAc() {
        setIslem("aciliyor");
        setMesaj("");
        setHata("");

        try {
            const pushAboneligi =
                await pushAboneligiOlustur();

            await telefonuKaydet(
                pushAboneligi,
            );

            setBildirimlerAcik(true);
            setIzin(
                bildirimIzniGetir(),
            );

            setMesaj(
                "Bildirimler hazır. Öğün saatlerinde bu telefona hatırlatma gelecek.",
            );
        } catch (error) {
            console.error(error);

            setHata(
                error?.message ||
                "Bildirimler açılamadı.",
            );

            setIzin(
                bildirimIzniGetir(),
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
            await telefonuPasifYap();
            await aboneligiKapat();

            setBildirimlerAcik(false);

            setMesaj(
                "Bu telefondaki öğün bildirimleri kapatıldı.",
            );
        } catch (error) {
            console.error(error);

            setHata(
                error?.message ||
                "Bildirimler kapatılamadı.",
            );
        } finally {
            setIslem("");
        }
    }

    async function testBildirimiGonder() {
        setIslem("test");
        setMesaj("");
        setHata("");

        try {
            await yerelTestBildirimiGoster();

            setIzin(
                bildirimIzniGetir(),
            );

            setMesaj(
                "Test bildirimi başarıyla gönderildi.",
            );
        } catch (error) {
            console.error(error);

            setHata(
                error?.message ||
                "Test bildirimi gönderilemedi.",
            );

            setIzin(
                bildirimIzniGetir(),
            );
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
                        Öğün hatırlatıcıları
                    </span>

                    <h1>Bildirimler</h1>
                </div>
            </header>

            {!destekleniyor && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert size={21} />

                    <div>
                        <strong>
                            Bildirim desteği bulunamadı
                        </strong>

                        <span>
                            Uygulamayı güncel bir tarayıcıdan
                            veya telefona yükledikten sonra aç.
                        </span>
                    </div>
                </section>
            )}

            <section className="bildirim-durum-karti">
                <div
                    className={`buyuk-bildirim-ikon ${bildirimlerAcik
                            ? "aktif"
                            : ""
                        }`}
                >
                    {bildirimlerAcik ? (
                        <BellRing size={32} />
                    ) : (
                        <BellOff size={32} />
                    )}
                </div>

                <div className="bildirim-durum-metin">
                    <span>Bildirim durumu</span>

                    <strong>
                        {yukleniyor
                            ? "Kontrol ediliyor"
                            : bildirimlerAcik
                                ? "Bildirimler hazır"
                                : "Bildirimler kapalı"}
                    </strong>

                    <small>
                        Tarayıcı izni:{" "}
                        {izinMetniGetir(izin)}
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

                        <span>{hata}</span>
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

                        <span>{mesaj}</span>
                    </div>
                </section>
            )}

            <section className="bildirim-islemleri">
                {!bildirimlerAcik ? (
                    <button
                        type="button"
                        className="ana-bildirim-butonu"
                        disabled={
                            !destekleniyor ||
                            Boolean(islem) ||
                            yukleniyor
                        }
                        onClick={bildirimleriAc}
                    >
                        {islem === "aciliyor" ? (
                            <LoaderCircle
                                className="donen-ikon"
                                size={20}
                            />
                        ) : (
                            <BellRing size={20} />
                        )}

                        Bildirimleri Aç
                    </button>
                ) : (
                    <button
                        type="button"
                        className="bildirim-kapat-butonu"
                        disabled={Boolean(islem)}
                        onClick={bildirimleriKapat}
                    >
                        {islem ===
                            "kapatiliyor" ? (
                            <LoaderCircle
                                className="donen-ikon"
                                size={20}
                            />
                        ) : (
                            <BellOff size={20} />
                        )}

                        Bildirimleri Kapat
                    </button>
                )}

                <button
                    type="button"
                    className="test-bildirimi-butonu"
                    disabled={
                        !destekleniyor ||
                        Boolean(islem)
                    }
                    onClick={testBildirimiGonder}
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
                            Programdaki yedi öğün
                            saatinde
                        </span>
                    </div>

                    <span
                        className={`durum-etiketi ${bildirimlerAcik
                                ? ""
                                : "kapali"
                            }`}
                    >
                        {bildirimlerAcik
                            ? "Açık"
                            : "Kapalı"}
                    </span>
                </div>

                <div className="ayar-satiri">
                    <div className="ayar-ikon kucuk">
                        <Smartphone size={20} />
                    </div>

                    <div className="ayar-metin">
                        <strong>
                            Sevgilimin telefonu
                        </strong>

                        <span>
                            Bu telefonun bildirim
                            durumu
                        </span>
                    </div>

                    <span
                        className={`durum-etiketi ${bildirimlerAcik
                                ? ""
                                : "kapali"
                            }`}
                    >
                        {bildirimlerAcik
                            ? "Hazır"
                            : "Kayıtlı değil"}
                    </span>
                </div>
            </section>

            <section className="bilgi-kutusu">
                <ShieldCheck size={21} />

                <div>
                    <strong>
                        Yalnızca öğün hatırlatmaları
                    </strong>

                    <span>
                        Bu uygulama sadece beslenme
                        programındaki saatlerde bildirim
                        gönderecek.
                    </span>
                </div>
            </section>
        </div>
    );
}