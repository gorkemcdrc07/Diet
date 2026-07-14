import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const MICO_OGUN_MESAJLARI = [
    (ogunAdi) =>
        `HAV! ${ogunAdi} tamamlandı. Güzel. Şimdi beni kucağına al.`,
    (ogunAdi) =>
        `${ogunAdi} bitti. Beklediğim hareket buydu. Ama şımarma.`,
    (ogunAdi) =>
        `${ogunAdi} tamamlandı. Ben olmasam yapamazdın. Şimdi beni sev.`,
];

const VIKI_OGUN_MESAJLARI = [
    (ogunAdi) =>
        `${ogunAdi} tamamlandı! Tabakta bana bir şey kaldı mı? 🥹`,
    (ogunAdi) =>
        `Mmm… ${ogunAdi} mı? Bana da küçücük bir parça verir misin?`,
    (ogunAdi) =>
        `Yaşasın! ${ogunAdi} tamamlandı. Kutlama maması var mı? 🐾`,
];

const MICO_SU_MESAJLARI = [
    ({ suMiktari, suHedefi }) =>
        `HAV! ${suMiktari}/${suHedefi} bardak. Güzel. Devam et.`,
    () =>
        "Suyu içtin. Onaylıyorum. Şimdi beni kucağına al.",
    () =>
        "Bir bardak daha tamam. Kontrol hâlâ bende.",
];

const VIKI_SU_MESAJLARI = [
    ({ suMiktari, suHedefi }) =>
        `${suMiktari}/${suHedefi} bardak oldu! Bardağın yanında mama var mıydı?`,
    () =>
        "Su içtin! Güzel… ama ben bunun tavuk olacağını sanmıştım.",
    () =>
        "Harika gidiyorsun! Ben de pati vererek kutluyorum 🐾",
];

const MICO_SU_HEDEFI_MESAJLARI = [
    "Su hedefi tamamlandı. Onaylıyorum. Şimdi bütün ilgi bana ait.",
    "Bütün suyu içtin. Güzel. Bugünlük seni affediyorum.",
    "Hedef tamamlandı. Şimdi beni kucağına al, bunu hak ettim.",
];

const VIKI_SU_HEDEFI_MESAJLARI = [
    "Bütün suyu içtin! Peki kutlama maması nerede? 🥹",
    "Su hedefi tamamlandı! Tavuklu kutlama yapabilir miyiz?",
    "Harika! Ben sana pati vereyim, sen de bana mama ver 🐾",
];

function rastgeleSec(liste) {
    if (!Array.isArray(liste) || liste.length === 0) {
        return null;
    }

    return liste[
        Math.floor(Math.random() * liste.length)
    ];
}

function ogunAdiniGetir(tetikleyici) {
    return (
        tetikleyici?.ogunAdi ||
        tetikleyici?.ogun?.kisaBaslik ||
        tetikleyici?.ogun?.baslik ||
        tetikleyici?.ogun?.ad ||
        tetikleyici?.ogun?.isim ||
        tetikleyici?.ogun?.adi ||
        "Öğün"
    );
}

function kutlamaIceriginiOlustur(
    tetikleyici,
) {
    const karakter =
        Math.random() < 0.5
            ? "mico"
            : "viki";

    const tur =
        tetikleyici?.tur ||
        "ogun-tamamlandi";

    if (tur === "su-hedefi-tamamlandi") {
        return {
            karakter,
            baslik:
                "Su hedefi tamamlandı!",
            mesaj:
                karakter === "mico"
                    ? rastgeleSec(
                        MICO_SU_HEDEFI_MESAJLARI,
                    )
                    : rastgeleSec(
                        VIKI_SU_HEDEFI_MESAJLARI,
                    ),
            rozet: "💧 Günlük hedef",
            vurgu: "Harika iş!",
        };
    }

    if (tur === "su-icildi") {
        const mesajFonksiyonu =
            karakter === "mico"
                ? rastgeleSec(
                    MICO_SU_MESAJLARI,
                )
                : rastgeleSec(
                    VIKI_SU_MESAJLARI,
                );

        return {
            karakter,
            baslik: "Bir bardak daha!",
            mesaj:
                typeof mesajFonksiyonu ===
                    "function"
                    ? mesajFonksiyonu({
                        suMiktari:
                            tetikleyici
                                ?.suMiktari || 0,
                        suHedefi:
                            tetikleyici
                                ?.suHedefi || 8,
                    })
                    : mesajFonksiyonu,
            rozet: `💧 ${tetikleyici
                    ?.suMiktari || 0
                }/${tetikleyici
                    ?.suHedefi || 8
                } bardak`,
            vurgu: "Devam et!",
        };
    }

    const ogunAdi =
        ogunAdiniGetir(
            tetikleyici,
        );

    const mesajFonksiyonu =
        karakter === "mico"
            ? rastgeleSec(
                MICO_OGUN_MESAJLARI,
            )
            : rastgeleSec(
                VIKI_OGUN_MESAJLARI,
            );

    return {
        karakter,
        baslik: `${ogunAdi} tamamlandı!`,
        mesaj:
            typeof mesajFonksiyonu ===
                "function"
                ? mesajFonksiyonu(
                    ogunAdi,
                )
                : mesajFonksiyonu,
        rozet: "🥣 Öğün tamamlandı",
        vurgu: "Aferin!",
    };
}

