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
            return "Ä°zin verildi";

        case "denied":
            return "Ä°zin reddedildi";

        case "default":
            return "HenÃ¼z izin verilmedi";

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
                "Bildirimler hazÄ±r. Ã–ÄŸÃ¼n saatlerinde bu telefona hatÄ±rlatma gelecek.",
            );
        } catch (error) {
            console.error(error);

            setHata(
                error?.message ||
                "Bildirimler aÃ§Ä±lamadÄ±.",
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
                "Bu telefondaki Ã¶ÄŸÃ¼n bildirimleri kapatÄ±ldÄ±.",
            );
        } catch (error) {
            console.error(error);

            setHata(
                error?.message ||
                "Bildirimler kapatÄ±lamadÄ±.",
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
                "Test bildirimi baÅŸarÄ±yla gÃ¶nderildi.",
            );
        } catch (error) {
            console.error(error);

            setHata(
                error?.message ||
                "Test bildirimi gÃ¶nderilemedi.",
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
                        Ã–ÄŸÃ¼n hatÄ±rlatÄ±cÄ±larÄ±
                    </span>

                    <h1>Bildirimler</h1>
                </div>
            </header>

            {!destekleniyor && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert size={21} />

                    <div>
                        <strong>
                            Bildirim desteÄŸi bulunamadÄ±
                        </strong>

                        <span>
                            UygulamayÄ± gÃ¼ncel bir tarayÄ±cÄ±dan
                            veya telefona yÃ¼kledikten sonra aÃ§.
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
                                ? "Bildirimler hazÄ±r"
                                : "Bildirimler kapalÄ±"}
                    </strong>

                    <small>
                        TarayÄ±cÄ± izni:{" "}
                        {izinMetniGetir(izin)}
                    </small>
                </div>
            </section>

            {hata && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert size={20} />

                    <div>
                        <strong>
                            Ä°ÅŸlem baÅŸarÄ±sÄ±z
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
                            Ä°ÅŸlem baÅŸarÄ±lÄ±
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

                        Bildirimleri AÃ§
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

                    Test Bildirimi GÃ¶nder
                </button>
            </section>

            <section className="ayar-listesi">
                <div className="ayar-satiri">
                    <div className="ayar-ikon kucuk">
                        <Clock3 size={20} />
                    </div>

                    <div className="ayar-metin">
                        <strong>
                            Ã–ÄŸÃ¼n hatÄ±rlatmalarÄ±
                        </strong>

                        <span>
                            Programdaki yedi Ã¶ÄŸÃ¼n
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
                            ? "AÃ§Ä±k"
                            : "KapalÄ±"}
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
                            ? "HazÄ±r"
                            : "KayÄ±tlÄ± deÄŸil"}
                    </span>
                </div>
            </section>

            <section className="bilgi-kutusu">
                <ShieldCheck size={21} />

                <div>
                    <strong>
                        YalnÄ±zca Ã¶ÄŸÃ¼n hatÄ±rlatmalarÄ±
                    </strong>

                    <span>
                        Bu uygulama sadece beslenme
                        programÄ±ndaki saatlerde bildirim
                        gÃ¶nderecek.
                    </span>
                </div>
            </section>
        </div>
    );
}