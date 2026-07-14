import { useEffect, useMemo, useState } from "react";
import {
    Check,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Circle,
    Sparkles,
} from "lucide-react";

function saatDakikayaCevir(saat) {
    if (!saat || typeof saat !== "string") {
        return 0;
    }

    const [saatDegeri, dakikaDegeri] = saat
        .split(":")
        .map(Number);

    return (
        (Number.isFinite(saatDegeri) ? saatDegeri : 0) *
        60 +
        (Number.isFinite(dakikaDegeri) ? dakikaDegeri : 0)
    );
}

function istanbulDakikasiniGetir() {
    const parcalar = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const saat = Number(
        parcalar.find(
            (parca) => parca.type === "hour",
        )?.value || 0,
    );

    const dakika = Number(
        parcalar.find(
            (parca) => parca.type === "minute",
        )?.value || 0,
    );

    return saat * 60 + dakika;
}

function metniListeyeCevir(deger) {
    if (!deger) {
        return [];
    }

    if (Array.isArray(deger)) {
        return deger
            .map((eleman) => {
                if (typeof eleman === "string") {
                    return eleman.trim();
                }

                if (
                    eleman &&
                    typeof eleman === "object"
                ) {
                    return (
                        eleman.metin ||
                        eleman.baslik ||
                        eleman.ad ||
                        eleman.aciklama ||
                        ""
                    ).trim();
                }

                return "";
            })
            .filter(Boolean);
    }

    if (typeof deger === "string") {
        return deger
            .split(/\n|•|;/)
            .map((metin) => metin.trim())
            .filter(Boolean);
    }

    return [];
}

function ogunDetaylariniGetir(ogun) {
    const adaylar = [
        ogun.icerik,
        ogun.icerikler,
        ogun.detaylar,
        ogun.besinler,
        ogun.secimler,
        ogun.secenekler,
        ogun.liste,
    ];

    for (const aday of adaylar) {
        const liste = metniListeyeCevir(aday);

        if (liste.length > 0) {
            return liste;
        }
    }

    if (ogun.aciklama) {
        return metniListeyeCevir(ogun.aciklama);
    }

    return [];
}

function ogunDurumunuGetir({
    tamamlandi,
    ogunSaati,
    simdikiDakika,
}) {
    if (tamamlandi) {
        return {
            anahtar: "tamamlandi",
            metin: "Tamamlandı",
        };
    }

    const fark =
        ogunSaati - simdikiDakika;

    if (fark > 30) {
        return {
            anahtar: "bekliyor",
            metin: "Yaklaşan",
        };
    }

    if (fark >= -30) {
        return {
            anahtar: "sirada",
            metin: fark > 0
                ? `${fark} dk kaldı`
                : "Şimdi",
        };
    }

    return {
        anahtar: "gecti",
        metin: "Saati geçti",
    };
}

export default function OgunKarti({
    ogun,
    tamamlandi,
    onToggle,
}) {
    const [acik, setAcik] = useState(false);
    const [zamanGuncelleme, setZamanGuncelleme] =
        useState(0);

    useEffect(() => {
        const zamanlayici = window.setInterval(() => {
            setZamanGuncelleme(
                (mevcut) => mevcut + 1,
            );
        }, 60_000);

        return () => {
            window.clearInterval(zamanlayici);
        };
    }, []);

    const detaylar = useMemo(
        () => ogunDetaylariniGetir(ogun),
        [ogun],
    );

    const durum = useMemo(() => {
        const simdikiDakika =
            istanbulDakikasiniGetir();

        return ogunDurumunuGetir({
            tamamlandi,
            ogunSaati:
                saatDakikayaCevir(ogun.saat),
            simdikiDakika,
        });
    }, [
        tamamlandi,
        ogun.saat,
        zamanGuncelleme,
    ]);

    const baslik =
        ogun.kisaBaslik ||
        ogun.baslik ||
        "Öğün";

    function kartiAcKapat() {
        setAcik((mevcut) => !mevcut);
    }

    function tamamlaButonunaBas(event) {
        event.stopPropagation();

        onToggle(ogun.id);
    }

    return (
        <article
            className={[
                "premium-ogun-karti",
                `durum-${durum.anahtar}`,
                tamamlandi
                    ? "ogun-tamamlandi"
                    : "",
                acik
                    ? "ogun-acik"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <button
                type="button"
                className="premium-ogun-ozet"
                onClick={kartiAcKapat}
                aria-expanded={acik}
            >
                <div className="premium-ogun-emoji">
                    {ogun.emoji || "🥗"}
                </div>

                <div className="premium-ogun-ana-bilgi">
                    <div className="premium-ogun-baslik-satiri">
                        <strong>{baslik}</strong>

                        <span
                            className={`premium-ogun-durum ${durum.anahtar}`}
                        >
                            {tamamlandi ? (
                                <CheckCircle2 size={12} />
                            ) : (
                                <Circle size={11} />
                            )}

                            {durum.metin}
                        </span>
                    </div>

                    <div className="premium-ogun-alt-bilgi">
                        <span>
                            <Clock3 size={13} />
                            {ogun.saat}
                        </span>

                        {ogun.altBaslik && (
                            <small>
                                {ogun.altBaslik}
                            </small>
                        )}
                    </div>
                </div>

                <div
                    className={`premium-ogun-chevron ${acik ? "acik" : ""
                        }`}
                >
                    <ChevronDown size={19} />
                </div>
            </button>

            <div
                className={`premium-ogun-detay ${acik ? "gorunur" : ""
                    }`}
            >
                <div className="premium-ogun-detay-icerik">
                    {ogun.aciklama && (
                        <p className="premium-ogun-aciklama">
                            {ogun.aciklama}
                        </p>
                    )}

                    {detaylar.length > 0 ? (
                        <div className="premium-ogun-liste">
                            {detaylar.map(
                                (detay, index) => (
                                    <div
                                        key={`${ogun.id}-${index}`}
                                        className="premium-ogun-liste-satiri"
                                    >
                                        <div className="premium-ogun-liste-ikon">
                                            <Sparkles
                                                size={13}
                                            />
                                        </div>

                                        <span>
                                            {detay}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    ) : (
                        <div className="premium-ogun-bos-detay">
                            <Sparkles size={16} />

                            <span>
                                Programındaki uygun
                                seçeneği uygulayabilirsin.
                            </span>
                        </div>
                    )}

                    {ogun.not && (
                        <div className="premium-ogun-not">
                            <strong>Not</strong>
                            <span>{ogun.not}</span>
                        </div>
                    )}

                    <button
                        type="button"
                        className={[
                            "premium-ogun-tamamla",
                            tamamlandi
                                ? "geri-al"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={tamamlaButonunaBas}
                    >
                        {tamamlandi ? (
                            <>
                                <CheckCircle2
                                    size={18}
                                />
                                Tamamlandı
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Öğünü Tamamla
                            </>
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
}