import {
    CheckCircle2,
    ChevronRight,
    Droplets,
    Sparkles,
    Utensils,
} from "lucide-react";

import "./BugununOnceligi.css";

function sinirla(deger, min = 0, max = 100) {
    return Math.min(Math.max(Number(deger) || 0, min), max);
}

function saatDakikaDegeri(saat) {
    const [saatDegeri, dakikaDegeri] = String(saat || "00:00")
        .split(":")
        .map(Number);

    return (Number(saatDegeri) || 0) * 60 + (Number(dakikaDegeri) || 0);
}

function istanbulToplamDakika() {
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

function onceligiHesapla({
    sonrakiOgun,
    tamamlananSayisi,
    toplamOgunSayisi,
    suMiktari,
    suHedefi,
}) {
    const tumOgunlerTamam =
        toplamOgunSayisi > 0 &&
        tamamlananSayisi >= toplamOgunSayisi;

    const suTamam = suMiktari >= suHedefi;

    if (tumOgunlerTamam && suTamam) {
        return {
            tur: "tamamlandi",
            etiket: "Bugün tamamlandı",
            baslik: "Bütün hedeflerin hazır",
            aciklama:
                "Öğün ve su hedeflerini tamamladın. Bugün çok güzel ilerledin.",
            buton: null,
            ikon: CheckCircle2,
        };
    }

    if (sonrakiOgun) {
        const fark =
            saatDakikaDegeri(sonrakiOgun.saat) -
            istanbulToplamDakika();

        if (fark <= 60) {
            return {
                tur: "ogun",
                etiket: fark <= 0 ? "Öğün zamanı" : "Sıradaki öğün",
                baslik:
                    sonrakiOgun.kisaBaslik ||
                    sonrakiOgun.baslik ||
                    sonrakiOgun.ad ||
                    "Öğün",
                aciklama:
                    fark <= 0
                        ? `${sonrakiOgun.saat} öğünün hazır.`
                        : `${sonrakiOgun.saat} · ${fark} dakika kaldı`,
                buton: "Öğünlere Git",
                ikon: Utensils,
            };
        }
    }

    const saat = Math.floor(istanbulToplamDakika() / 60);

    const gunlukBeklenenSu = Math.min(
        suHedefi,
        Math.max(
            1,
            Math.floor(((saat - 8) / 12) * suHedefi),
        ),
    );

    if (!suTamam && suMiktari < gunlukBeklenenSu) {
        return {
            tur: "su",
            etiket: "Su hedefin geride",
            baslik: "Bir bardak su ekle",
            aciklama:
                `Şu an ${suMiktari}/${suHedefi} bardaktasın. Küçük bir adımla devam et.`,
            buton: "1 Bardak Ekle",
            ikon: Droplets,
        };
    }

    if (sonrakiOgun) {
        return {
            tur: "ogun",
            etiket: "Günün sıradaki adımı",
            baslik:
                sonrakiOgun.kisaBaslik ||
                sonrakiOgun.baslik ||
                sonrakiOgun.ad ||
                "Öğün",
            aciklama:
                `${sonrakiOgun.saat} saatinde seni bekliyor.`,
            buton: "Öğünlere Git",
            ikon: Utensils,
        };
    }

    return {
        tur: "motivasyon",
        etiket: "Bugünkü öncelik",
        baslik: "Kendine iyi bakmaya devam et",
        aciklama:
            "Bir bardak su içmek veya küçük bir hedefi tamamlamak için güzel bir an.",
        buton: null,
        ikon: Sparkles,
    };
}

export default function BugununOnceligi({
    sonrakiOgun,
    tamamlananSayisi,
    toplamOgunSayisi,
    suMiktari,
    suHedefi,
    onSuArtir,
    onOgunlereGit,
}) {
    const ogunYuzdesi =
        toplamOgunSayisi > 0
            ? (tamamlananSayisi / toplamOgunSayisi) * 100
            : 0;

    const suYuzdesi =
        suHedefi > 0
            ? (suMiktari / suHedefi) * 100
            : 0;

    const gunlukSkor = Math.round(
        sinirla(ogunYuzdesi * 0.7 + suYuzdesi * 0.3),
    );

    const oncelik = onceligiHesapla({
        sonrakiOgun,
        tamamlananSayisi,
        toplamOgunSayisi,
        suMiktari,
        suHedefi,
    });

    const Icon = oncelik.ikon;

    function anaIslemiYap() {
        if (oncelik.tur === "su") {
            onSuArtir?.();
            return;
        }

        if (oncelik.tur === "ogun") {
            onOgunlereGit?.();
        }
    }

    return (
        <section className="bugunun-onceligi-alani">
            <article
                className={[
                    "bugunun-onceligi-karti",
                    `bugunun-onceligi-karti--${oncelik.tur}`,
                ].join(" ")}
            >
                <div className="bugunun-onceligi-ikon">
                    <Icon size={22} />
                </div>

                <div className="bugunun-onceligi-icerik">
                    <span>{oncelik.etiket}</span>
                    <h2>{oncelik.baslik}</h2>
                    <p>{oncelik.aciklama}</p>
                </div>

                {oncelik.buton && (
                    <button type="button" onClick={anaIslemiYap}>
                        <span>{oncelik.buton}</span>
                        <ChevronRight size={17} />
                    </button>
                )}
            </article>

            <article className="gunluk-skor-karti">
                <div
                    className="gunluk-skor-halka"
                    style={{
                        "--gunluk-skor": `${gunlukSkor * 3.6}deg`,
                    }}
                >
                    <div>
                        <strong>{gunlukSkor}</strong>
                        <span>/100</span>
                    </div>
                </div>

                <div className="gunluk-skor-icerik">
                    <span>Bugünkü skor</span>

                    <strong>
                        {gunlukSkor >= 80
                            ? "Harika gidiyorsun"
                            : gunlukSkor >= 45
                                ? "Güzel ilerliyorsun"
                                : "Gün yeni başlıyor"}
                    </strong>

                    <small>
                        Öğün %{Math.round(sinirla(ogunYuzdesi))}
                        {" · "}
                        Su %{Math.round(sinirla(suYuzdesi))}
                    </small>
                </div>
            </article>
        </section>
    );
}
