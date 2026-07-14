import { useEffect, useMemo, useState } from "react";
import {
    Check,
    CheckCircle2,
    ChevronDown,
    Circle,
    Clock3,
    Info,
    ListChecks,
    RefreshCw,
    Sparkles,
} from "lucide-react";

import "./OgunKarti.css";

function saatDakikayaCevir(saat) {
    if (!saat || typeof saat !== "string") {
        return 0;
    }

    const [saatDegeri, dakikaDegeri] = saat
        .split(":")
        .map(Number);

    return (
        (Number.isFinite(saatDegeri) ? saatDegeri : 0) * 60 +
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
        parcalar.find((parca) => parca.type === "hour")?.value || 0,
    );

    const dakika = Number(
        parcalar.find((parca) => parca.type === "minute")?.value || 0,
    );

    return saat * 60 + dakika;
}

function metniListeyeCevir(deger) {
    if (!deger) {
        return [];
    }

    if (Array.isArray(deger)) {
        return deger
            .map((eleman) => String(eleman || "").trim())
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

function detayNesnesiniDuzenle(detay, index) {
    if (typeof detay === "string") {
        return {
            id: `detay-${index}`,
            baslik: detay.trim(),
            miktar: "",
            aciklama: "",
            alternatifler: [],
        };
    }

    if (!detay || typeof detay !== "object") {
        return null;
    }

    const baslik = String(
        detay.baslik ||
        detay.ad ||
        detay.metin ||
        detay.besin ||
        "",
    ).trim();

    const miktar = String(
        detay.miktar ||
        detay.olcu ||
        detay.porsiyon ||
        "",
    ).trim();

    const aciklama = String(
        detay.aciklama ||
        detay.not ||
        detay.detay ||
        "",
    ).trim();

    const alternatifler = metniListeyeCevir(
        detay.alternatifler ||
        detay.alternatif ||
        detay.secenekler,
    );

    if (!baslik && !miktar && !aciklama && alternatifler.length === 0) {
        return null;
    }

    return {
        id: detay.id || `detay-${index}`,
        baslik: baslik || "Besin",
        miktar,
        aciklama,
        alternatifler,
    };
}

function ogunDetaylariniGetir(ogun) {
    const adaylar = [
        ogun.detaylar,
        ogun.icerik,
        ogun.icerikler,
        ogun.besinler,
        ogun.secimler,
        ogun.secenekler,
        ogun.liste,
    ];

    for (const aday of adaylar) {
        if (Array.isArray(aday) && aday.length > 0) {
            return aday
                .map(detayNesnesiniDuzenle)
                .filter(Boolean);
        }

        if (typeof aday === "string" && aday.trim()) {
            return metniListeyeCevir(aday)
                .map(detayNesnesiniDuzenle)
                .filter(Boolean);
        }
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

    const fark = ogunSaati - simdikiDakika;

    if (fark > 30) {
        return {
            anahtar: "bekliyor",
            metin: "Yaklaşan",
        };
    }

    if (fark >= -30) {
        return {
            anahtar: "sirada",
            metin: fark > 0 ? `${fark} dk kaldı` : "Şimdi",
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
    const [zamanGuncelleme, setZamanGuncelleme] = useState(0);

    useEffect(() => {
        const zamanlayici = window.setInterval(() => {
            setZamanGuncelleme((mevcut) => mevcut + 1);
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
        const simdikiDakika = istanbulDakikasiniGetir();

        return ogunDurumunuGetir({
            tamamlandi,
            ogunSaati: saatDakikayaCevir(ogun.saat),
            simdikiDakika,
        });
    }, [tamamlandi, ogun.saat, zamanGuncelleme]);

    const baslik =
        ogun.kisaBaslik ||
        ogun.baslik ||
        ogun.ad ||
        ogun.ogunAdi ||
        "Öğün";

    const toplamAlternatif = detaylar.reduce(
        (toplam, detay) => toplam + detay.alternatifler.length,
        0,
    );

    function tamamlaButonunaBas(event) {
        event.stopPropagation();
        onToggle?.(ogun.id);
    }

    return (
        <article
            className={[
                "premium-ogun-karti",
                `durum-${durum.anahtar}`,
                tamamlandi ? "ogun-tamamlandi" : "",
                acik ? "ogun-acik" : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <button
                type="button"
                className="premium-ogun-ozet"
                onClick={() => setAcik((mevcut) => !mevcut)}
                aria-expanded={acik}
            >
                <div className="premium-ogun-emoji">
                    {ogun.ikon || ogun.emoji || "🥗"}
                </div>

                <div className="premium-ogun-ana-bilgi">
                    <div className="premium-ogun-baslik-satiri">
                        <strong>{baslik}</strong>

                        <span
                            className={`premium-ogun-durum ${durum.anahtar}`}
                        >
                            {tamamlandi ? (
                                <CheckCircle2 size={13} />
                            ) : (
                                <Circle size={12} />
                            )}

                            {durum.metin}
                        </span>
                    </div>

                    <div className="premium-ogun-alt-bilgi">
                        <span>
                            <Clock3 size={14} />
                            {ogun.saat}
                        </span>

                        <span>
                            <ListChecks size={14} />
                            {detaylar.length} besin
                        </span>

                        {toplamAlternatif > 0 && (
                            <span>
                                <RefreshCw size={13} />
                                {toplamAlternatif} alternatif
                            </span>
                        )}
                    </div>
                </div>

                <div
                    className={`premium-ogun-chevron ${acik ? "acik" : ""}`}
                >
                    <ChevronDown size={20} />
                </div>
            </button>

            <div
                className={`premium-ogun-detay ${acik ? "gorunur" : ""}`}
            >
                <div className="premium-ogun-detay-icerik">
                    {ogun.aciklama && (
                        <div className="premium-ogun-genel-not">
                            <Info size={16} />

                            <p>{ogun.aciklama}</p>
                        </div>
                    )}

                    {detaylar.length > 0 ? (
                        <div className="premium-ogun-besin-listesi">
                            {detaylar.map((detay, index) => (
                                <article
                                    key={detay.id || `${ogun.id}-${index}`}
                                    className="premium-ogun-besin-karti"
                                >
                                    <div className="premium-ogun-besin-sira">
                                        {index + 1}
                                    </div>

                                    <div className="premium-ogun-besin-icerik">
                                        <div className="premium-ogun-besin-baslik">
                                            <strong>{detay.baslik}</strong>

                                            {detay.miktar && (
                                                <span>{detay.miktar}</span>
                                            )}
                                        </div>

                                        {detay.aciklama && (
                                            <p>{detay.aciklama}</p>
                                        )}

                                        {detay.alternatifler.length > 0 && (
                                            <div className="premium-ogun-alternatifler">
                                                <div className="premium-ogun-alternatif-baslik">
                                                    <RefreshCw size={13} />
                                                    Alternatifler
                                                </div>

                                                <div className="premium-ogun-alternatif-listesi">
                                                    {detay.alternatifler.map(
                                                        (alternatif, alternatifIndex) => (
                                                            <span
                                                                key={`${detay.id}-alternatif-${alternatifIndex}`}
                                                            >
                                                                {alternatif}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="premium-ogun-bos-detay">
                            <Sparkles size={17} />

                            <span>
                                Bu öğün için henüz ayrıntılı besin bilgisi bulunmuyor.
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
                            tamamlandi ? "geri-al" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={tamamlaButonunaBas}
                    >
                        {tamamlandi ? (
                            <>
                                <CheckCircle2 size={18} />
                                Tamamlandı — Geri Al
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