export default function KarakterKutlamasi({
    tetikleyici,
    sure = 5000,
}) {
    const [gorunuyor, setGorunuyor] =
        useState(false);

    const [kapaniyor, setKapaniyor] =
        useState(false);

    const [icerik, setIcerik] =
        useState(null);

    const kapanmaTimerRef =
        useRef(null);

    const kaldirmaTimerRef =
        useRef(null);

    const sonTetikleyiciRef =
        useRef(null);

    const temizle = () => {
        if (
            kapanmaTimerRef.current
        ) {
            window.clearTimeout(
                kapanmaTimerRef.current,
            );
        }

        if (
            kaldirmaTimerRef.current
        ) {
            window.clearTimeout(
                kaldirmaTimerRef.current,
            );
        }
    };

    useEffect(() => {
        if (
            !tetikleyici?.id ||
            sonTetikleyiciRef.current ===
            tetikleyici.id
        ) {
            return undefined;
        }

        temizle();

        sonTetikleyiciRef.current =
            tetikleyici.id;

        setIcerik(
            kutlamaIceriginiOlustur(
                tetikleyici,
            ),
        );

        setKapaniyor(false);
        setGorunuyor(true);

        const kapanmaSuresi =
            Math.max(sure - 550, 1000);

        kapanmaTimerRef.current =
            window.setTimeout(() => {
                setKapaniyor(true);
            }, kapanmaSuresi);

        kaldirmaTimerRef.current =
            window.setTimeout(() => {
                setGorunuyor(false);
                setKapaniyor(false);
            }, sure);

        return temizle;
    }, [tetikleyici, sure]);

    const micoMu =
        icerik?.karakter === "mico";

    const gorselYolu = useMemo(
        () =>
            micoMu
                ? "/karakterler/mico-kizgin.png"
                : "/karakterler/viki-mama.png",
        [micoMu],
    );

    function erkenKapat() {
        temizle();
        setKapaniyor(true);

        kaldirmaTimerRef.current =
            window.setTimeout(() => {
                setGorunuyor(false);
                setKapaniyor(false);
            }, 380);
    }

    if (!gorunuyor || !icerik) {
        return null;
    }

    return (
        <div
            className={[
                "kk-overlay",
                kapaniyor
                    ? "kk-overlay--kapaniyor"
                    : "",
                `kk-overlay--${icerik.karakter}`,
            ]
                .filter(Boolean)
                .join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label="Kutlama"
            onClick={erkenKapat}
        >
            <div
                className="kk-pariltilar"
                aria-hidden="true"
            >
                <span>✦</span>
                <span>✧</span>
                <span>✦</span>
                <span>♡</span>
                <span>✧</span>
                <span>✦</span>
            </div>

            <div
                className="kk-kart"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <button
                    type="button"
                    className="kk-kapat"
                    onClick={erkenKapat}
                    aria-label="Kutlamayı kapat"
                >
                    ×
                </button>

                <div className="kk-ust-etiket">
                    <span>
                        {icerik.rozet}
                    </span>
                </div>

                <div className="kk-maskot-alani">
                    <span className="kk-isik" />

                    <img
                        src={gorselYolu}
                        alt={
                            micoMu
                                ? "Miço"
                                : "Viki"
                        }
                        draggable="false"
                    />

                    <span className="kk-golge" />

                    <span className="kk-pati kk-pati--bir">
                        🐾
                    </span>

                    <span className="kk-pati kk-pati--iki">
                        🐾
                    </span>

                    <span className="kk-mini-baloncuk">
                        {micoMu
                            ? "HAV!"
                            : "Mama?"}
                    </span>
                </div>

                <div className="kk-icerik">
                    <span className="kk-vurgu">
                        {icerik.vurgu}
                    </span>

                    <h2>
                        {icerik.baslik}
                    </h2>

                    <div
                        className={[
                            "kk-konusma-balonu",
                            micoMu
                                ? "kk-konusma-balonu--mico"
                                : "kk-konusma-balonu--viki",
                        ].join(" ")}
                    >
                        <div className="kk-konusma-kimlik">
                            <span>
                                {micoMu
                                    ? "M"
                                    : "V"}
                            </span>

                            <div>
                                <strong>
                                    {micoMu
                                        ? "Miço"
                                        : "Viki"}
                                </strong>

                                <small>
                                    {micoMu
                                        ? "Huysuz patron"
                                        : "Mama uzmanı"}
                                </small>
                            </div>
                        </div>

                        <p>
                            {icerik.mesaj}
                        </p>
                    </div>
                </div>

                <div className="kk-alt">
                    <span>
                        Dokunarak kapatabilirsin
                    </span>

                    <div className="kk-sure-cizgisi">
                        <span
                            style={{
                                animationDuration: `${sure}ms`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}