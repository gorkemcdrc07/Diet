import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    rastgeleDiyalogSahnesiGetir,
} from "../karakterler/karakterDiyalogSahneleri";

const MICO_DOKUNMA_MESAJLARI = [
    "Ekrana basmakla olmaz. Beni kucağına al.",
    "Nihayet benimle ilgilendin. Devam et.",
    "HAV! Elini çekme. Ben söyleyene kadar sev.",
    "Kulağımın arkasını da unutma. Bu bir talimat.",
    "Beni kucağına al şimdi, yoksa bütün evi ayağa kaldırırım.",
    "Bir kere dokunup kaçmak yok. Beş dakika ilgi istiyorum.",
];

const VIKI_DOKUNMA_MESAJLARI = [
    "Bana mı dokundun? Pati vereyim mi? 🐾",
    "Mama getirdin sandım ama bu da güzel.",
    "Bir daha dokunur musun? Çok hoşuma gitti 🥹",
    "Sana pati verdim. Pati karşılığında mama geliyor mu?",
    "Aaa, beni sevdin! Şimdi küçücük tavuk olabilir mi?",
    "Ben de sana sarılmak istiyorum. Sonra mama yiyebiliriz.",
];

const MICO_NORMAL_MESAJLARI = [
    "HAV! Bugünkü programı aksatmak yok.",
    "Seni izliyorum. Öğünleri unutmaya çalışma.",
    "Program hazır. Ben de hazırım. Sen neden hâlâ bekliyorsun?",
    "Su içmeyi unutma. Sonra beni kucağına al.",
    "Bugün iyi gidiyorsun. Ama bu seni şımartmasın.",
    "Her şey kontrolüm altında. Çünkü patron benim.",
];

const VIKI_NORMAL_MESAJLARI = [
    "Bugün de beraberiz. Mama da bizimle mi? 🥹",
    "Mmm... Bir yerden tavuk kokusu mu geliyor?",
    "Harika gidiyorsun! Ben de pati vererek destek oluyorum.",
    "Su içelim mi? Sonra mama kabına da bakabiliriz.",
    "Seni görünce çok mutlu oldum. Biraz da acıktım.",
    "Ben buradayım. Mama da gelirse daha da mutlu olurum.",
];

const MICO_GECCE_MESAJLARI = [
    "Bugünlük yeter. Sessiz ol, dinleniyorum.",
    "Yarın programı yine ben yöneteceğim.",
    "Viki uyuyor. Ben de uyumaya çalışıyorum. Sessiz.",
    "İyi geceler. Ama önce beni kucağına al.",
];

const VIKI_GECCE_MESAJLARI = [
    "Battaniyeme kıvrıldım. İyi geceler 🤎",
    "Uyumadan önce küçücük bir mama olur mu?",
    "Bugün çok güzeldi. Yarın yine beraberiz.",
    "Tavuklu rüyalar göreceğim 🥹",
];

function rastgeleSec(liste) {
    if (!Array.isArray(liste) || liste.length === 0) {
        return "";
    }

    return liste[
        Math.floor(Math.random() * liste.length)
    ];
}

function istanbulSaatiGetir() {
    const parcalar =
        new Intl.DateTimeFormat("tr-TR", {
            timeZone: "Europe/Istanbul",
            hour: "2-digit",
            hourCycle: "h23",
        }).formatToParts(new Date());

    return Number(
        parcalar.find(
            (parca) =>
                parca.type === "hour",
        )?.value || 0,
    );
}

function geceMi() {
    const saat =
        istanbulSaatiGetir();

    return saat >= 22 || saat < 6;
}

function tamamlananOgunAdiniGetir(
    ogun,
) {
    return (
        ogun?.kisaBaslik ||
        ogun?.baslik ||
        ogun?.ad ||
        ogun?.isim ||
        ogun?.adi ||
        null
    );
}

