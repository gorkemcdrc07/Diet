import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Droplets,
    Heart,
    MessageCircle,
    RefreshCw,
    Sparkles,
    Utensils,
    Volume2,
} from "lucide-react";

import useSupabaseKarakterMotoru from "../karakterler/useSupabaseKarakterMotoru";

import "./Karakterler.css";

const KARAKTER_BILGILERI = {
    mico: {
        ad: "Miço",
        kisaAd: "M",
        rozet: "Evin patronu",
        unvan: "Disiplinli, huysuz ve seni yakından takip ediyor.",
        gorsel: "/karakterler/mico-kizgin.png",
        butonMetni: "Miço’yu sev",
        beklemeMetni: "Miço düşünüyor...",
    },

    viki: {
        ad: "Viki",
        kisaAd: "V",
        rozet: "Mama uzmanı",
        unvan: "Sevecen, meraklı ve her zaman mama peşinde.",
        gorsel: "/karakterler/viki-mama.png",
        butonMetni: "Viki’ye pati ver",
        beklemeMetni: "Viki geliyor...",
    },
};

function degeriSinirla(deger) {
    return Math.min(
        Math.max(Number(deger) || 0, 0),
        100,
    );
}

function DurumCubugu({
    baslik,
    deger,
    ikon,
    sinifAdi = "",
}) {
    const guvenliDeger =
        degeriSinirla(deger);

    return (
        <div
            className={[
                "kp-durum",
                sinifAdi,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="kp-durum-ust">
                <span className="kp-durum-etiket">
                    <i>{ikon}</i>
                    {baslik}
                </span>

                <strong>
                    %{guvenliDeger}
                </strong>
            </div>

            <div
                className="kp-durum-cubugu"
                role="progressbar"
                aria-label={baslik}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={guvenliDeger}
            >
                <span
                    style={{
                        width: `${guvenliDeger}%`,
                    }}
                />
            </div>
        </div>
    );
}

function Istatistik({
    ikon,
    deger,
    etiket,
    aciklama,
    vurgu = "",
}) {
    return (
        <article
            className={[
                "kp-istatistik",
                vurgu
                    ? `kp-istatistik--${vurgu}`
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <span className="kp-istatistik-ikon">
                {ikon}
            </span>

            <div className="kp-istatistik-icerik">
                <strong>{deger}</strong>
                <span>{etiket}</span>

                {aciklama && (
                    <small>{aciklama}</small>
                )}
            </div>
        </article>
    );
}

function KarakterKarti({
    karakter,
    durum,
    onDokun,
    islemYapiliyor,
}) {
    const micoMu =
        karakter === "mico";

    const bilgi =
        KARAKTER_BILGILERI[karakter];

    const ruhHali = micoMu
        ? durum?.mico_ruh_hali || "kızgın"
        : durum?.viki_ruh_hali || "aç";

    const dokunmaSayisi = micoMu
        ? durum?.mico_dokunma_sayisi || 0
        : durum?.viki_dokunma_sayisi || 0;

    const konusmaSayisi = micoMu
        ? durum?.mico_konusma_sayisi || 0
        : durum?.viki_konusma_sayisi || 0;

    return (
        <article
            className={[
                "kp-karakter-karti",
                `kp-karakter-karti--${karakter}`,
            ].join(" ")}
        >
            <span className="kp-karakter-dekor kp-karakter-dekor--bir" />
            <span className="kp-karakter-dekor kp-karakter-dekor--iki" />

            <div className="kp-karakter-kart-ust">
                <span className="kp-karakter-rozet">
                    <Sparkles size={13} />
                    {bilgi.rozet}
                </span>

                <span
                    className={[
                        "kp-karakter-aktiflik",
                        `kp-karakter-aktiflik--${karakter}`,
                    ].join(" ")}
                >
                    <i />
                    Aktif
                </span>
            </div>

            <div className="kp-karakter-hero">
                <div className="kp-karakter-gorsel-alani">
                    <span className="kp-karakter-halka kp-karakter-halka--dis" />
                    <span className="kp-karakter-halka kp-karakter-halka--ic" />

                    <img
                        src={bilgi.gorsel}
                        alt={bilgi.ad}
                        draggable="false"
                    />

                    <span className="kp-karakter-golge" />
                </div>

                <div className="kp-karakter-kimlik">
                    <span className="kp-karakter-mini-baslik">
                        Dijital arkadaşın
                    </span>

                    <h2>{bilgi.ad}</h2>

                    <p>{bilgi.unvan}</p>

                    <div className="kp-ruh-hali">
                        <span>
                            Ruh hâli
                        </span>

                        <strong>
                            {ruhHali}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="kp-etkilesim-butonu"
                        onClick={() =>
                            onDokun(karakter)
                        }
                        disabled={
                            islemYapiliyor
                        }
                    >
                        {islemYapiliyor ? (
                            <>
                                <RefreshCw
                                    size={17}
                                    className="kp-donen"
                                />
                                {
                                    bilgi.beklemeMetni
                                }
                            </>
                        ) : (
                            <>
                                <Heart size={17} />
                                {
                                    bilgi.butonMetni
                                }
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="kp-karakter-durum-paneli">
                <div className="kp-panel-baslik">
                    <div>
                        <span>
                            Canlı durum
                        </span>

                        <strong>
                            Şu an nasıl?
                        </strong>
                    </div>

                    <Activity size={18} />
                </div>

                <div className="kp-durumlar">
                    {micoMu ? (
                        <>
                            <DurumCubugu
                                baslik="Öfke"
                                deger={
                                    durum
                                        ?.mico_ofke
                                }
                                ikon="😠"
                                sinifAdi="kp-durum--ofke"
                            />

                            <DurumCubugu
                                baslik="Mutluluk"
                                deger={
                                    durum
                                        ?.mico_mutluluk
                                }
                                ikon="🤎"
                                sinifAdi="kp-durum--mutluluk"
                            />
                        </>
                    ) : (
                        <>
                            <DurumCubugu
                                baslik="Açlık"
                                deger={
                                    durum
                                        ?.viki_aclik
                                }
                                ikon="🍗"
                                sinifAdi="kp-durum--aclik"
                            />

                            <DurumCubugu
                                baslik="Mutluluk"
                                deger={
                                    durum
                                        ?.viki_mutluluk
                                }
                                ikon="🥹"
                                sinifAdi="kp-durum--mutluluk"
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="kp-karakter-istatistikleri">
                <Istatistik
                    ikon={
                        <Heart size={18} />
                    }
                    deger={dokunmaSayisi}
                    etiket="Sevilme"
                    vurgu="kalp"
                />

                <Istatistik
                    ikon={
                        <Volume2 size={18} />
                    }
                    deger={konusmaSayisi}
                    etiket="Konuşma"
                    vurgu="mesaj"
                />

                <Istatistik
                    ikon={
                        micoMu ? (
                            <Sparkles
                                size={18}
                            />
                        ) : (
                            <Utensils
                                size={18}
                            />
                        )
                    }
                    deger={
                        micoMu
                            ? ruhHali
                            : durum
                                ?.viki_mama_istegi ||
                            0
                    }
                    etiket={
                        micoMu
                            ? "Karakter"
                            : "Mama isteği"
                    }
                    vurgu={
                        micoMu
                            ? "ruh"
                            : "mama"
                    }
                />
            </div>
        </article>
    );
}

function dununOzetiniOlustur(
    dununHafizasi,
) {
    if (!dununHafizasi) {
        return {
            mico:
                "Dünden kalan bir anım henüz yok. Bugün programı aksatma.",

            viki:
                "Dünden bir kayıt bulamadım… ama bugün mama olabilir mi? 🥹",
        };
    }

    const tamamlananlar =
        Array.isArray(
            dununHafizasi
                .tamamlanan_ogunler,
        )
            ? dununHafizasi
                .tamamlanan_ogunler
            : [];

    const gecikenler =
        Array.isArray(
            dununHafizasi
                .geciken_ogunler,
        )
            ? dununHafizasi
                .geciken_ogunler
            : [];

    const suMiktari =
        Number(
            dununHafizasi.su_miktari,
        ) || 0;

    const suHedefi =
        Number(
            dununHafizasi.su_hedefi,
        ) || 8;

    const tumOgunlerTamamlandi =
        Boolean(
            dununHafizasi
                .tum_ogunler_tamamlandi,
        );

    let micoMesaji;

    if (tumOgunlerTamamlandi) {
        micoMesaji =
            "Dün bütün öğünleri tamamladın. Güzel. Bugün de aynı disiplini bekliyorum.";
    } else if (gecikenler.length > 0) {
        micoMesaji =
            `Dün ${gecikenler.length} öğün gecikti. Bugün saat konusunda daha dikkatli ol. HAV!`;
    } else if (tamamlananlar.length > 0) {
        micoMesaji =
            `Dün ${tamamlananlar.length} öğünü tamamladın. Fena değildi ama bugün daha iyisini bekliyorum.`;
    } else {
        micoMesaji =
            "Dün program konusunda pek hareket göremedim. Bugün beni sinirlendirme.";
    }

    let vikiMesaji;

    if (suMiktari >= suHedefi) {
        vikiMesaji =
            "Dün su hedefini tamamladın! Çok güzeldi… ama kutlama maması hâlâ gelmedi 🥹";
    } else {
        vikiMesaji =
            `Dün ${suMiktari}/${suHedefi} bardak su içtin. Bugün birlikte hedefi tamamlayalım mı?`;
    }

    return {
        mico:
            dununHafizasi
                .mico_gun_yorumu ||
            micoMesaji,

        viki:
            dununHafizasi
                .viki_gun_yorumu ||
            vikiMesaji,
    };
}

function KonusmaKarti({
    karakter,
    mesaj,
}) {
    const bilgi =
        KARAKTER_BILGILERI[karakter];

    return (
        <article
            className={[
                "kp-hafiza-mesaj",
                `kp-hafiza-mesaj--${karakter}`,
            ].join(" ")}
        >
            <div className="kp-hafiza-avatar">
                <span>
                    <img
                        src={bilgi.gorsel}
                        alt={bilgi.ad}
                    />
                </span>

                <div>
                    <strong>
                        {bilgi.ad}
                    </strong>

                    <small>
                        Dünkü yorumu
                    </small>
                </div>
            </div>

            <div className="kp-konusma-balonu">
                <MessageCircle size={17} />
                <p>{mesaj}</p>
            </div>
        </article>
    );
}

export default function Karakterler() {
    const {
        durum,
        gunlukHafiza,
        dununHafizasi,
        sonYediGun,
        aktifTepki,
        yukleniyor,
        hata,
        olayCalistir,
        sistemiYukle,
    } = useSupabaseKarakterMotoru();

    const [
        islemYapilanKarakter,
        setIslemYapilanKarakter,
    ] = useState(null);

    const [
        yerelMesaj,
        setYerelMesaj,
    ] = useState("");

    const [
        yenileniyor,
        setYenileniyor,
    ] = useState(false);

    useEffect(() => {
        if (aktifTepki?.mesaj) {
            setYerelMesaj(
                aktifTepki.mesaj,
            );
        }
    }, [aktifTepki]);

    const sonMesaj =
        yerelMesaj ||
        durum?.son_mesaj ||
        "Miço ve Viki bugün seninle konuşmayı bekliyor.";

    const sonKarakter =
        aktifTepki?.karakter ||
        durum?.son_karakter ||
        "mico";

    const sonKarakterBilgisi =
        KARAKTER_BILGILERI[
        sonKarakter
        ] || KARAKTER_BILGILERI.mico;

    const karaktereDokun =
        useCallback(
            async (karakter) => {
                setIslemYapilanKarakter(
                    karakter,
                );

                const micoMu =
                    karakter === "mico";

                const mesaj = micoMu
                    ? "Ekrana dokunmakla olmaz. Beni kucağına al şimdi, yoksa çığlık atarım."
                    : "Bana mı dokundun? Pati verdim. Şimdi küçücük mama olur mu? 🐾";

                try {
                    const sonuc =
                        await olayCalistir({
                            olay:
                                "karaktere-dokunuldu",

                            karakter,

                            ruhHali: micoMu
                                ? "kizgin"
                                : "heyecanli",

                            mesaj,

                            veri: {
                                kaynak:
                                    "karakter-profili",
                            },
                        });

                    setYerelMesaj(
                        sonuc?.mesaj ||
                        mesaj,
                    );
                } catch (error) {
                    console.error(
                        "Karakter etkileşimi başarısız:",
                        error,
                    );
                } finally {
                    setIslemYapilanKarakter(
                        null,
                    );
                }
            },
            [olayCalistir],
        );

    const verileriYenile =
        useCallback(async () => {
            setYenileniyor(true);

            try {
                await sistemiYukle();
            } finally {
                setYenileniyor(false);
            }
        }, [sistemiYukle]);

    const gunlukOzet =
        useMemo(() => {
            const tamamlanan =
                gunlukHafiza
                    ?.tamamlanan_ogunler;

            const geciken =
                gunlukHafiza
                    ?.geciken_ogunler;

            return {
                tamamlananOgun:
                    Array.isArray(
                        tamamlanan,
                    )
                        ? tamamlanan.length
                        : 0,

                gecikenOgun:
                    Array.isArray(geciken)
                        ? geciken.length
                        : 0,

                suMiktari:
                    Number(
                        gunlukHafiza
                            ?.su_miktari,
                    ) || 0,

                suHedefi:
                    Number(
                        gunlukHafiza
                            ?.su_hedefi,
                    ) || 8,
            };
        }, [gunlukHafiza]);

    const dununOzeti = useMemo(
        () =>
            dununOzetiniOlustur(
                dununHafizasi,
            ),
        [dununHafizasi],
    );

    const yediGunlukBasari =
        useMemo(() => {
            const kayitlar =
                Array.isArray(
                    sonYediGun,
                )
                    ? sonYediGun
                    : [];

            const tamamlananGun =
                kayitlar.filter(
                    (kayit) =>
                        kayit
                            .tum_ogunler_tamamlandi,
                ).length;

            const toplamSu =
                kayitlar.reduce(
                    (
                        toplam,
                        kayit,
                    ) =>
                        toplam +
                        (Number(
                            kayit
                                .su_miktari,
                        ) || 0),
                    0,
                );

            return {
                gunSayisi:
                    kayitlar.length,

                tamamlananGun,

                toplamSu,
            };
        }, [sonYediGun]);

    const suYuzdesi = Math.min(
        Math.round(
            (gunlukOzet.suMiktari /
                Math.max(
                    gunlukOzet.suHedefi,
                    1,
                )) *
            100,
        ),
        100,
    );

    if (yukleniyor) {
        return (
            <main className="kp-sayfa">
                <div className="kp-yukleniyor">
                    <div className="kp-yukleniyor-gorsel">
                        <span />
                        <Sparkles size={24} />
                    </div>

                    <strong>
                        Miço ve Viki
                        hazırlanıyor...
                    </strong>

                    <small>
                        Anıları ve ruh hâlleri
                        yükleniyor.
                    </small>
                </div>
            </main>
        );
    }

    return (
        <main className="kp-sayfa">
            <section className="kp-hero">
                <span className="kp-hero-dekor kp-hero-dekor--bir" />
                <span className="kp-hero-dekor kp-hero-dekor--iki" />

                <div className="kp-hero-icerik">
                    <span className="kp-hero-rozet">
                        <Sparkles size={14} />
                        Dijital arkadaşların
                    </span>

                    <h1>
                        Miço
                        <span>&amp;</span>
                        Viki
                    </h1>

                    <p>
                        Günlük programını takip
                        eden, seninle konuşan ve
                        yaşadıklarını hatırlayan
                        dijital dostların.
                    </p>

                    <div className="kp-hero-bilgiler">
                        <span>
                            <Activity size={15} />
                            2 karakter aktif
                        </span>

                        <span>
                            <CalendarDays
                                size={15}
                            />
                            Günlük hafıza açık
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="kp-yenile-butonu"
                    onClick={verileriYenile}
                    disabled={yenileniyor}
                    aria-label="Verileri yenile"
                >
                    <RefreshCw
                        size={20}
                        className={
                            yenileniyor
                                ? "kp-donen"
                                : ""
                        }
                    />

                    <span>
                        {yenileniyor
                            ? "Yenileniyor"
                            : "Yenile"}
                    </span>
                </button>
            </section>

            {hata && (
                <div className="kp-hata">
                    <span className="kp-hata-ikon">
                        !
                    </span>

                    <div>
                        <strong>
                            Karakter sistemi
                            yüklenemedi
                        </strong>

                        <span>{hata}</span>
                    </div>
                </div>
            )}

            <section
                className={[
                    "kp-son-mesaj",
                    `kp-son-mesaj--${sonKarakter}`,
                ].join(" ")}
            >
                <div className="kp-son-mesaj-avatar">
                    <span>
                        <img
                            src={
                                sonKarakterBilgisi.gorsel
                            }
                            alt={
                                sonKarakterBilgisi.ad
                            }
                        />
                    </span>

                    <i />
                </div>

                <div className="kp-son-mesaj-icerik">
                    <div className="kp-son-mesaj-baslik">
                        <div>
                            <strong>
                                {
                                    sonKarakterBilgisi.ad
                                }
                            </strong>

                            <small>
                                Son düşüncesi
                            </small>
                        </div>

                        <MessageCircle
                            size={19}
                        />
                    </div>

                    <p>{sonMesaj}</p>
                </div>
            </section>

            <section className="kp-karakter-listesi">
                <KarakterKarti
                    karakter="mico"
                    durum={durum}
                    onDokun={
                        karaktereDokun
                    }
                    islemYapiliyor={
                        islemYapilanKarakter ===
                        "mico"
                    }
                />

                <KarakterKarti
                    karakter="viki"
                    durum={durum}
                    onDokun={
                        karaktereDokun
                    }
                    islemYapiliyor={
                        islemYapilanKarakter ===
                        "viki"
                    }
                />
            </section>

            <section className="kp-alt-icerik">
                <article className="kp-hafiza-karti">
                    <div className="kp-bolum-basligi">
                        <div>
                            <span>
                                Karakter hafızası
                            </span>

                            <h2>
                                Dünden
                                hatırladıkları
                            </h2>

                            <p>
                                Miço ve Viki,
                                dünkü ilerlemeni
                                kendi tarzlarıyla
                                yorumladı.
                            </p>
                        </div>

                        <span className="kp-tarih-rozeti">
                            <CalendarDays
                                size={14}
                            />
                            Dün
                        </span>
                    </div>

                    <div className="kp-hafiza-konusmalar">
                        <KonusmaKarti
                            karakter="mico"
                            mesaj={
                                dununOzeti.mico
                            }
                        />

                        <KonusmaKarti
                            karakter="viki"
                            mesaj={
                                dununOzeti.viki
                            }
                        />
                    </div>

                    <div className="kp-yedi-gun">
                        <Istatistik
                            ikon={
                                <CalendarDays
                                    size={18}
                                />
                            }
                            deger={
                                yediGunlukBasari
                                    .gunSayisi
                            }
                            etiket="Kayıtlı gün"
                            aciklama="Son 7 gün"
                            vurgu="takvim"
                        />

                        <Istatistik
                            ikon={
                                <CheckCircle2
                                    size={18}
                                />
                            }
                            deger={
                                yediGunlukBasari
                                    .tamamlananGun
                            }
                            etiket="Kusursuz gün"
                            aciklama="Tüm öğünler"
                            vurgu="basari"
                        />

                        <Istatistik
                            ikon={
                                <Droplets
                                    size={18}
                                />
                            }
                            deger={
                                yediGunlukBasari
                                    .toplamSu
                            }
                            etiket="Toplam su"
                            aciklama="Bardak"
                            vurgu="su"
                        />
                    </div>
                </article>

                <article className="kp-gunluk-ozet">
                    <div className="kp-bolum-basligi">
                        <div>
                            <span>
                                Bugünün hafızası
                            </span>

                            <h2>
                                Bugün neler
                                oldu?
                            </h2>

                            <p>
                                Gün içerisindeki
                                öğün ve su
                                ilerlemen.
                            </p>
                        </div>

                        <span className="kp-canli">
                            <i />
                            Canlı
                        </span>
                    </div>

                    <div className="kp-gunluk-grid">
                        <Istatistik
                            ikon={
                                <CheckCircle2
                                    size={19}
                                />
                            }
                            deger={
                                gunlukOzet
                                    .tamamlananOgun
                            }
                            etiket="Tamamlanan"
                            aciklama="Öğün"
                            vurgu="basari"
                        />

                        <Istatistik
                            ikon={
                                <Clock3
                                    size={19}
                                />
                            }
                            deger={
                                gunlukOzet
                                    .gecikenOgun
                            }
                            etiket="Geciken"
                            aciklama="Öğün"
                            vurgu="geciken"
                        />

                        <Istatistik
                            ikon={
                                <Droplets
                                    size={19}
                                />
                            }
                            deger={`${gunlukOzet.suMiktari}/${gunlukOzet.suHedefi}`}
                            etiket="Su hedefi"
                            aciklama={`%${suYuzdesi}`}
                            vurgu="su"
                        />
                    </div>

                    <div className="kp-su-paneli">
                        <div className="kp-su-paneli-ust">
                            <span>
                                <Droplets
                                    size={17}
                                />
                                Günlük su
                                ilerlemesi
                            </span>

                            <strong>
                                %{suYuzdesi}
                            </strong>
                        </div>

                        <div className="kp-su-cubugu">
                            <span
                                style={{
                                    width: `${suYuzdesi}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="kp-hafiza-mesaji">
                        <span>
                            <Sparkles
                                size={19}
                            />
                        </span>

                        <div>
                            <strong>
                                Günün notu
                            </strong>

                            <p>
                                {gunlukHafiza
                                    ?.tum_ogunler_tamamlandi
                                    ? "Miço bugünkü programı onayladı. Viki kutlama mamasını bekliyor."
                                    : "Gün ilerledikçe Miço ve Viki yaşananları burada hatırlayacak."}
                            </p>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    );
}