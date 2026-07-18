import {
    CalendarDays,
    Camera,
    Check,
    CheckCircle2,
    Clock3,
    Droplets,
    Flame,
    Pill,
    RotateCcw,
    Utensils,
    ChevronRight,
    Sparkles,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import confetti from "canvas-confetti";

import {
    suHedefi,
} from "../veriler/gunlukProgram";

import {
    aktifPlaniGetirVeyaOlustur,
} from "../servisler/sabitPlanAktarici";

import SuTakibi from "../bilesenler/SuTakibi";
import IlacHatirlatmaKarti from "../bilesenler/IlacHatirlatmaKarti";
import KaloriTakipPaneli from "../bilesenler/KaloriTakipPaneli";
import KarakterKutlamasi from "../bilesenler/KarakterKutlamasi";
import GunSonuKarakterKutlamasi from "../bilesenler/GunSonuKarakterKutlamasi";
import OgunTamamlamaModali from "../bilesenler/OgunTamamlamaModali";

import {
    gunlukTakibiOku,
    gunlukTakipDegisiminiDinle,
    ogunDurumunuKaydet,
    suMiktariniKaydet,
} from "../servisler/gunlukTakipServisi";

import "./ProgramSayfasi.css";
import {
    gunlukOgunTamamlamaKayitlariniGetir,
    ogunTamamlamaKaydiniKaydet,
    ogunTamamlamaKaydiniSil,
} from "../servisler/ogunTamamlamaServisi";

function bugununTarihiniGetir() {
    return new Intl.DateTimeFormat(
        "tr-TR",
        {
            timeZone:
                "Europe/Istanbul",

            weekday:
                "long",

            day:
                "numeric",

            month:
                "long",
        },
    ).format(new Date());
}

function konfetiPatlat(
    tumProgramTamamlandi = false,
) {
    confetti({
        particleCount:
            tumProgramTamamlandi
                ? 130
                : 80,

        spread:
            tumProgramTamamlandi
                ? 95
                : 70,

        startVelocity:
            tumProgramTamamlandi
                ? 48
                : 36,

        origin: {
            y: 0.72,
        },
    });

    if (!tumProgramTamamlandi) {
        return;
    }

    window.setTimeout(() => {
        confetti({
            particleCount: 55,
            angle: 60,
            spread: 58,
            startVelocity: 34,
            origin: {
                x: 0,
                y: 0.78,
            },
        });

        confetti({
            particleCount: 55,
            angle: 120,
            spread: 58,
            startVelocity: 34,
            origin: {
                x: 1,
                y: 0.78,
            },
        });
    }, 160);
}

function icerikBilgisiniGetir(icerik) {
    if (typeof icerik === "string") {
        return {
            baslik: icerik,
            miktar: "",
            aciklama: "",
            alternatifler: [],
        };
    }

    return {
        baslik:
            icerik?.baslik ||
            icerik?.ad ||
            icerik?.isim ||
            icerik?.besin_adi ||
            "Besin",

        miktar:
            icerik?.miktar ||
            icerik?.porsiyon ||
            "",

        aciklama:
            icerik?.aciklama ||
            icerik?.not ||
            "",

        alternatifler: Array.isArray(
            icerik?.alternatifler,
        )
            ? icerik.alternatifler.filter(Boolean)
            : [],
    };
}
function besinIkonunuGetir(metin) {
    const deger = String(metin || "")
        .toLocaleLowerCase("tr-TR");

    const ikonlar = [
        [["yumurta"], "🥚"],
        [["peynir", "lor"], "🧀"],
        [["yoğurt", "kefir", "ayran", "süt"], "🥛"],
        [["ekmek", "wasa", "galeta", "patlak"], "🍞"],
        [["salata", "yeşillik"], "🥗"],
        [["elma"], "🍎"],
        [["armut"], "🍐"],
        [["şeftali"], "🍑"],
        [["çilek", "kırmızı meyve"], "🍓"],
        [["kayısı", "gün kurusu"], "🍊"],
        [["avokado"], "🥑"],
        [["ceviz", "badem", "fındık", "çekirdek"], "🌰"],
        [["tahin", "fıstık ezmesi"], "🥜"],
        [["köfte", "et", "karnıyarık", "dolma"], "🍖"],
        [["tavuk", "hindi"], "🍗"],
        [["balık", "ton balığı"], "🐟"],
        [["sebze", "kabak"], "🥦"],
        [["pirinç", "bulgur", "kinoa", "karabuğday"], "🍚"],
        [["çorba"], "🥣"],
        [["çay", "latte", "kahve"], "☕"],
        [["hurma"], "🌴"],
    ];

    const eslesen = ikonlar.find(([anahtarlar]) =>
        anahtarlar.some((anahtar) => deger.includes(anahtar)),
    );

    return eslesen?.[1] || "🍽️";
}

export default function ProgramSayfasi() {
    const [
        takip,
        setTakip,
    ] = useState(() =>
        gunlukTakibiOku(),
    );

    const [
        aktifBolum,
        setAktifBolum,
    ] = useState("ogunler");

    const [
        karakterKutlama,
        setKarakterKutlama,
    ] = useState(null);

    const [
        gunSonuKutlama,
        setGunSonuKutlama,
    ] = useState(null);

    const [
        tamamlanacakOgun,
        setTamamlanacakOgun,
    ] = useState(null);

    const [
        kaloriyeGonderilecekOgun,
        setKaloriyeGonderilecekOgun,
    ] = useState(null);

    const [
        ogunTamamlamaKayitlari,
        setOgunTamamlamaKayitlari,
    ] = useState({});

    const [
        programVerisi,
        setProgramVerisi,
    ] = useState([]);

    const [
        programYukleniyor,
        setProgramYukleniyor,
    ] = useState(true);

    const [
        programHatasi,
        setProgramHatasi,
    ] = useState("");

    const [
        alternatifPaneli,
        setAlternatifPaneli,
    ] = useState(null);

    const [
        aktifTema,
        setAktifTema,
    ] = useState("dark");

    useEffect(() => {
        function renkAcikMi(renk) {
            const eslesme = String(renk || "").match(
                /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
            );

            if (!eslesme) {
                return null;
            }

            const [, r, g, b] = eslesme.map(Number);
            const parlaklik =
                (r * 299 + g * 587 + b * 114) / 1000;

            return parlaklik > 155;
        }

        function temayiBul() {
            const html = document.documentElement;
            const body = document.body;
            const root = document.getElementById("root");
            const sayfa = document.querySelector(".program-sayfasi");

            const depolananTema = [
                localStorage.getItem("theme"),
                localStorage.getItem("tema"),
                localStorage.getItem("appearance"),
                localStorage.getItem("color-theme"),
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            const nitelikler = [
                html.dataset.theme,
                html.dataset.mode,
                html.dataset.appearance,
                body?.dataset?.theme,
                body?.dataset?.mode,
                root?.dataset?.theme,
                root?.dataset?.mode,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            const siniflar = [
                html.className,
                body?.className,
                root?.className,
                sayfa?.className,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            const acikAnahtarlar = [
                "light",
                "acik",
                "açık",
                "tema-acik",
                "acik-tema",
            ];

            const koyuAnahtarlar = [
                "dark",
                "koyu",
                "tema-koyu",
                "koyu-tema",
            ];

            const tumTemaMetni = `${depolananTema} ${nitelikler} ${siniflar}`;

            if (acikAnahtarlar.some((anahtar) => tumTemaMetni.includes(anahtar))) {
                setAktifTema("light");
                return;
            }

            if (koyuAnahtarlar.some((anahtar) => tumTemaMetni.includes(anahtar))) {
                setAktifTema("dark");
                return;
            }

            const kontrolEdilecekler = [
                sayfa,
                root,
                body,
                html,
            ].filter(Boolean);

            for (const element of kontrolEdilecekler) {
                const stil = window.getComputedStyle(element);
                const arkaPlanAcikMi = renkAcikMi(stil.backgroundColor);

                if (arkaPlanAcikMi !== null) {
                    setAktifTema(arkaPlanAcikMi ? "light" : "dark");
                    return;
                }
            }

            setAktifTema(
                window.matchMedia("(prefers-color-scheme: light)").matches
                    ? "light"
                    : "dark",
            );
        }

        temayiBul();

        const observer = new MutationObserver(temayiBul);
        const izlenecekler = [
            document.documentElement,
            document.body,
            document.getElementById("root"),
        ].filter(Boolean);

        izlenecekler.forEach((element) => {
            observer.observe(element, {
                attributes: true,
                attributeFilter: [
                    "class",
                    "style",
                    "data-theme",
                    "data-mode",
                    "data-appearance",
                ],
            });
        });

        const medya = window.matchMedia("(prefers-color-scheme: light)");
        medya.addEventListener?.("change", temayiBul);
        window.addEventListener("storage", temayiBul);
        window.addEventListener("tema-degisti", temayiBul);

        return () => {
            observer.disconnect();
            medya.removeEventListener?.("change", temayiBul);
            window.removeEventListener("storage", temayiBul);
            window.removeEventListener("tema-degisti", temayiBul);
        };
    }, []);

    useEffect(() => {
        if (!alternatifPaneli) {
            return undefined;
        }

        const oncekiOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const klavyeKontrolu = (event) => {
            if (event.key === "Escape") {
                setAlternatifPaneli(null);
            }
        };

        window.addEventListener("keydown", klavyeKontrolu);

        return () => {
            document.body.style.overflow = oncekiOverflow;
            window.removeEventListener("keydown", klavyeKontrolu);
        };
    }, [alternatifPaneli]);


    useEffect(() => {
        const dinlemeyiBirak =
            gunlukTakipDegisiminiDinle(
                (yeniTakip) => {
                    setTakip(
                        yeniTakip,
                    );
                },
            );

        setTakip(
            gunlukTakibiOku(),
        );

        return () => {
            dinlemeyiBirak();
        };
    }, []);
    const beslenmePlaniniYukle =
        useCallback(async () => {
            setProgramYukleniyor(true);
            setProgramHatasi("");

            try {
                const plan =
                    await aktifPlaniGetirVeyaOlustur();

                setProgramVerisi(
                    Array.isArray(plan?.ogunler)
                        ? plan.ogunler
                        : [],
                );
            } catch (error) {
                console.error(
                    "Beslenme planı yüklenemedi:",
                    error,
                );

                setProgramVerisi([]);

                setProgramHatasi(
                    error?.message ||
                    "Beslenme planı yüklenemedi.",
                );
            } finally {
                setProgramYukleniyor(false);
            }
        }, []);

    useEffect(() => {
        beslenmePlaniniYukle();
    }, [beslenmePlaniniYukle]);

    const ogunKayitlariniYukle =
        useCallback(async () => {
            try {
                const kayitlar =
                    await gunlukOgunTamamlamaKayitlariniGetir();

                const kayitHaritasi =
                    (
                        Array.isArray(kayitlar)
                            ? kayitlar
                            : []
                    ).reduce(
                        (
                            sonuc,
                            kayit,
                        ) => {
                            sonuc[
                                String(
                                    kayit.ogun_id,
                                )
                            ] = kayit;

                            return sonuc;
                        },
                        {},
                    );

                setOgunTamamlamaKayitlari(
                    kayitHaritasi,
                );
            } catch (error) {
                console.error(
                    "Öğün tamamlama kayıtları alınamadı:",
                    error,
                );
            }
        }, []);

    useEffect(() => {
        ogunKayitlariniYukle();
    }, [
        ogunKayitlariniYukle,
    ]);
    const guvenliProgram = useMemo(() => {
        if (!Array.isArray(programVerisi)) {
            return [];
        }

        return programVerisi.map(
            (ogun, index) => ({
                ...ogun,

                id:
                    ogun?.id ||
                    ogun?.ogun_kodu ||
                    `ogun-${index}`,

                baslik:
                    ogun?.baslik ||
                    ogun?.ad ||
                    ogun?.ogun_adi ||
                    "Öğün",

                kisaBaslik:
                    ogun?.kisaBaslik ||
                    ogun?.kisa_baslik ||
                    ogun?.aciklama ||
                    ogun?.ogun_adi ||
                    "Beslenme programı",

                saat: String(
                    ogun?.saat || "--:--",
                ).slice(0, 5),

                emoji:
                    ogun?.emoji ||
                    ogun?.ikon ||
                    "🍽️",

                icerikler: Array.isArray(
                    ogun?.icerikler,
                )
                    ? ogun.icerikler
                    : Array.isArray(ogun?.detaylar)
                        ? ogun.detaylar
                        : [],
            }),
        );
    }, [programVerisi]);

    const tamamlananlar =
        Array.isArray(
            takip?.tamamlananlar,
        )
            ? takip.tamamlananlar
            : [];

    const suMiktari =
        Number(
            takip?.suMiktari,
        ) || 0;

    const toplamOgun =
        guvenliProgram.length;

    const tamamlananOgunSayisi =
        guvenliProgram.filter(
            (ogun) =>
                tamamlananlar.some(
                    (id) =>
                        String(id) ===
                        String(ogun.id),
                ),
        ).length;

    const tamamlanmaYuzdesi =
        toplamOgun > 0
            ? Math.round(
                (
                    tamamlananOgunSayisi /
                    toplamOgun
                ) * 100,
            )
            : 0;

    const suYuzdesi =
        suHedefi > 0
            ? Math.min(
                100,
                Math.round((suMiktari / suHedefi) * 100),
            )
            : 0;

    const genelIlerlemeYuzdesi = Math.round(
        (tamamlanmaYuzdesi + suYuzdesi) / 2,
    );

    const siradakiOgun = guvenliProgram.find(
        (ogun) => !ogunTamamlandiMi(ogun.id),
    );

    const durumMesaji =
        genelIlerlemeYuzdesi >= 100
            ? "Bugünün hedefleri tamamlandı"
            : genelIlerlemeYuzdesi >= 70
                ? "Harika gidiyorsun, az kaldı"
                : genelIlerlemeYuzdesi >= 35
                    ? "Güzel ilerliyorsun"
                    : "Güne küçük bir adımla başla";

    function ogunTamamlandiMi(
        ogunId,
    ) {
        return tamamlananlar.some(
            (id) =>
                String(id) ===
                String(ogunId),
        );
    }

    function ogunDurumunuDegistir(
        ogunId,
    ) {
        const tamamlandi =
            ogunTamamlandiMi(
                ogunId,
            );

        const yeniTakip =
            ogunDurumunuKaydet(
                ogunId,
                !tamamlandi,
            );

        setTakip(
            yeniTakip,
        );

        if (tamamlandi) {
            return;
        }

        const tamamlananOgun =
            guvenliProgram.find(
                (ogun) =>
                    String(ogun.id) ===
                    String(ogunId),
            );

        const yeniTamamlananSayisi =
            guvenliProgram.filter(
                (ogun) =>
                    yeniTakip.tamamlananlar.some(
                        (id) =>
                            String(id) ===
                            String(ogun.id),
                    ),
            ).length;

        const tumProgramTamamlandi =
            toplamOgun > 0 &&
            yeniTamamlananSayisi ===
            toplamOgun;

        if (tumProgramTamamlandi) {
            setGunSonuKutlama({
                id:
                    `gun-sonu-${Date.now()}`,

                tur:
                    "gun-tamamlandi",
            });

            konfetiPatlat(true);

            return;
        }

        setKarakterKutlama({
            id:
                `${ogunId}-${Date.now()}`,

            tur:
                "ogun-tamamlandi",

            ogunAdi:
                tamamlananOgun?.kisaBaslik ||
                tamamlananOgun?.baslik ||
                "Öğün",

            ogun:
                tamamlananOgun,
        });

        konfetiPatlat(false);
    }

    function suArtir() {
        if (suMiktari >= suHedefi) {
            return;
        }

        const yeniMiktar =
            Math.min(
                suMiktari + 1,
                suHedefi,
            );

        const yeniTakip =
            suMiktariniKaydet(
                yeniMiktar,
            );

        setTakip(
            yeniTakip,
        );

        const hedefTamamlandi =
            yeniMiktar >=
            suHedefi;

        setKarakterKutlama({
            id:
                `su-${yeniMiktar}-${Date.now()}`,

            tur:
                hedefTamamlandi
                    ? "su-hedefi-tamamlandi"
                    : "su-icildi",

            suMiktari:
                yeniMiktar,

            suHedefi,
        });

        konfetiPatlat(
            hedefTamamlandi,
        );
    }

    function suAzalt() {
        const yeniMiktar =
            Math.max(
                suMiktari - 1,
                0,
            );

        const yeniTakip =
            suMiktariniKaydet(
                yeniMiktar,
            );

        setTakip(
            yeniTakip,
        );
    }

    return (
        <div className="standart-sayfa program-sayfasi">
            {alternatifPaneli && (
                <div
                    className={`alternatif-panel-katmani alternatif-panel-katmani--${aktifTema}`}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setAlternatifPaneli(null);
                        }
                    }}
                >
                    <section
                        className="alternatif-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="alternatif-panel-baslik"
                    >
                        <div className="alternatif-panel-tutamac" />

                        <header className="alternatif-panel-baslik">
                            <div className="alternatif-panel-urun-ikonu">
                                {besinIkonunuGetir(alternatifPaneli.baslik)}
                            </div>

                            <div>
                                <span>Yerine tercih edebilirsin</span>
                                <h2 id="alternatif-panel-baslik">
                                    {alternatifPaneli.baslik} alternatifleri
                                </h2>
                                {alternatifPaneli.miktar && (
                                    <p>{alternatifPaneli.miktar}</p>
                                )}
                            </div>

                            <button
                                type="button"
                                className="alternatif-panel-kapat"
                                onClick={() => setAlternatifPaneli(null)}
                                aria-label="Alternatif panelini kapat"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="alternatif-panel-bilgi">
                            <Sparkles size={16} />
                            <span>Canının istediği bir seçeneği tercih edebilirsin.</span>
                        </div>

                        <div className="alternatif-panel-listesi">
                            {alternatifPaneli.alternatifler.map(
                                (alternatif, alternatifIndex) => (
                                    <article
                                        key={`${alternatif}-${alternatifIndex}`}
                                        className="alternatif-panel-karti"
                                    >
                                        <span className="alternatif-panel-kart-ikonu">
                                            {besinIkonunuGetir(alternatif)}
                                        </span>

                                        <div>
                                            <strong>{alternatif}</strong>
                                            <small>Uygun alternatif</small>
                                        </div>

                                        <Check size={17} />
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                </div>
            )}
            <OgunTamamlamaModali
                acik={Boolean(tamamlanacakOgun)}
                ogun={tamamlanacakOgun}
                onKapat={() => {
                    setTamamlanacakOgun(null);
                }}
                onTamamla={async ({
                    ogun,
                    fotograf,
                    notMetni,
                }) => {
                    try {
                        await ogunTamamlamaKaydiniKaydet({
                            ogunId:
                                ogun.id,

                            fotograf,

                            notMetni,

                            kaloriAnalizineGonderildi:
                                false,
                        });

                        ogunDurumunuDegistir(
                            ogun.id,
                        );

                        setTamamlanacakOgun(
                            null,
                        );

                        await ogunKayitlariniYukle();
                    } catch (error) {
                        console.error(
                            "Öğün kaydı oluşturulamadı:",
                            error,
                        );

                        window.alert(
                            error?.message ||
                            "Öğün kaydedilemedi.",
                        );
                    }
                }}
                onKaloriAnalizineGonder={async ({
                    ogun,
                    fotograf,
                    notMetni,
                }) => {
                    try {
                        await ogunTamamlamaKaydiniKaydet({
                            ogunId:
                                ogun.id,

                            fotograf,

                            notMetni,

                            kaloriAnalizineGonderildi:
                                true,
                        });

                        ogunDurumunuDegistir(
                            ogun.id,
                        );

                        setKaloriyeGonderilecekOgun({
                            ogun,
                            fotograf,
                            notMetni,
                        });

                        setTamamlanacakOgun(
                            null,
                        );

                        await ogunKayitlariniYukle();

                        setAktifBolum(
                            "kalori",
                        );
                    } catch (error) {
                        console.error(
                            "Öğün kalori analizine gönderilemedi:",
                            error,
                        );

                        window.alert(
                            error?.message ||
                            "Kalori analizi başlatılamadı.",
                        );
                    }
                }}
            />

            <KarakterKutlamasi

                tetikleyici={
                    karakterKutlama
                }
                sure={5000}
            />

            <GunSonuKarakterKutlamasi
                tetikleyici={
                    gunSonuKutlama
                }
                gunlukSeri={0}
            />
            <header className="sayfa-basligi program-ust-baslik">
                <div className="sayfa-baslik-ikon">
                    <CalendarDays size={22} />
                </div>

                <div className="program-ust-baslik-metin">
                    <span>{bugununTarihiniGetir()}</span>
                    <h1>Günlük Program</h1>
                    <p>Bugünkü sağlık planını tek yerden tamamla.</p>
                </div>

                <span className="program-gun-etiketi">Bugün</span>
            </header>

            <section className="program-ozet-karti program-ozet-karti--premium">
                <div className="program-ozet-ust">
                    <div className="program-ozet-metin">
                        <span className="program-ozet-kucuk-baslik">GÜNLÜK DURUM</span>
                        <h2>{durumMesaji}</h2>
                        <p>Öğün ve su hedeflerine göre genel ilerlemen.</p>
                    </div>

                    <div
                        className="program-ilerleme-halkasi"
                        style={{
                            "--ilerleme": `${genelIlerlemeYuzdesi * 3.6}deg`,
                        }}
                        aria-label={`Genel ilerleme yüzde ${genelIlerlemeYuzdesi}`}
                    >
                        <div>
                            <strong>%{genelIlerlemeYuzdesi}</strong>
                            <span>tamamlandı</span>
                        </div>
                    </div>
                </div>

                <div className="program-hedef-kartlari">
                    <article className="program-hedef-karti program-hedef-karti--ogun">
                        <span className="program-hedef-ikonu">
                            <Utensils size={18} />
                        </span>
                        <div>
                            <small>ÖĞÜNLER</small>
                            <strong>{tamamlananOgunSayisi} / {toplamOgun}</strong>
                            <span>%{tamamlanmaYuzdesi} tamamlandı</span>
                        </div>
                        <i style={{ width: `${tamamlanmaYuzdesi}%` }} />
                    </article>

                    <article className="program-hedef-karti program-hedef-karti--su">
                        <span className="program-hedef-ikonu">
                            <Droplets size={18} />
                        </span>
                        <div>
                            <small>SU HEDEFİ</small>
                            <strong>{suMiktari} / {suHedefi}</strong>
                            <span>%{suYuzdesi} tamamlandı</span>
                        </div>
                        <i style={{ width: `${suYuzdesi}%` }} />
                    </article>
                </div>

                <div className="program-siradaki-kart">
                    <span className="program-siradaki-ikon">
                        {siradakiOgun ? siradakiOgun.emoji : <CheckCircle2 size={20} />}
                    </span>
                    <div>
                        <small>{siradakiOgun ? "SIRADAKİ ÖĞÜN" : "GÜNLÜK PLAN"}</small>
                        <strong>
                            {siradakiOgun
                                ? siradakiOgun.baslik
                                : "Tüm öğünler tamamlandı"}
                        </strong>
                        <span>
                            {siradakiOgun
                                ? `${siradakiOgun.saat} • ${siradakiOgun.kisaBaslik}`
                                : "Bugünkü beslenme hedefini tamamladın."}
                        </span>
                    </div>
                    {siradakiOgun && <Clock3 size={18} />}
                </div>
            </section>

            <nav
                className="program-sekme-menusu program-sekme-menusu--premium"
                aria-label="Program bölümleri"
            >
                {[
                    { id: "ogunler", etiket: "Öğün", ikon: Utensils },
                    { id: "su", etiket: "Su", ikon: Droplets },
                    { id: "kalori", etiket: "Kalori", ikon: Flame },
                    { id: "ilac", etiket: "İlaç", ikon: Pill },
                ].map((sekme) => {
                    const Ikon = sekme.ikon;
                    const aktif = aktifBolum === sekme.id;

                    return (
                        <button
                            key={sekme.id}
                            type="button"
                            className={aktif ? "aktif" : ""}
                            onClick={() => setAktifBolum(sekme.id)}
                            aria-current={aktif ? "page" : undefined}
                        >
                            <span className="program-sekme-ikon-kutusu">
                                <Ikon size={18} />
                            </span>
                            <span>{sekme.etiket}</span>
                            {aktif && <i />}
                        </button>
                    );
                })}
            </nav>

            {programYukleniyor && (
                <div className="program-bos-durum">
                    <Clock3 size={24} />

                    <div>
                        <strong>
                            Beslenme planı yükleniyor
                        </strong>

                        <span>
                            Aktif plan Supabase üzerinden hazırlanıyor.
                        </span>
                    </div>
                </div>
            )}

            {!programYukleniyor && programHatasi && (
                <div className="program-bos-durum">
                    <Utensils size={24} />

                    <div>
                        <strong>
                            Plan yüklenemedi
                        </strong>

                        <span>{programHatasi}</span>

                        <button
                            type="button"
                            onClick={beslenmePlaniniYukle}
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            )}

            {aktifBolum ===
                "ogunler" && (
                    <section className="program-bolumu">
                        <div className="program-bolum-basligi program-bolum-basligi--premium">
                            <div>
                                <span>
                                    Beslenme planın
                                </span>

                                <h2>Bugünkü Öğünler</h2>
                                <p>Saatine göre planlanan öğünlerini tamamla ve kaydet.</p>
                            </div>

                            <strong>
                                {tamamlananOgunSayisi}
                                {" / "}
                                {toplamOgun}
                            </strong>
                        </div>

                        <div className="program-zaman-cizgisi">
                            {guvenliProgram.map(
                                (
                                    ogun,
                                    index,
                                ) => {
                                    const tamamlandi =
                                        ogunTamamlandiMi(
                                            ogun.id,
                                        );

                                    const tamamlanmaKaydi =
                                        ogunTamamlamaKayitlari[
                                        String(ogun.id)
                                        ] || null;

                                    return (
                                        <article
                                            key={
                                                ogun.id
                                            }
                                            className={[
                                                "program-zaman-karti",

                                                tamamlandi
                                                    ? "program-zaman-karti--tamamlandi"
                                                    : "",
                                            ]
                                                .filter(
                                                    Boolean,
                                                )
                                                .join(
                                                    " ",
                                                )}
                                        >
                                            <div className="zaman-sol">
                                                <span>
                                                    {ogun.saat}
                                                </span>

                                                <div className="zaman-nokta">
                                                    <i />

                                                    {index <
                                                        guvenliProgram.length -
                                                        1 && (
                                                            <b />
                                                        )}
                                                </div>
                                            </div>

                                            <div className="zaman-icerik">
                                                <div className="zaman-emoji">
                                                    {tamamlandi
                                                        ? "✅"
                                                        : ogun.emoji}
                                                </div>

                                                <div className="zaman-icerik-metin">
                                                    <div className="zaman-kart-baslik">
                                                        <div>
                                                            <strong>
                                                                {
                                                                    ogun.baslik
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    ogun.kisaBaslik
                                                                }
                                                            </span>
                                                        </div>

                                                        <Clock3
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </div>

                                                    {ogun.icerikler.length > 0 && (
                                                        <div className="ogun-detay-listesi">
                                                            {ogun.icerikler.map(
                                                                (icerik, icerikIndex) => {
                                                                    const detay =
                                                                        icerikBilgisiniGetir(
                                                                            icerik,
                                                                        );

                                                                    return (
                                                                        <article
                                                                            key={`${ogun.id}-${icerikIndex}`}
                                                                            className="ogun-detay-karti"
                                                                        >
                                                                            <div className="ogun-detay-ust">
                                                                                <strong>
                                                                                    {detay.baslik}
                                                                                </strong>

                                                                                {detay.miktar && (
                                                                                    <span>
                                                                                        {detay.miktar}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {detay.aciklama && (
                                                                                <p className="ogun-detay-aciklama">
                                                                                    {detay.aciklama}
                                                                                </p>
                                                                            )}

                                                                            {detay.alternatifler.length > 0 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="ogun-alternatif-ac"
                                                                                    onClick={() =>
                                                                                        setAlternatifPaneli({
                                                                                            baslik: detay.baslik,
                                                                                            miktar: detay.miktar,
                                                                                            alternatifler: detay.alternatifler,
                                                                                        })
                                                                                    }
                                                                                >
                                                                                    <span className="ogun-alternatif-ac-ikon">
                                                                                        {besinIkonunuGetir(detay.baslik)}
                                                                                    </span>

                                                                                    <span className="ogun-alternatif-ac-metin">
                                                                                        <strong>Alternatifleri gör</strong>
                                                                                        <small>
                                                                                            {detay.alternatifler.length} farklı seçim
                                                                                        </small>
                                                                                    </span>

                                                                                    <span className="ogun-alternatif-ac-sag">
                                                                                        <b>{detay.alternatifler.length}</b>
                                                                                        <ChevronRight size={17} />
                                                                                    </span>
                                                                                </button>
                                                                            )}
                                                                        </article>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    )}
                                                    {tamamlanmaKaydi
                                                        ?.fotograf_url && (
                                                            <div className="program-ogun-fotografi">
                                                                <img
                                                                    src={
                                                                        tamamlanmaKaydi
                                                                            .fotograf_url
                                                                    }
                                                                    alt={`${ogun.baslik} öğün fotoğrafı`}
                                                                />

                                                                <div className="program-ogun-fotografi-bilgi">
                                                                    <div>
                                                                        <span>
                                                                            Tamamlanan öğün
                                                                        </span>

                                                                        {tamamlanmaKaydi
                                                                            .not_metni && (
                                                                                <small>
                                                                                    {
                                                                                        tamamlanmaKaydi
                                                                                            .not_metni
                                                                                    }
                                                                                </small>
                                                                            )}
                                                                    </div>

                                                                    {tamamlanmaKaydi
                                                                        .kalori_analizine_gonderildi && (
                                                                            <strong>
                                                                                <Flame size={13} />
                                                                                Kalori analizi
                                                                            </strong>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    <button
                                                        type="button"
                                                        className={[
                                                            "program-ogun-durum-butonu",

                                                            tamamlandi
                                                                ? "program-ogun-durum-butonu--geri-al"
                                                                : "",
                                                        ]
                                                            .filter(
                                                                Boolean,
                                                            )
                                                            .join(
                                                                " ",
                                                            )}
                                                        onClick={async () => {
                                                            if (tamamlandi) {
                                                                try {
                                                                    await ogunTamamlamaKaydiniSil({
                                                                        ogunId:
                                                                            ogun.id,
                                                                    });

                                                                    ogunDurumunuDegistir(
                                                                        ogun.id,
                                                                    );

                                                                    await ogunKayitlariniYukle();
                                                                } catch (error) {
                                                                    console.error(
                                                                        "Öğün kaydı geri alınamadı:",
                                                                        error,
                                                                    );

                                                                    window.alert(
                                                                        error?.message ||
                                                                        "Öğün kaydı geri alınamadı.",
                                                                    );
                                                                }

                                                                return;
                                                            }

                                                            setTamamlanacakOgun(
                                                                ogun,
                                                            );
                                                        }}
                                                    >
                                                        {tamamlandi ? (
                                                            <>
                                                                <RotateCcw
                                                                    size={16}
                                                                />

                                                                Geri Al
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Camera
                                                                    size={17}
                                                                />

                                                                Fotoğrafla Tamamla
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                },
                            )}
                        </div>

                        {toplamOgun === 0 && (
                            <div className="program-bos-durum">
                                <Utensils
                                    size={24}
                                />

                                <div>
                                    <strong>
                                        Bugün için öğün bulunamadı
                                    </strong>

                                    <span>
                                        Beslenme planındaki
                                        öğünleri kontrol et.
                                    </span>
                                </div>
                            </div>
                        )}
                    </section>
                )}

            {aktifBolum ===
                "su" && (
                    <section className="program-bolumu">
                        <div className="program-bolum-basligi program-bolum-basligi--premium">
                            <div>
                                <span>
                                    Günlük sağlık
                                </span>

                                <h2>Su Takibi</h2>
                                <p>Günlük su hedefini adım adım tamamla.</p>
                            </div>

                            <strong>
                                {suMiktari}
                                {" / "}
                                {suHedefi}
                            </strong>
                        </div>

                        <SuTakibi
                            miktar={
                                suMiktari
                            }
                            hedef={
                                suHedefi
                            }
                            onArtir={
                                suArtir
                            }
                            onAzalt={
                                suAzalt
                            }
                        />
                    </section>
                )}

            {aktifBolum ===
                "ilac" && (
                    <section className="program-bolumu">
                        <div className="program-bolum-basligi program-bolum-basligi--premium">
                            <div>
                                <span>
                                    Hatırlatmalar
                                </span>

                                <h2>İlaç Takibi</h2>
                                <p>Hatırlatmalarını ve aldığın ilaçları düzenli takip et.</p>
                            </div>
                        </div>

                        <IlacHatirlatmaKarti />
                    </section>
                )}
            {aktifBolum === "kalori" && (
                <section
                    className="program-bolumu program-bolumu--kalori"
                    style={{
                        display: "block",
                        width: "100%",
                        minWidth: 0,
                        minHeight: "300px",
                    }}
                >
                    <div className="kalori-bolumu-kontrol">
                        <span>Yapay zekâ destekli beslenme takibi</span>
                        <h2>Kalori Merkezi</h2>
                        <p>Öğün fotoğraflarını analiz et, günlük enerji dengesini gör.</p>
                    </div>

                    <KaloriTakipPaneli
                        baslangicAnalizi={
                            kaloriyeGonderilecekOgun
                        }
                        onBaslangicAnaliziKullanildi={() => {
                            setKaloriyeGonderilecekOgun(
                                null,
                            );
                        }}
                    />
                </section>
            )}
        </div>
    );
}