function durumMesajiGetir({
    karakter,
    gece,
    sonrakiOgun,
    kalanSure,
    tamamlananOgun,
    toplamOgun,
    suMiktari,
    suHedefi,
}) {
    const micoMu =
        karakter === "mico";

    if (gece) {
        return rastgeleSec(
            micoMu
                ? MICO_GECCE_MESAJLARI
                : VIKI_GECCE_MESAJLARI,
        );
    }

    if (
        toplamOgun > 0 &&
        tamamlananOgun >= toplamOgun
    ) {
        return micoMu
            ? "Bugünkü görevler tamamlandı. Güzel. Şimdi bütün ilgi bana ait."
            : "Bütün öğünler tamamlandı! Kutlama tavuğu var mı acaba? 🥹";
    }

    if (
        suHedefi > 0 &&
        suMiktari >= suHedefi
    ) {
        return micoMu
            ? "Su hedefini tamamladın. Onaylıyorum. Şimdi beni sev."
            : "Bütün suyu içtin! Peki kutlama maması nerede? 🐾";
    }

    if (sonrakiOgun) {
        const ogunAdi =
            tamamlananOgunAdiniGetir(
                sonrakiOgun,
            ) || "sıradaki öğün";

        return micoMu
            ? `HAV! ${ogunAdi} için ${kalanSure || "hazır ol"
            }. Gecikmek yok.`
            : `${ogunAdi} yaklaşıyor. İçinde tavuk olabilir mi acaba?`;
    }

    return rastgeleSec(
        micoMu
            ? MICO_NORMAL_MESAJLARI
            : VIKI_NORMAL_MESAJLARI,
    );
}

