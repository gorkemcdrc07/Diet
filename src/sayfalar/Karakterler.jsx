import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Heart,
    RefreshCw,
    Sparkles,
    Utensils,
    Volume2,
} from "lucide-react";

import useSupabaseKarakterMotoru from "../karakterler/useSupabaseKarakterMotoru";

import "./Karakterler.css";

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
                <span>
                    {ikon}
                    {baslik}
                </span>

                <strong>
                    %{guvenliDeger}
                </strong>
            </div>

            <div className="kp-durum-cubugu">
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
}) {
    return (
        <div className="kp-istatistik">
            <span className="kp-istatistik-ikon">
                {ikon}
            </span>

            <strong>{deger}</strong>
            <small>{etiket}</small>
        </div>
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

    const ad = micoMu
        ? "Miço"
        : "Viki";

    const unvan = micoMu
        ? "Evin huysuz patronu"
        : "Mama denetçisi";

    const gorsel = micoMu
        ? "/karakterler/mico-kizgin.png"
        : "/karakterler/viki-mama.png";

    return (
        <article
            className={[
                "kp-karakter-karti",
                `kp-karakter-karti--${karakter}`,
            ].join(" ")}
        >
            <div className="kp-karakter-ust">
                <div className="kp-karakter-gorsel">
                    <span className="kp-karakter-parilti" />

                    <img
                        src={gorsel}
                        alt={ad}
                        draggable="false"
                    />

                    <span className="kp-karakter-golge" />
                </div>

                <div className="kp-karakter-kimlik">
                    <span>
                        {micoMu
                            ? "Evin patronu"
                            : "Mama uzmanı"}
                    </span>

                    <h2>{ad}</h2>
                    <p>{unvan}</p>

                    <button
                        type="button"
                        onClick={() =>
                            onDokun(
                                karakter,
                            )
                        }
                        disabled={
                            islemYapiliyor
                        }
                    >
                        <Heart size={16} />

                        {islemYapiliyor
                            ? "Bekle..."
                            : micoMu
                              ? "Miço’yu sev"
                              : "Viki’ye pati ver"}
                    </button>
                </div>
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

            <div className="kp-istatistik-grid">
                <Istatistik
                    ikon={
                        <Heart size={16} />
                    }
                    deger={
                        micoMu
                            ? durum
                                  ?.mico_dokunma_sayisi ||
                              0
                            : durum
                                  ?.viki_dokunma_sayisi ||
                              0
                    }
                    etiket="Sevilme"
                />

                <Istatistik
                    ikon={
                        <Volume2 size={16} />
                    }
                    deger={
                        micoMu
                            ? durum
                                  ?.mico_konusma_sayisi ||
                              0
                            : durum
                                  ?.viki_konusma_sayisi ||
                              0
                    }
                    etiket="Konuşma"
                />

                <Istatistik
                    ikon={
                        micoMu ? (
                            <Sparkles
                                size={16}
                            />
                        ) : (
                            <Utensils
                                size={16}
                            />
                        )
                    }
                    deger={
                        micoMu
                            ? durum
                                  ?.mico_ruh_hali ||
                              "Kızgın"
                            : durum
                                  ?.viki_mama_istegi ||
                              0
                    }
                    etiket={
                        micoMu
                            ? "Ruh hâli"
                            : "Mama isteği"
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

    const [yerelMesaj, setYerelMesaj] =
        useState("");

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

    const gunlukOzet = useMemo(() => {
        const tamamlanan =
            gunlukHafiza
                ?.tamamlanan_ogunler;

        const geciken =
            gunlukHafiza
                ?.geciken_ogunler;

        return {
            tamamlananOgun:
                Array.isArray(tamamlanan)
                    ? tamamlanan.length
                    : 0,

            gecikenOgun:
                Array.isArray(geciken)
                    ? geciken.length
                    : 0,

            suMiktari:
                gunlukHafiza
                    ?.su_miktari || 0,

            suHedefi:
                gunlukHafiza
                    ?.su_hedefi || 8,
        };
    }, [gunlukHafiza]);


    const dununOzeti = useMemo(
        () =>
            dununOzetiniOlustur(
                dununHafizasi,
            ),
        [dununHafizasi],
    );

    const yediGunlukBasari = useMemo(() => {
        const kayitlar =
            Array.isArray(sonYediGun)
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
                (toplam, kayit) =>
                    toplam +
                    (Number(
                        kayit.su_miktari,
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

    if (yukleniyor) {

        return (

            <main className="kp-sayfa">

                <div className="kp-yukleniyor">

                    <span />



                    <strong>

                        Miço ve Viki

                        hazırlanıyor...

                    </strong>

                </div>

            </main>

        );

    }


    return (
        <main className="kp-sayfa">
            <header className="kp-sayfa-baslik">
                <div>
                    <span>
                        Dijital arkadaşların
                    </span>

                    <h1>
                        Miço &amp; Viki
                    </h1>

                    <p>
                        Ruh hâllerini,
                        anılarını ve günlük
                        durumlarını buradan
                        takip edebilirsin.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        sistemiYukle
                    }
                    aria-label="Verileri yenile"
                >
                    <RefreshCw
                        size={19}
                    />
                </button>
            </header>

            {hata && (
                <div className="kp-hata">
                    <strong>
                        Karakter sistemi
                        yüklenemedi
                    </strong>

                    <span>{hata}</span>
                </div>
            )}

            <section
                className={[
                    "kp-son-mesaj",
                    `kp-son-mesaj--${sonKarakter}`,
                ].join(" ")}
            >
                <div className="kp-son-mesaj-kimlik">
                    <span>
                        {sonKarakter ===
                        "mico"
                            ? "M"
                            : "V"}
                    </span>

                    <div>
                        <strong>
                            {sonKarakter ===
                            "mico"
                                ? "Miço"
                                : "Viki"}
                        </strong>

                        <small>
                            Son düşüncesi
                        </small>
                    </div>
                </div>

                <p>{sonMesaj}</p>
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

            <section className="kp-hafiza-karti">
                <div className="kp-hafiza-baslik">
                    <div>
                        <span>
                            Karakter hafızası
                        </span>

                        <h2>
                            Dünden hatırladıkları
                        </h2>
                    </div>

                    <span className="kp-hafiza-tarih">
                        Dün
                    </span>
                </div>

                <div className="kp-hafiza-konusmalar">
                    <article className="kp-hafiza-mesaj kp-hafiza-mesaj--mico">
                        <div className="kp-hafiza-karakter">
                            <img
                                src="/karakterler/mico-kizgin.png"
                                alt="Miço"
                            />

                            <div>
                                <strong>
                                    Miço
                                </strong>

                                <small>
                                    Dünkü yorumu
                                </small>
                            </div>
                        </div>

                        <p>
                            {dununOzeti.mico}
                        </p>
                    </article>

                    <article className="kp-hafiza-mesaj kp-hafiza-mesaj--viki">
                        <div className="kp-hafiza-karakter">
                            <img
                                src="/karakterler/viki-mama.png"
                                alt="Viki"
                            />

                            <div>
                                <strong>
                                    Viki
                                </strong>

                                <small>
                                    Dünkü yorumu
                                </small>
                            </div>
                        </div>

                        <p>
                            {dununOzeti.viki}
                        </p>
                    </article>
                </div>

                <div className="kp-yedi-gun">
                    <div>
                        <strong>
                            {
                                yediGunlukBasari
                                    .gunSayisi
                            }
                        </strong>

                        <small>
                            Kayıtlı gün
                        </small>
                    </div>

                    <div>
                        <strong>
                            {
                                yediGunlukBasari
                                    .tamamlananGun
                            }
                        </strong>

                        <small>
                            Kusursuz gün
                        </small>
                    </div>

                    <div>
                        <strong>
                            {
                                yediGunlukBasari
                                    .toplamSu
                            }
                        </strong>

                        <small>
                            Toplam su
                        </small>
                    </div>
                </div>
            </section>

            <section className="kp-gunluk-ozet">
                <div className="kp-gunluk-ozet-baslik">
                    <div>
                        <span>
                            Bugünün hafızası
                        </span>

                        <h2>
                            Bugün neler oldu?
                        </h2>
                    </div>

                    <span className="kp-canli">
                        <i />
                        Supabase
                    </span>
                </div>

                <div className="kp-gunluk-grid">
                    <Istatistik
                        ikon="🥣"
                        deger={
                            gunlukOzet
                                .tamamlananOgun
                        }
                        etiket="Tamamlanan öğün"
                    />

                    <Istatistik
                        ikon="⏰"
                        deger={
                            gunlukOzet
                                .gecikenOgun
                        }
                        etiket="Geciken öğün"
                    />

                    <Istatistik
                        ikon="💧"
                        deger={`${gunlukOzet.suMiktari}/${gunlukOzet.suHedefi}`}
                        etiket="Su"
                    />
                </div>

                <div className="kp-hafiza-mesaji">
                    <Sparkles size={18} />

                    <p>
                        {gunlukHafiza
                            ?.tum_ogunler_tamamlandi
                            ? "Miço bugünkü programı onayladı. Viki kutlama mamasını bekliyor."
                            : "Gün ilerledikçe Miço ve Viki yaşananları burada hatırlayacak."}
                    </p>
                </div>
            </section>
        </main>
    );
}