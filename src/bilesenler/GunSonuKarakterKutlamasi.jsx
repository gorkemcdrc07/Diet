import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const DIYALOGLAR = [
    {
        mico:
            "HAV! Bugünkü bütün görevler tamamlandı. Beklediğim hareket buydu. Şimdi beni kucağına al.",
        viki:
            "Yaşasın! Çok güzel yaptın. Kutlama için tavuk var mı acaba? 🥹",
    },
    {
        mico:
            "Program tamamlandı. Aferin. Şimdi beni sevmezsen başarını iptal ederim.",
        viki:
            "Bence önce sarılmayı hak etti... Sonra bana minicik mama verebiliriz.",
    },
    {
        mico:
            "HAV! Bugün fena değildin. Ama bunu seni şımartmak için söylemiyorum.",
        viki:
            "Ben söyleyeyim! Harikaydın. Şimdi hep birlikte tavuk yiyebilir miyiz?",
    },
    {
        mico:
            "Bütün öğünler tamamlandı. Güzel. Artık bütün ilgi bana ait.",
        viki:
            "Peki küçücük bir kısmı da bana kalabilir mi? Bir de tavuk...",
    },
    {
        mico:
            "HAV! Günlük görev bitti. Şimdi beni beş dakika boyunca kesintisiz seveceksin.",
        viki:
            "Ben de yanında beklerim. Belki elinde yanlışlıkla mama vardır.",
    },
    {
        mico:
            "Bugünkü performansını onayladım. Bu çok nadir gerçekleşen bir olay.",
        viki:
            "Ben zaten sana güveniyordum. Mama varsa hâlâ daha çok güveniyorum.",
    },
    {
        mico:
            "Program tamamlandı. Şimdilik sakinim. Beni kucağına almazsan fikrim değişebilir.",
        viki:
            "Ben de kucağa gelebilir miyim? Yanıma bir parça tavuk alabilirim.",
    },
    {
        mico:
            "HAV! Bugünü başarıyla bitirdin. Mahalleye bağırmama gerek kalmadı.",
        viki:
            "Ben yine de kutlama yapalım diyorum. Kutlama dediğim şey mama olabilir.",
    },
];

let sonDiyalogIndexi = -1;

function rastgeleDiyalogGetir() {
    if (DIYALOGLAR.length <= 1) {
        return DIYALOGLAR[0];
    }

    let yeniIndex;

    do {
        yeniIndex = Math.floor(
            Math.random() * DIYALOGLAR.length,
        );
    } while (yeniIndex === sonDiyalogIndexi);

    sonDiyalogIndexi = yeniIndex;

    return DIYALOGLAR[yeniIndex];
}