function Maskot({
    karakter,
    aktif,
    gece,
    konusuyor,
    onClick,
}) {
    const micoMu =
        karakter === "mico";

    return (
        <button
            type="button"
            className={[
                "mva-maskot-butonu",
                `mva-maskot-butonu--${karakter}`,
                aktif
                    ? "mva-maskot-butonu--aktif"
                    : "",
                konusuyor
                    ? "mva-maskot-butonu--konusuyor"
                    : "",
                gece
                    ? "mva-maskot-butonu--uyuyor"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
            onClick={onClick}
            aria-label={
                micoMu
                    ? "Miço ile etkileşime geç"
                    : "Viki ile etkileşime geç"
            }
        >
            <span className="mva-maskot-isik" />

            <img
                src={
                    micoMu
                        ? "/karakterler/mico-kizgin.png"
                        : "/karakterler/viki-mama.png"
                }
                alt={
                    micoMu
                        ? "Miço"
                        : "Viki"
                }
                draggable="false"
            />

            {aktif && !gece && (
                <span className="mva-aktif-nokta" />
            )}

            {konusuyor && !gece && (
                <span className="mva-konusuyor-efekti">
                    {micoMu
                        ? "HAV!"
                        : "🐾"}
                </span>
            )}

            {gece && (
                <span className="mva-uyku-efekti">
                    Zz
                </span>
            )}

            <span className="mva-maskot-golge" />
        </button>
    );
}

export default function MicoVikiAsistani({
    tamamlananOgun = 0,
    toplamOgun = 0,
    suMiktari = 0,
    suHedefi = 8,
    gunlukSeri = 0,
    sonrakiOgun = null,
    kalanSure = "",
    sonTamamlananOgun = null,

    karakterDurumu = null,
    aktifSupabaseTepkisi = null,
    karakterYukleniyor = false,
    karakterHatasi = "",
    onKarakterOlayi,
}) {
    const [
        aktifKarakter,
        setAktifKarakter,
    ] = useState("mico");

    const [
        mesaj,
        setMesaj,
    ] = useState("");

    const [
        aktifDiyalog,
        setAktifDiyalog,
    ] = useState(null);

    const [
        diyalogSatiri,
        setDiyalogSatiri,
    ] = useState(0);

    const [
        diyalogAktif,
        setDiyalogAktif,
    ] = useState(false);

    const [
        geceModu,
        setGeceModu,
    ] = useState(() =>
        geceMi(),
    );

    const [
        animasyonAnahtari,
        setAnimasyonAnahtari,
    ] = useState(0);

    const sonTamamlananRef =
        useRef(null);

    const hareketsizlikTimerRef =
        useRef(null);

    const otomatikKonusmaTimerRef =
        useRef(null);

    const diyalogTimerRef =
        useRef(null);

    const diyalogAktifRef =
        useRef(false);

    const ilerlemeYuzdesi =
        useMemo(() => {
            if (!toplamOgun) {
                return 0;
            }

            return Math.min(
                Math.round(
                    (tamamlananOgun /
                        toplamOgun) *
                    100,
                ),
                100,
            );
        }, [
            tamamlananOgun,
            toplamOgun,
        ]);

    const timerlariTemizle =
        useCallback(() => {
            if (
                diyalogTimerRef.current
            ) {
                window.clearTimeout(
                    diyalogTimerRef.current,
                );

                diyalogTimerRef.current =
                    null;
            }
        }, []);

    const mesajiGoster =
        useCallback(
            (
                karakter,
                yeniMesaj,
            ) => {
                setAktifKarakter(
                    karakter,
                );

                setMesaj(
                    yeniMesaj,
                );

                setAnimasyonAnahtari(
                    (deger) =>
                        deger + 1,
                );
            },
            [],
        );

    const diyaloguDurdur =
        useCallback(() => {
            timerlariTemizle();

            diyalogAktifRef.current =
                false;

            setDiyalogAktif(false);
            setAktifDiyalog(null);
            setDiyalogSatiri(0);
        }, [timerlariTemizle]);

    const diyalogKategorisiniGetir =
        useCallback(() => {
            if (geceModu) {
                return "gece";
            }

            if (sonTamamlananOgun) {
                return "ogun";
            }

            if (
                toplamOgun > 0 &&
                tamamlananOgun >=
                toplamOgun
            ) {
                return "ogun";
            }

            if (
                suHedefi > 0 &&
                suMiktari >=
                suHedefi
            ) {
                return "su";
            }

            return "normal";
        }, [
            geceModu,
            sonTamamlananOgun,
            toplamOgun,
            tamamlananOgun,
            suHedefi,
            suMiktari,
        ]);

    const diyalogBaslat =
        useCallback(
            (
                kategori,
            ) => {
                timerlariTemizle();

                const secilenKategori =
                    kategori ||
                    diyalogKategorisiniGetir();

                const sahne =
                    rastgeleDiyalogSahnesiGetir(
                        secilenKategori,
                    );

                if (
                    !sahne ||
                    !Array.isArray(
                        sahne.satirlar,
                    ) ||
                    sahne.satirlar
                        .length === 0
                ) {
                    return;
                }

                const ilkSatir =
                    sahne.satirlar[0];

                diyalogAktifRef.current =
                    true;

                setAktifDiyalog(
                    sahne,
                );

                setDiyalogSatiri(0);
                setDiyalogAktif(true);

                mesajiGoster(
                    ilkSatir.karakter,
                    ilkSatir.mesaj,
                );
                if (typeof onKarakterOlayi === "function") {
                    void onKarakterOlayi({
                        olay: "karakter-diyalogu",
                        karakter: ilkSatir.karakter,
                        ruhHali: ilkSatir.ruhHali || "normal",
                        mesaj: ilkSatir.mesaj,
                        veri: {
                            sahneId: sahne.id,
                            kategori: secilenKategori,
                            satir: 1,
                            toplamSatir: sahne.satirlar.length,
                        },
                    }).catch(console.error);
                }
            },
            [
                diyalogKategorisiniGetir,
                mesajiGoster,
                timerlariTemizle,
                onKarakterOlayi
            ],
        );

    const normalMesajGoster =
        useCallback(() => {
            diyaloguDurdur();

            const karakter =
                Math.random() < 0.5
                    ? "mico"
                    : "viki";

            mesajiGoster(
                karakter,
                durumMesajiGetir({
                    karakter,
                    gece:
                        geceModu,
                    sonrakiOgun,
                    kalanSure,
                    tamamlananOgun,
                    toplamOgun,
                    suMiktari,
                    suHedefi,
                }),
            );
        }, [
            diyaloguDurdur,
            geceModu,
            sonrakiOgun,
            kalanSure,
            tamamlananOgun,
            toplamOgun,
            suMiktari,
            suHedefi,
            mesajiGoster,
        ]);

    const hareketsizlikTimeriniBaslat =
        useCallback(() => {
            if (
                hareketsizlikTimerRef.current
            ) {
                window.clearTimeout(
                    hareketsizlikTimerRef.current,
                );
            }

            hareketsizlikTimerRef.current =
                window.setTimeout(() => {
                    if (
                        !diyalogAktifRef.current
                    ) {
                        diyalogBaslat(
                            "hareketsizlik",
                        );
                    }
                }, 45_000);
        }, [diyalogBaslat]);

    const karaktereDokun =
        useCallback(
            (karakter) => {
                diyaloguDurdur();

                const liste =
                    karakter === "mico"
                        ? MICO_DOKUNMA_MESAJLARI
                        : VIKI_DOKUNMA_MESAJLARI;

                const yeniMesaj =
                    rastgeleSec(liste);

                mesajiGoster(
                    karakter,
                    yeniMesaj,
                );

                if (
                    typeof onKarakterOlayi ===
                    "function"
                ) {
                    void onKarakterOlayi({
                        olay:
                            "karaktere-dokunuldu",
                        karakter,
                        ruhHali:
                            karakter === "mico"
                                ? "kizgin"
                                : "heyecanli",
                        mesaj: yeniMesaj,
                        veri: {
                            kaynak:
                                "ana-sayfa-asistani",
                        },
                    }).catch((error) => {
                        console.error(
                            "Karakter dokunma olayı kaydedilemedi:",
                            error,
                        );
                    });
                }

                hareketsizlikTimeriniBaslat();
            },
            [
                diyaloguDurdur,
                mesajiGoster,
                hareketsizlikTimeriniBaslat,
                onKarakterOlayi,
            ],
        );
    useEffect(() => {
        if (
            !diyalogAktif ||
            !aktifDiyalog
        ) {
            return undefined;
        }

        const sonrakiIndex =
            diyalogSatiri + 1;

        if (
            sonrakiIndex >=
            aktifDiyalog.satirlar
                .length
        ) {
            diyalogTimerRef.current =
                window.setTimeout(() => {
                    diyalogAktifRef.current =
                        false;

                    setDiyalogAktif(
                        false,
                    );

                    setAktifDiyalog(
                        null,
                    );

                    setDiyalogSatiri(
                        0,
                    );
                }, 3000);

            return () => {
                timerlariTemizle();
            };
        }

        diyalogTimerRef.current =
            window.setTimeout(() => {
                const sonrakiSatir =
                    aktifDiyalog.satirlar[
                    sonrakiIndex
                    ];

                setDiyalogSatiri(
                    sonrakiIndex,
                );

                mesajiGoster(
                    sonrakiSatir.karakter,
                    sonrakiSatir.mesaj,
                );
            }, 2900);

        return () => {
            timerlariTemizle();
        };
    }, [
        diyalogAktif,
        aktifDiyalog,
        diyalogSatiri,
        mesajiGoster,
        timerlariTemizle,
    ]);

    useEffect(() => {
        if (
            !aktifSupabaseTepkisi?.mesaj ||
            !aktifSupabaseTepkisi?.karakter
        ) {
            return;
        }

        diyaloguDurdur();

        mesajiGoster(
            aktifSupabaseTepkisi.karakter,
            aktifSupabaseTepkisi.mesaj,
        );
    }, [
        aktifSupabaseTepkisi,
        diyaloguDurdur,
        mesajiGoster,
    ]);

    useEffect(() => {
        normalMesajGoster();

        otomatikKonusmaTimerRef.current =
            window.setInterval(() => {
                if (
                    !diyalogAktifRef.current
                ) {
                    diyalogBaslat();
                }
            }, 28_000);

        return () => {
            if (
                otomatikKonusmaTimerRef.current
            ) {
                window.clearInterval(
                    otomatikKonusmaTimerRef.current,
                );

                otomatikKonusmaTimerRef.current =
                    null;
            }
        };
    }, [
        normalMesajGoster,
        diyalogBaslat,
    ]);

    useEffect(() => {
        const olaylar = [
            "click",
            "touchstart",
            "keydown",
            "scroll",
        ];

        const hareketAlgilandi =
            () => {
                hareketsizlikTimeriniBaslat();
            };

        olaylar.forEach(
            (olay) => {
                window.addEventListener(
                    olay,
                    hareketAlgilandi,
                    {
                        passive: true,
                    },
                );
            },
        );

        hareketsizlikTimeriniBaslat();

        return () => {
            olaylar.forEach(
                (olay) => {
                    window.removeEventListener(
                        olay,
                        hareketAlgilandi,
                    );
                },
            );

            if (
                hareketsizlikTimerRef.current
            ) {
                window.clearTimeout(
                    hareketsizlikTimerRef.current,
                );

                hareketsizlikTimerRef.current =
                    null;
            }
        };
    }, [
        hareketsizlikTimeriniBaslat,
    ]);

    useEffect(() => {
        const saatTimeri =
            window.setInterval(() => {
                setGeceModu(
                    geceMi(),
                );
            }, 60_000);

        return () => {
            window.clearInterval(
                saatTimeri,
            );
        };
    }, []);

    useEffect(() => {
        if (
            !sonTamamlananOgun
        ) {
            return;
        }

        const ogunAdi =
            tamamlananOgunAdiniGetir(
                sonTamamlananOgun,
            );

        const ogunKimligi =
            sonTamamlananOgun?.id ||
            ogunAdi;

        if (
            !ogunAdi ||
            sonTamamlananRef.current ===
            ogunKimligi
        ) {
            return;
        }

        sonTamamlananRef.current =
            ogunKimligi;

        diyalogBaslat(
            "ogun",
        );
    }, [
        sonTamamlananOgun,
        diyalogBaslat,
    ]);

    useEffect(() => {
        return () => {
            timerlariTemizle();

            if (
                otomatikKonusmaTimerRef.current
            ) {
                window.clearInterval(
                    otomatikKonusmaTimerRef.current,
                );
            }

            if (
                hareketsizlikTimerRef.current
            ) {
                window.clearTimeout(
                    hareketsizlikTimerRef.current,
                );
            }
        };
    }, [timerlariTemizle]);

    const aktifKarakterAdi =
        aktifKarakter === "mico"
            ? "Miço"
            : "Viki";

    const aktifKarakterUnvani =
        aktifKarakter === "mico"
            ? "Huysuz patron"
            : "Mama uzmanı";

    const aktifRuhHali =
        diyalogAktif &&
            aktifDiyalog
            ? aktifDiyalog.satirlar[
                diyalogSatiri
            ]?.ruhHali
            : null;

    return (
        <section
            className={[
                "mva-kart",
                geceModu
                    ? "mva-kart--gece"
                    : "",
                diyalogAktif
                    ? "mva-kart--diyalog"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div
                className="mva-arka-plan"
                aria-hidden="true"
            >
                <span />
                <span />
                <span />
            </div>

            <header className="mva-ust">
                <div>
                    <span className="mva-kicker">
                        Günlük arkadaşların
                    </span>

                    <h2>
                        Miço &amp; Viki
                    </h2>

                    <p>
                        {geceModu
                            ? "İkisi de dinlenme modunda."
                            : diyalogAktif
                                ? "Miço ve Viki kendi aralarında konuşuyor."
                                : "Karakterlere dokun, seninle konuşsunlar."}
                    </p>
                </div>

                <div className="mva-seri">
                    <span>🔥</span>

                    <div>
                        <strong>
                            {gunlukSeri}
                        </strong>

                        <small>
                            günlük seri
                        </small>
                    </div>
                </div>
            </header>

            <div className="mva-karakterler">
                <div className="mva-karakter-kolon">
                    <Maskot
                        karakter="mico"
                        aktif={
                            aktifKarakter ===
                            "mico"
                        }
                        konusuyor={
                            diyalogAktif &&
                            aktifKarakter ===
                            "mico"
                        }
                        gece={
                            geceModu
                        }
                        onClick={() =>
                            karaktereDokun(
                                "mico",
                            )
                        }
                    />

                    <strong>Miço</strong>

                    <span>
                        Evin patronu
                    </span>
                </div>

                <div className="mva-orta-alan">
                    <span className="mva-ilerleme-etiketi">
                        Günlük ilerleme
                    </span>

                    <strong>
                        %{ilerlemeYuzdesi}
                    </strong>

                    <div className="mva-ilerleme">
                        <span
                            style={{
                                width: `${ilerlemeYuzdesi}%`,
                            }}
                        />
                    </div>

                    <small>
                        {tamamlananOgun}/
                        {toplamOgun} öğün
                    </small>

                    {diyalogAktif && (
                        <span className="mva-orta-diyalog">
                            💬 Konuşuyorlar
                        </span>
                    )}
                </div>

                <div className="mva-karakter-kolon">
                    <Maskot
                        karakter="viki"
                        aktif={
                            aktifKarakter ===
                            "viki"
                        }
                        konusuyor={
                            diyalogAktif &&
                            aktifKarakter ===
                            "viki"
                        }
                        gece={
                            geceModu
                        }
                        onClick={() =>
                            karaktereDokun(
                                "viki",
                            )
                        }
                    />

                    <strong>Viki</strong>

                    <span>
                        Mama denetçisi
                    </span>
                </div>
            </div>

            <div
                key={
                    animasyonAnahtari
                }
                className={[
                    "mva-konusma",
                    `mva-konusma--${aktifKarakter}`,
                    diyalogAktif
                        ? "mva-konusma--diyalog"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div className="mva-konusma-ust">
                    <span
                        className={[
                            "mva-avatar",
                            `mva-avatar--${aktifKarakter}`,
                        ].join(" ")}
                    >
                        {aktifKarakter ===
                            "mico"
                            ? "M"
                            : "V"}
                    </span>

                    <div>
                        <strong>
                            {aktifKarakterAdi}
                        </strong>

                        <small>
                            {
                                aktifKarakterUnvani
                            }

                            {aktifRuhHali
                                ? ` · ${aktifRuhHali}`
                                : ""}
                        </small>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            diyalogBaslat()
                        }
                        aria-label="Yeni diyalog başlat"
                        title="Yeni diyalog"
                    >
                        ↻
                    </button>
                </div>

                <p>{mesaj}</p>

                {diyalogAktif &&
                    aktifDiyalog && (
                        <div className="mva-diyalog-durum">
                            <div className="mva-diyalog-noktalar">
                                {aktifDiyalog.satirlar.map(
                                    (
                                        _,
                                        index,
                                    ) => (
                                        <span
                                            key={`${aktifDiyalog.id}-${index}`}
                                            className={
                                                index ===
                                                    diyalogSatiri
                                                    ? "aktif"
                                                    : index <
                                                        diyalogSatiri
                                                        ? "tamamlandi"
                                                        : ""
                                            }
                                        />
                                    ),
                                )}
                            </div>

                            <small>
                                {
                                    diyalogSatiri +
                                    1
                                }
                                /
                                {
                                    aktifDiyalog
                                        .satirlar
                                        .length
                                }{" "}
                                · Miço ve Viki
                                konuşuyor
                            </small>
                        </div>
                    )}

                <div className="mva-konusma-alt">
                    <span>
                        <i />

                        {geceModu
                            ? "Uyku modu"
                            : diyalogAktif
                                ? "Canlı diyalog"
                                : "Seninle konuşuyor"}
                    </span>

                    <small>
                        {diyalogAktif
                            ? "Karaktere dokunursan diyalog durur"
                            : "Karakterlere dokunabilirsin"}
                    </small>
                </div>
            </div>

            <div className="mva-alt-bilgiler">
                <div>
                    <span>🥣</span>

                    <strong>
                        {tamamlananOgun}/
                        {toplamOgun}
                    </strong>

                    <small>Öğün</small>
                </div>

                <div>
                    <span>💧</span>

                    <strong>
                        {suMiktari}/
                        {suHedefi}
                    </strong>

                    <small>Su</small>
                </div>

                <div>
                    <span>
                        {geceModu
                            ? "🌙"
                            : diyalogAktif
                                ? "💬"
                                : "🐾"}
                    </span>

                    <strong>
                        {geceModu
                            ? "Uykulu"
                            : diyalogAktif
                                ? "Sohbette"
                                : aktifKarakter ===
                                    "mico"
                                    ? "Huysuz"
                                    : "Acıkmış"}
                    </strong>

                    <small>Mod</small>
                </div>
            </div>
        </section>
    );
}