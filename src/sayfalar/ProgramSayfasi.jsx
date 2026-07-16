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
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import confetti from "canvas-confetti";

import {
    gunlukProgram,
    suHedefi,
} from "../veriler/gunlukProgram";

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

function icerikMetniniGetir(icerik) {
    if (typeof icerik === "string") {
        return icerik;
    }

    return (
        icerik?.ad ||
        icerik?.isim ||
        icerik?.baslik ||
        icerik?.besin_adi ||
        "Besin"
    );
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
    const guvenliProgram =
        useMemo(() => {
            if (
                !Array.isArray(
                    gunlukProgram,
                )
            ) {
                return [];
            }

            return gunlukProgram.map(
                (
                    ogun,
                    index,
                ) => ({
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
                        ogun?.aciklama ||
                        ogun?.ogun_adi ||
                        "Beslenme programı",

                    saat:
                        String(
                            ogun?.saat ||
                            "--:--",
                        ).slice(0, 5),

                    emoji:
                        ogun?.emoji ||
                        ogun?.ikon ||
                        "🍽️",

                    icerikler:
                        Array.isArray(
                            ogun?.icerikler,
                        )
                            ? ogun.icerikler
                            : Array.isArray(
                                ogun?.detaylar,
                            )
                                ? ogun.detaylar
                                : [],
                }),
            );
        }, []);

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
            <OgunTamamlamaModali
                acik={Boolean(tamamlanacakOgun)}
                ogun={tamamlanacakOgun}
                onKapat={() => {
                    setTamamlanacakOgun(null);
                }}
                onTamamla={({
                    ogun,
                    fotograf,
                    notMetni,
                }) => {
                    ogunDurumunuDegistir(
                        ogun.id,
                    );

                    setTamamlanacakOgun(
                        null,
                    );

                    console.log(
                        "Tamamlanan öğün kaydı:",
                        {
                            ogun,
                            fotograf,
                            notMetni,
                        },
                    );
                }}
                onKaloriAnalizineGonder={({
                    ogun,
                    fotograf,
                    notMetni,
                }) => {
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

                    setAktifBolum(
                        "kalori",
                    );
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
            <header className="sayfa-basligi">
                <div className="sayfa-baslik-ikon">
                    <CalendarDays
                        size={22}
                    />
                </div>

                <div>
                    <span>
                        {bugununTarihiniGetir()}
                    </span>

                    <h1>
                        Günlük Program
                    </h1>
                </div>
            </header>

            <section className="program-ozet-karti">
                <div className="program-ozet-icerik">
                    <span className="program-ozet-ikon">
                        <CheckCircle2
                            size={22}
                        />
                    </span>

                    <div>
                        <span>
                            Bugünkü plan
                        </span>

                        <strong>
                            Gününü buradan yönet
                        </strong>

                        <p>
                            Öğünlerini, su hedefini
                            ve ilaç hatırlatmanı tek
                            ekrandan takip et.
                        </p>
                    </div>
                </div>

                <div className="program-ilerleme-alani">
                    <div className="program-ilerleme-bilgisi">
                        <span>
                            Günlük ilerleme
                        </span>

                        <strong>
                            %{tamamlanmaYuzdesi}
                        </strong>
                    </div>

                    <div className="program-ilerleme-cubugu">
                        <span
                            style={{
                                width:
                                    `${tamamlanmaYuzdesi}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="program-mini-istatistikler">
                    <article>
                        <Utensils
                            size={17}
                        />

                        <div>
                            <strong>
                                {tamamlananOgunSayisi}
                                /
                                {toplamOgun}
                            </strong>

                            <span>
                                Öğün
                            </span>
                        </div>
                    </article>

                    <article>
                        <Droplets
                            size={17}
                        />

                        <div>
                            <strong>
                                {suMiktari}
                                /
                                {suHedefi}
                            </strong>

                            <span>
                                Su
                            </span>
                        </div>
                    </article>

                    <article>
                        <Pill
                            size={17}
                        />

                        <div>
                            <strong>
                                Aktif
                            </strong>

                            <span>
                                İlaç
                            </span>
                        </div>
                    </article>
                </div>
            </section>

            <nav
                className="program-sekme-menusu"
                aria-label="Program bölümleri"
            >
                <button
                    type="button"
                    className={
                        aktifBolum ===
                            "ogunler"
                            ? "aktif"
                            : ""
                    }
                    onClick={() =>
                        setAktifBolum(
                            "ogunler",
                        )
                    }
                >
                    <Utensils size={17} />
                    Öğünler
                </button>

                <button
                    type="button"
                    className={
                        aktifBolum ===
                            "su"
                            ? "aktif"
                            : ""
                    }
                    onClick={() =>
                        setAktifBolum(
                            "su",
                        )
                    }
                >
                    <Droplets size={17} />
                    Su
                </button>

                <button
                    type="button"
                    className={
                        aktifBolum ===
                            "ilac"
                            ? "aktif"
                            : ""
                    }
                    onClick={() =>
                        setAktifBolum(
                            "ilac",
                        )
                    }
                >
                    <Pill size={17} />
                    İlaç
                </button>
                <button
                    type="button"
                    className={
                        aktifBolum === "kalori"
                            ? "aktif"
                            : ""
                    }
                    onClick={() =>
                        setAktifBolum("kalori")
                    }
                >
                    <Flame size={17} />
                    Kalori
                </button>
            </nav>

            {aktifBolum ===
                "ogunler" && (
                    <section className="program-bolumu">
                        <div className="program-bolum-basligi">
                            <div>
                                <span>
                                    Beslenme planın
                                </span>

                                <h2>
                                    Bugünkü Öğünler
                                </h2>
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

                                                    {ogun
                                                        .icerikler
                                                        .length >
                                                        0 && (
                                                            <ul>
                                                                {ogun.icerikler.map(
                                                                    (
                                                                        icerik,
                                                                        icerikIndex,
                                                                    ) => (
                                                                        <li
                                                                            key={`${ogun.id}-${icerikIndex}`}
                                                                        >
                                                                            {icerikMetniniGetir(
                                                                                icerik,
                                                                            )}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
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
                                                        onClick={() => {
                                                            if (tamamlandi) {
                                                                ogunDurumunuDegistir(
                                                                    ogun.id,
                                                                );

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
                        <div className="program-bolum-basligi">
                            <div>
                                <span>
                                    Günlük sağlık
                                </span>

                                <h2>
                                    Su Takibi
                                </h2>
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
                        <div className="program-bolum-basligi">
                            <div>
                                <span>
                                    Hatırlatmalar
                                </span>

                                <h2>
                                    İlaç Takibi
                                </h2>
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