function KarakterGorseli({
    karakter,
    konusuyor,
    birlikte,
}) {
    const micoMu = karakter === "mico";

    return (
        <div
            className={[
                "gsk-maskot",
                `gsk-maskot--${karakter}`,
                konusuyor
                    ? "gsk-maskot--konusuyor"
                    : "",
                birlikte
                    ? "gsk-maskot--birlikte"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="gsk-maskot-parilti" />

            <img
                src={
                    micoMu
                        ? "/karakterler/mico-kizgin.png"
                        : "/karakterler/viki-mama.png"
                }
                alt={micoMu ? "Miço" : "Viki"}
                draggable="false"
            />

            {micoMu ? (
                <>
                    <div className="gsk-hav-balonu">
                        HAV!
                    </div>

                    <div className="gsk-ofke-isareti">
                        💢
                    </div>
                </>
            ) : (
                <>
                    <div className="gsk-viki-mama">
                        🍗
                    </div>

                    <div className="gsk-viki-pati">
                        🐾
                    </div>
                </>
            )}

            <div className="gsk-maskot-golge" />
        </div>
    );
}

export default function GunSonuKarakterKutlamasi({
    tetikleyici,
    gunlukSeri = 0,
    onTamamlandi,
}) {
    const [goster, setGoster] =
        useState(false);

    const [asama, setAsama] =
        useState("kapali");

    const [diyalog, setDiyalog] =
        useState(null);

    const sonTetikleyiciRef =
        useRef(null);

    useEffect(() => {
        if (!tetikleyici) {
            return undefined;
        }

        const tetikleyiciId =
            typeof tetikleyici === "object"
                ? tetikleyici.id
                : tetikleyici;

        if (
            sonTetikleyiciRef.current ===
            tetikleyiciId
        ) {
            return undefined;
        }

        sonTetikleyiciRef.current =
            tetikleyiciId;

        setDiyalog(
            rastgeleDiyalogGetir(),
        );

        setGoster(true);
        setAsama("mico");

        const vikiTimer =
            window.setTimeout(() => {
                setAsama("viki");
            }, 3500);

        const birlikteTimer =
            window.setTimeout(() => {
                setAsama("birlikte");
            }, 7000);

        const cikisTimer =
            window.setTimeout(() => {
                setAsama("cikis");
            }, 9400);

        const kapatmaTimer =
            window.setTimeout(() => {
                setGoster(false);
                setAsama("kapali");
                onTamamlandi?.();
            }, 10200);

        return () => {
            window.clearTimeout(vikiTimer);
            window.clearTimeout(
                birlikteTimer,
            );
            window.clearTimeout(cikisTimer);
            window.clearTimeout(
                kapatmaTimer,
            );
        };
    }, [
        tetikleyici,
        onTamamlandi,
    ]);

    useEffect(() => {
        if (!goster) {
            return undefined;
        }

        const oncekiOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                oncekiOverflow;
        };
    }, [goster]);

    const aktifKonusma = useMemo(() => {
        if (!diyalog) {
            return null;
        }

        if (asama === "mico") {
            return {
                karakter: "mico",
                ad: "Miço",
                unvan: "Evin patronu",
                mesaj: diyalog.mico,
            };
        }

        if (
            asama === "viki" ||
            asama === "birlikte"
        ) {
            return {
                karakter: "viki",
                ad: "Viki",
                unvan: "Mama denetçisi",
                mesaj: diyalog.viki,
            };
        }

        return null;
    }, [
        asama,
        diyalog,
    ]);

    if (!goster || !diyalog) {
        return null;
    }

    const birlikte =
        asama === "birlikte";

    return (
        <div
            className={[
                "gsk-katman",
                asama === "cikis"
                    ? "gsk-katman--cikis"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
            role="dialog"
            aria-modal="true"
            aria-live="polite"
        >
            <div className="gsk-arka-plan" />

            <div
                className="gsk-dekorlar"
                aria-hidden="true"
            >
                <span>✦</span>
                <span>♡</span>
                <span>🐾</span>
                <span>★</span>
                <span>🍗</span>
                <span>✦</span>
                <span>♡</span>
                <span>🐾</span>
            </div>

            <section
                className={[
                    "gsk-panel",
                    `gsk-panel--${asama}`,
                ].join(" ")}
            >
                <header className="gsk-baslik">
                    <span className="gsk-kicker">
                        Gün bitimi
                    </span>

                    <h2>
                        Bugünkü görevler
                        tamamlandı!
                    </h2>

                    <p>
                        Miço sonucu onayladı,
                        Viki kutlama mamasını
                        bekliyor.
                    </p>

                    <div className="gsk-seri">
                        <span>🔥</span>

                        <strong>
                            {gunlukSeri}
                        </strong>

                        <small>
                            günlük seri
                        </small>
                    </div>
                </header>

                <div className="gsk-karakter-alani">
                    <article className="gsk-karakter-kolon">
                        <KarakterGorseli
                            karakter="mico"
                            konusuyor={
                                asama === "mico"
                            }
                            birlikte={birlikte}
                        />

                        <div className="gsk-karakter-etiket">
                            <strong>Miço</strong>
                            <span>
                                Huysuz patron
                            </span>
                        </div>
                    </article>

                    <div className="gsk-basari-karti">
                        <span className="gsk-basari-ikon">
                            ✓
                        </span>

                        <strong>
                            Tüm öğünler tamam
                        </strong>

                        <small>
                            Bugünkü plan başarıyla
                            tamamlandı
                        </small>
                    </div>

                    <article className="gsk-karakter-kolon">
                        <KarakterGorseli
                            karakter="viki"
                            konusuyor={
                                asama === "viki"
                            }
                            birlikte={birlikte}
                        />

                        <div className="gsk-karakter-etiket">
                            <strong>Viki</strong>
                            <span>
                                Mama uzmanı
                            </span>
                        </div>
                    </article>
                </div>

                {aktifKonusma && (
                    <div
                        key={`${aktifKonusma.karakter}-${asama}`}
                        className={[
                            "gsk-konusma",
                            `gsk-konusma--${aktifKonusma.karakter}`,
                        ].join(" ")}
                    >
                        <div className="gsk-konusma-baslik">
                            <span
                                className={`gsk-konusma-avatar gsk-konusma-avatar--${aktifKonusma.karakter}`}
                            >
                                {aktifKonusma.karakter ===
                                    "mico"
                                    ? "M"
                                    : "V"}
                            </span>

                            <div>
                                <strong>
                                    {
                                        aktifKonusma.ad
                                    }
                                </strong>

                                <small>
                                    {
                                        aktifKonusma.unvan
                                    }
                                </small>
                            </div>
                        </div>

                        <p>
                            {aktifKonusma.mesaj}
                        </p>

                        <div className="gsk-konusma-alt">
                            <span />

                            {aktifKonusma.karakter ===
                                "mico"
                                ? "Miço şu anda çok ciddi olduğunu düşünüyor."
                                : "Viki pati karşılığında mama bekliyor."}
                        </div>
                    </div>
                )}

                {birlikte && (
                    <div className="gsk-birlikte-mesaji">
                        <span>🤎</span>

                        İkisi de bugün seninle
                        gurur duyuyor.
                    </div>
                )}

                <footer className="gsk-alt-alan">
                    Yarın tekrar beraberiz
                    🐾
                </footer>
            </section>
        </div>
    );
}