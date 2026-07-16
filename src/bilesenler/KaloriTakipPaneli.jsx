import {
    Beef,
    Camera,
    Carrot,
    Flame,
    LoaderCircle,
    RefreshCw,
    Settings2,
    Trash2,
    Wheat,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import YemekFotografiAnalizPaneli from "./YemekFotografiAnalizPaneli";

import {
    fotografiKullananKayitSayisiniGetir,
    gunlukKaloriOzetiniGetir,
    kaloriHedefiniKaydet,
    sonGunlerinOzetiniGetir,
    yemekKaydiniSil,
} from "../servisler/kaloriServisi";

import "./KaloriTakipPaneli.css";
import {
    yemekFotografiniSil,
} from "../servisler/yemekFotografiYuklemeServisi";

function sayiyiFormatla(
    deger,
    basamak = 0,
) {
    const sayi =
        Number(deger);

    if (!Number.isFinite(sayi)) {
        return "0";
    }

    return new Intl.NumberFormat(
        "tr-TR",
        {
            minimumFractionDigits:
                basamak,

            maximumFractionDigits:
                basamak,
        },
    ).format(sayi);
}

function yuzdeSinirla(deger) {
    const sayi =
        Number(deger) || 0;

    return Math.min(
        Math.max(
            sayi,
            0,
        ),
        100,
    );
}

function ogunEtiketiniGetir(
    ogunTuru,
) {
    const etiketler = {
        kahvalti:
            "Kahvaltı",

        "ara-ogun":
            "Ara Öğün",

        ogle:
            "Öğle",

        aksam:
            "Akşam",

        gece:
            "Gece",

        diger:
            "Diğer",
    };

    return (
        etiketler[ogunTuru] ||
        "Diğer"
    );
}

function saatMetniniGetir(saat) {
    if (!saat) {
        return "--:--";
    }

    return String(saat).slice(
        0,
        5,
    );
}

function gunEtiketiniGetir(tarih) {
    if (!tarih) {
        return "-";
    }

    const [
        yil,
        ay,
        gun,
    ] = String(tarih)
        .split("-")
        .map(Number);

    if (
        !yil ||
        !ay ||
        !gun
    ) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        "tr-TR",
        {
            weekday: "short",
        },
    ).format(
        new Date(
            yil,
            ay - 1,
            gun,
            12,
            0,
            0,
        ),
    );
}

export default function KaloriTakipPaneli({
    baslangicAnalizi = null,
    onBaslangicAnaliziKullanildi,
}) {
    const [
        ozet,
        setOzet,
    ] = useState(null);

    const [
        yukleniyor,
        setYukleniyor,
    ] = useState(true);

    const [
        yenileniyor,
        setYenileniyor,
    ] = useState(false);

    const [
        hedefAyarlariAcik,
        setHedefAyarlariAcik,
    ] = useState(false);

    const [
        hedefFormu,
        setHedefFormu,
    ] = useState({
        kalori: "2000",
        protein: "100",
        karbonhidrat: "250",
        yag: "70",
    });

    const [
        kaydediliyor,
        setKaydediliyor,
    ] = useState(false);

    const [
        silinenKayitId,
        setSilinenKayitId,
    ] = useState(null);

    const [
        hata,
        setHata,
    ] = useState("");

    const [
        mesaj,
        setMesaj,
    ] = useState("");

    const [
        haftalikOzet,
        setHaftalikOzet,
    ] = useState(null);

    const verileriYukle = useCallback(
        async (sessiz = false) => {
            if (sessiz) {
                setYenileniyor(true);
            } else {
                setYukleniyor(true);
            }

            setHata("");

            try {
                const [
                    sonuc,
                    haftalikSonuc,
                ] = await Promise.all([
                    gunlukKaloriOzetiniGetir(),
                    sonGunlerinOzetiniGetir(7),
                ]);

                setHaftalikOzet(
                    haftalikSonuc,
                );
                const guvenliOzet = {
                    tarih:
                        sonuc?.tarih ||
                        null,

                    toplam: {
                        kalori:
                            Number(
                                sonuc?.toplam?.kalori,
                            ) || 0,

                        protein:
                            Number(
                                sonuc?.toplam?.protein,
                            ) || 0,

                        karbonhidrat:
                            Number(
                                sonuc?.toplam
                                    ?.karbonhidrat,
                            ) || 0,

                        yag:
                            Number(
                                sonuc?.toplam?.yag,
                            ) || 0,

                        kayitSayisi:
                            Number(
                                sonuc?.toplam
                                    ?.kayitSayisi,
                            ) || 0,
                    },

                    hedef: {
                        gunlukKaloriHedefi:
                            Number(
                                sonuc?.hedef
                                    ?.gunlukKaloriHedefi,
                            ) || 2000,

                        proteinHedefi:
                            Number(
                                sonuc?.hedef
                                    ?.proteinHedefi,
                            ) || 100,

                        karbonhidratHedefi:
                            Number(
                                sonuc?.hedef
                                    ?.karbonhidratHedefi,
                            ) || 250,

                        yagHedefi:
                            Number(
                                sonuc?.hedef
                                    ?.yagHedefi,
                            ) || 70,
                    },

                    yuzdeler: {
                        kalori:
                            Number(
                                sonuc?.yuzdeler
                                    ?.kalori,
                            ) || 0,

                        protein:
                            Number(
                                sonuc?.yuzdeler
                                    ?.protein,
                            ) || 0,

                        karbonhidrat:
                            Number(
                                sonuc?.yuzdeler
                                    ?.karbonhidrat,
                            ) || 0,

                        yag:
                            Number(
                                sonuc?.yuzdeler
                                    ?.yag,
                            ) || 0,
                    },

                    kalan: {
                        kalori:
                            Number(
                                sonuc?.kalan?.kalori,
                            ) || 0,

                        protein:
                            Number(
                                sonuc?.kalan?.protein,
                            ) || 0,

                        karbonhidrat:
                            Number(
                                sonuc?.kalan
                                    ?.karbonhidrat,
                            ) || 0,

                        yag:
                            Number(
                                sonuc?.kalan?.yag,
                            ) || 0,
                    },

                    kayitlar:
                        Array.isArray(
                            sonuc?.kayitlar,
                        )
                            ? sonuc.kayitlar
                            : [],
                };

                setOzet(guvenliOzet);

                setHedefFormu({
                    kalori:
                        String(
                            guvenliOzet
                                .hedef
                                .gunlukKaloriHedefi,
                        ),

                    protein:
                        String(
                            guvenliOzet
                                .hedef
                                .proteinHedefi,
                        ),

                    karbonhidrat:
                        String(
                            guvenliOzet
                                .hedef
                                .karbonhidratHedefi,
                        ),

                    yag:
                        String(
                            guvenliOzet
                                .hedef
                                .yagHedefi,
                        ),
                });
            } catch (error) {
                console.error(
                    "Kalori özeti alınamadı:",
                    error,
                );

                const varsayilanOzet = {
                    tarih: null,

                    toplam: {
                        kalori: 0,
                        protein: 0,
                        karbonhidrat: 0,
                        yag: 0,
                        kayitSayisi: 0,
                    },

                    hedef: {
                        gunlukKaloriHedefi:
                            2000,

                        proteinHedefi:
                            100,

                        karbonhidratHedefi:
                            250,

                        yagHedefi:
                            70,
                    },

                    yuzdeler: {
                        kalori: 0,
                        protein: 0,
                        karbonhidrat: 0,
                        yag: 0,
                    },

                    kalan: {
                        kalori: 2000,
                        protein: 100,
                        karbonhidrat: 250,
                        yag: 70,
                    },

                    kayitlar: [],
                };

                setOzet(
                    varsayilanOzet,
                );

                setHaftalikOzet({
                    gunler: [],
                    ortalamaKalori: 0,
                    ortalamaProtein: 0,
                    ortalamaKarbonhidrat: 0,
                    ortalamaYag: 0,
                    kayitliGunSayisi: 0,
                });

                setHedefFormu({
                    kalori: "2000",
                    protein: "100",
                    karbonhidrat: "250",
                    yag: "70",
                });

                setHata(
                    error?.message ||
                    "Kalori bilgileri alınamadı. Varsayılan değerler gösteriliyor.",
                );
            } finally {
                setYukleniyor(false);
                setYenileniyor(false);
            }
        },
        [],
    );

    useEffect(() => {
        verileriYukle();
    }, [
        verileriYukle,
    ]);

    const toplam =
        ozet?.toplam || {
            kalori: 0,
            protein: 0,
            karbonhidrat: 0,
            yag: 0,
            kayitSayisi: 0,
        };

    const hedef =
        ozet?.hedef || {
            gunlukKaloriHedefi:
                2000,

            proteinHedefi:
                100,

            karbonhidratHedefi:
                250,

            yagHedefi:
                70,
        };

    const yuzdeler =
        ozet?.yuzdeler || {
            kalori: 0,
            protein: 0,
            karbonhidrat: 0,
            yag: 0,
        };

    const kayitlar =
        Array.isArray(
            ozet?.kayitlar,
        )
            ? ozet.kayitlar
            : [];

    const kaloriFarki =
        useMemo(() => {
            return (
                Number(
                    toplam.kalori,
                ) -
                Number(
                    hedef.gunlukKaloriHedefi,
                )
            );
        }, [
            toplam.kalori,
            hedef.gunlukKaloriHedefi,
        ]);

    const durumMetni =
        useMemo(() => {
            if (
                toplam.kayitSayisi ===
                0
            ) {
                return {
                    baslik:
                        "İlk öğününü ekle",

                    aciklama:
                        "Fotoğraf çekerek günlük kalori takibine başlayabilirsin.",
                };
            }

            if (kaloriFarki > 0) {
                return {
                    baslik:
                        `${sayiyiFormatla(
                            Math.abs(
                                kaloriFarki,
                            ),
                        )} kcal üzerindesin`,

                    aciklama:
                        "Bugünün kalan öğünlerinde daha dengeli seçimler yapabilirsin.",
                };
            }

            if (
                Math.abs(
                    kaloriFarki,
                ) <= 100
            ) {
                return {
                    baslik:
                        "Hedefine çok yakınsın",

                    aciklama:
                        "Bugünkü kalori dengen oldukça iyi görünüyor.",
                };
            }

            return {
                baslik:
                    `${sayiyiFormatla(
                        Math.abs(
                            kaloriFarki,
                        ),
                    )} kcal kaldı`,

                aciklama:
                    "Günün kalan öğünlerini hedefe göre planlayabilirsin.",
            };
        }, [
            toplam.kayitSayisi,
            kaloriFarki,
        ]);

    const karakterMesajlari =
        useMemo(() => {
            const toplamKalori =
                Number(
                    toplam.kalori,
                ) || 0;

            const kaloriHedefi =
                Number(
                    hedef.gunlukKaloriHedefi,
                ) || 2000;

            const protein =
                Number(
                    toplam.protein,
                ) || 0;

            const proteinHedefi =
                Number(
                    hedef.proteinHedefi,
                ) || 100;

            if (
                toplam.kayitSayisi ===
                0
            ) {
                return {
                    mico:
                        "Henüz kayıt yok. İlk tabağı görmeden yorum yapamam 😼",

                    vicky:
                        "İlk öğününün fotoğrafını çek, birlikte başlayalım 💜",
                };
            }

            if (
                toplamKalori >
                kaloriHedefi
            ) {
                return {
                    mico:
                        `Hedefi ${Math.round(
                            toplamKalori -
                            kaloriHedefi,
                        )} kalori geçtin. Bugünlük frene basalım.`,

                    vicky:
                        "Bir gün hedefi aşmak sorun değil. Yarın yeniden denge kurarız 💜",
                };
            }

            if (
                proteinHedefi > 0 &&
                protein <
                proteinHedefi * 0.6
            ) {
                const proteinYuzdesi =
                    Math.max(
                        Math.round(
                            (
                                protein /
                                proteinHedefi
                            ) * 100,
                        ),
                        0,
                    );

                return {
                    mico:
                        "Protein biraz geride. Akşam öğününde yumurta, tavuk veya yoğurt görmek istiyorum.",

                    vicky:
                        `Protein hedefinin %${proteinYuzdesi}'ini tamamladın. Biraz daha destekleyebiliriz 💜`,
                };
            }

            if (
                toplamKalori >=
                kaloriHedefi * 0.9
            ) {
                return {
                    mico:
                        "Hedefe çok yaklaştın. Kontrol sende.",

                    vicky:
                        "Bugünkü kalori dengen çok güzel görünüyor. Harika gidiyorsun 💜",
                };
            }

            return {
                mico:
                    `${Math.max(
                        Math.round(
                            kaloriHedefi -
                            toplamKalori,
                        ),
                        0,
                    )} kalori hakkın kaldı. Öğünü atlamak yok.`,

                vicky:
                    "Bugünkü kayıtlarını düzenli tutuyorsun. Böyle devam edelim 💜",
            };
        }, [
            toplam.kalori,
            toplam.protein,
            toplam.kayitSayisi,
            hedef.gunlukKaloriHedefi,
            hedef.proteinHedefi,
        ]);

    const haftalikGunler =
        Array.isArray(
            haftalikOzet?.gunler,
        )
            ? haftalikOzet.gunler
            : [];

    const haftalikMaksimumKalori =
        Math.max(
            ...haftalikGunler.map(
                (gun) =>
                    Number(
                        gun?.kalori,
                    ) || 0,
            ),

            Number(
                hedef.gunlukKaloriHedefi,
            ) || 2000,

            1,
        );

    async function hedefleriKaydet() {
        setKaydediliyor(
            true,
        );

        setHata("");
        setMesaj("");

        try {
            await kaloriHedefiniKaydet({
                gunlukKaloriHedefi:
                    hedefFormu.kalori,

                proteinHedefi:
                    hedefFormu.protein,

                karbonhidratHedefi:
                    hedefFormu
                        .karbonhidrat,

                yagHedefi:
                    hedefFormu.yag,
            });

            await verileriYukle(
                true,
            );

            setHedefAyarlariAcik(
                false,
            );

            setMesaj(
                "Kalori ve makro hedeflerin güncellendi.",
            );
        } catch (error) {
            console.error(
                "Kalori hedefi kaydedilemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Kalori hedefleri kaydedilemedi.",
            );
        } finally {
            setKaydediliyor(
                false,
            );
        }
    }

    async function kaydiSil(
        kayitId,
    ) {
        const onay =
            window.confirm(
                "Bu yemek kaydını silmek istediğine emin misin?",
            );

        if (!onay) {
            return;
        }

        const silinecekKayit =
            kayitlar.find(
                (kayit) =>
                    String(kayit.id) ===
                    String(kayitId),
            );

        setSilinenKayitId(
            kayitId,
        );

        setHata("");
        setMesaj("");

        try {
            let fotografSilinmeli =
                false;

            const fotografDosyaYolu =
                silinecekKayit
                    ?.fotograf_dosya_yolu ||
                null;

            if (fotografDosyaYolu) {
                const digerKayitSayisi =
                    await fotografiKullananKayitSayisiniGetir(
                        fotografDosyaYolu,
                        kayitId,
                    );

                fotografSilinmeli =
                    digerKayitSayisi === 0;
            }

            await yemekKaydiniSil(
                kayitId,
            );

            if (
                fotografSilinmeli &&
                fotografDosyaYolu
            ) {
                try {
                    await yemekFotografiniSil(
                        fotografDosyaYolu,
                    );
                } catch (storageError) {
                    console.warn(
                        "Yemek kaydı silindi ancak fotoğraf Storage'dan silinemedi:",
                        storageError,
                    );
                }
            }

            await verileriYukle(
                true,
            );

            setMesaj(
                fotografSilinmeli
                    ? "Yemek kaydı ve kullanılmayan fotoğraf silindi."
                    : "Yemek kaydı silindi.",
            );
        } catch (error) {
            console.error(
                "Yemek kaydı silinemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Yemek kaydı silinemedi.",
            );
        } finally {
            setSilinenKayitId(
                null,
            );
        }
    }

    function hedefAlaniDegistir(
        alan,
        deger,
    ) {
        setHedefFormu(
            (mevcut) => ({
                ...mevcut,
                [alan]:
                    deger,
            }),
        );

        setHata("");
        setMesaj("");
    }

    if (yukleniyor) {
        return (
            <section className="kalori-paneli kalori-paneli--yukleniyor">
                <LoaderCircle
                    className="donen-ikon"
                    size={25}
                />

                <div>
                    <strong>
                        Kalori kayıtları hazırlanıyor
                    </strong>

                    <span>
                        Günlük toplamlar ve hedefler hesaplanıyor.
                    </span>
                </div>
            </section>
        );
    }

    return (
        <div className="kalori-takip-alani">
            <section className="kalori-paneli">
                <div className="kalori-panel-baslik">
                    <div className="kalori-panel-baslik-sol">
                        <span className="kalori-panel-ikon">
                            <Flame
                                size={22}
                            />
                        </span>

                        <div>
                            <span>
                                Günlük beslenme
                            </span>

                            <h2>
                                Kalori Takibi
                            </h2>

                            <p>
                                Fotoğraflarını analiz et,
                                günlük kalorini ve makrolarını
                                tek yerden takip et.
                            </p>
                        </div>
                    </div>

                    <div className="kalori-panel-islemler">
                        <button
                            type="button"
                            onClick={() =>
                                verileriYukle(
                                    true,
                                )
                            }
                            disabled={
                                yenileniyor
                            }
                            aria-label="Kalori verilerini yenile"
                        >
                            <RefreshCw
                                className={
                                    yenileniyor
                                        ? "donen-ikon"
                                        : ""
                                }
                                size={17}
                            />
                        </button>

                        <button
                            type="button"
                            className={
                                hedefAyarlariAcik
                                    ? "aktif"
                                    : ""
                            }
                            onClick={() =>
                                setHedefAyarlariAcik(
                                    (mevcut) =>
                                        !mevcut,
                                )
                            }
                            aria-label="Kalori hedeflerini ayarla"
                        >
                            <Settings2
                                size={17}
                            />
                        </button>
                    </div>
                </div>

                <div className="kalori-ana-ozet">
                    <div
                        className="kalori-halka"
                        style={{
                            "--kalori-yuzdesi":
                                `${yuzdeSinirla(
                                    yuzdeler.kalori,
                                )}%`,
                        }}
                    >
                        <div>
                            <strong>
                                %
                                {yuzdeSinirla(
                                    yuzdeler.kalori,
                                )}
                            </strong>

                            <span>
                                tamamlandı
                            </span>
                        </div>
                    </div>

                    <div className="kalori-ana-deger">
                        <span>
                            Bugünkü toplam
                        </span>

                        <div>
                            <strong>
                                {sayiyiFormatla(
                                    toplam.kalori,
                                )}
                            </strong>

                            <small>
                                /{" "}
                                {sayiyiFormatla(
                                    hedef
                                        .gunlukKaloriHedefi,
                                )}{" "}
                                kcal
                            </small>
                        </div>

                        <p>
                            {durumMetni.baslik}
                        </p>

                        <small>
                            {
                                durumMetni.aciklama
                            }
                        </small>
                    </div>
                </div>

                <div className="kalori-makro-grid">
                    <article>
                        <span className="kalori-makro-ikon kalori-makro-ikon--protein">
                            <Beef
                                size={18}
                            />
                        </span>

                        <div>
                            <span>
                                Protein
                            </span>

                            <strong>
                                {sayiyiFormatla(
                                    toplam.protein,
                                    1,
                                )}
                                <small>
                                    {" "}
                                    /{" "}
                                    {sayiyiFormatla(
                                        hedef
                                            .proteinHedefi,
                                        0,
                                    )}{" "}
                                    g
                                </small>
                            </strong>

                            <div>
                                <i
                                    style={{
                                        width:
                                            `${yuzdeSinirla(
                                                yuzdeler.protein,
                                            )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </article>

                    <article>
                        <span className="kalori-makro-ikon kalori-makro-ikon--karbonhidrat">
                            <Wheat
                                size={18}
                            />
                        </span>

                        <div>
                            <span>
                                Karbonhidrat
                            </span>

                            <strong>
                                {sayiyiFormatla(
                                    toplam.karbonhidrat,
                                    1,
                                )}
                                <small>
                                    {" "}
                                    /{" "}
                                    {sayiyiFormatla(
                                        hedef
                                            .karbonhidratHedefi,
                                        0,
                                    )}{" "}
                                    g
                                </small>
                            </strong>

                            <div>
                                <i
                                    style={{
                                        width:
                                            `${yuzdeSinirla(
                                                yuzdeler.karbonhidrat,
                                            )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </article>

                    <article>
                        <span className="kalori-makro-ikon kalori-makro-ikon--yag">
                            <Carrot
                                size={18}
                            />
                        </span>

                        <div>
                            <span>
                                Yağ
                            </span>

                            <strong>
                                {sayiyiFormatla(
                                    toplam.yag,
                                    1,
                                )}
                                <small>
                                    {" "}
                                    /{" "}
                                    {sayiyiFormatla(
                                        hedef
                                            .yagHedefi,
                                        0,
                                    )}{" "}
                                    g
                                </small>
                            </strong>

                            <div>
                                <i
                                    style={{
                                        width:
                                            `${yuzdeSinirla(
                                                yuzdeler.yag,
                                            )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </article>
                </div>

                {hedefAyarlariAcik && (
                    <div className="kalori-hedef-formu">
                        <div className="kalori-hedef-form-baslik">
                            <div>
                                <span>
                                    Günlük hedefler
                                </span>

                                <strong>
                                    Kalori ve makro ayarları
                                </strong>
                            </div>
                        </div>

                        <div className="kalori-hedef-form-grid">
                            <label>
                                <span>
                                    Kalori
                                </span>

                                <input
                                    type="number"
                                    min="500"
                                    max="10000"
                                    value={
                                        hedefFormu.kalori
                                    }
                                    onChange={(event) =>
                                        hedefAlaniDegistir(
                                            "kalori",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Protein
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        hedefFormu.protein
                                    }
                                    onChange={(event) =>
                                        hedefAlaniDegistir(
                                            "protein",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Karbonhidrat
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        hedefFormu
                                            .karbonhidrat
                                    }
                                    onChange={(event) =>
                                        hedefAlaniDegistir(
                                            "karbonhidrat",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Yağ
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        hedefFormu.yag
                                    }
                                    onChange={(event) =>
                                        hedefAlaniDegistir(
                                            "yag",
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={
                                hedefleriKaydet
                            }
                            disabled={
                                kaydediliyor
                            }
                        >
                            {kaydediliyor ? (
                                <>
                                    <LoaderCircle
                                        className="donen-ikon"
                                        size={17}
                                    />

                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Settings2
                                        size={17}
                                    />

                                    Hedefleri Kaydet
                                </>
                            )}
                        </button>
                    </div>
                )}
            </section>

            <YemekFotografiAnalizPaneli
                baslangicAnalizi={
                    baslangicAnalizi
                }
                onBaslangicAnaliziKullanildi={
                    onBaslangicAnaliziKullanildi
                }
                onKaydedildi={() =>
                    verileriYukle(
                        true,
                    )
                }
            />
            <section className="kalori-koc-karti">
                <div className="kalori-koc-baslik">
                    <span>
                        Günlük yorum
                    </span>

                    <h2>
                        Miço & Vicky Ne Diyor?
                    </h2>
                </div>

                <div className="kalori-koc-mesajlari">
                    <article>
                        <span>
                            😼
                        </span>

                        <div>
                            <strong>
                                Miço
                            </strong>

                            <p>
                                {karakterMesajlari.mico}
                            </p>
                        </div>
                    </article>

                    <article>
                        <span>
                            🐶
                        </span>

                        <div>
                            <strong>
                                Vicky
                            </strong>

                            <p>
                                {karakterMesajlari.vicky}
                            </p>
                        </div>
                    </article>
                </div>
            </section>

            <section className="kalori-haftalik-karti">
                <div className="kalori-haftalik-baslik">
                    <div>
                        <span>
                            Son 7 gün
                        </span>

                        <h2>
                            Kalori Karşılaştırması
                        </h2>
                    </div>

                    <strong>
                        Ortalama{" "}
                        {sayiyiFormatla(
                            haftalikOzet
                                ?.ortalamaKalori,
                        )}{" "}
                        kcal
                    </strong>
                </div>

                {haftalikGunler.length > 0 ? (
                    <div className="kalori-haftalik-grafik">
                        {haftalikGunler.map(
                            (gun) => {
                                const gunKalorisi =
                                    Number(
                                        gun?.kalori,
                                    ) || 0;

                                const yukseklik =
                                    Math.max(
                                        (
                                            gunKalorisi /
                                            haftalikMaksimumKalori
                                        ) * 100,

                                        Number(
                                            gun?.kayitSayisi,
                                        ) > 0
                                            ? 8
                                            : 2,
                                    );

                                return (
                                    <article
                                        key={
                                            gun.tarih
                                        }
                                    >
                                        <span>
                                            {sayiyiFormatla(
                                                gunKalorisi,
                                            )}
                                        </span>

                                        <div>
                                            <i
                                                style={{
                                                    height:
                                                        `${yukseklik}%`,
                                                }}
                                            />
                                        </div>

                                        <small>
                                            {gunEtiketiniGetir(
                                                gun.tarih,
                                            )}
                                        </small>
                                    </article>
                                );
                            },
                        )}
                    </div>
                ) : (
                    <div className="kalori-haftalik-bos">
                        <Flame
                            size={22}
                        />

                        <div>
                            <strong>
                                Henüz karşılaştırma verisi yok
                            </strong>

                            <span>
                                Yemek kayıtları eklendikçe son yedi gün burada karşılaştırılacak.
                            </span>
                        </div>
                    </div>
                )}
            </section>

            <section className="kalori-kayitlari-karti">
                <div className="kalori-kayitlari-baslik">
                    <div>
                        <span>
                            Günlük kayıtlar
                        </span>

                        <h2>
                            Bugün Yediklerin
                        </h2>
                    </div>

                    <strong>
                        {kayitlar.length} kayıt
                    </strong>
                </div>

                {kayitlar.length > 0 ? (
                    <div className="kalori-kayit-listesi">
                        {kayitlar.map(
                            (kayit) => (
                                <article
                                    key={
                                        kayit.id
                                    }
                                    className="kalori-kayit-karti"
                                >
                                    <span className="kalori-kayit-fotograf">
                                        {kayit
                                            .fotograf_url ? (
                                            <img
                                                src={
                                                    kayit
                                                        .fotograf_url
                                                }
                                                alt={
                                                    kayit
                                                        .yemek_adi
                                                }
                                            />
                                        ) : (
                                            <Camera
                                                size={
                                                    19
                                                }
                                            />
                                        )}
                                    </span>

                                    <div className="kalori-kayit-icerik">
                                        <div>
                                            <strong>
                                                {
                                                    kayit.yemek_adi
                                                }
                                            </strong>

                                            <span>
                                                {ogunEtiketiniGetir(
                                                    kayit.ogun_turu,
                                                )}
                                                {" · "}
                                                {saatMetniniGetir(
                                                    kayit.saat,
                                                )}
                                            </span>
                                        </div>

                                        <small>
                                            {kayit
                                                .porsiyon_aciklamasi ||
                                                "Porsiyon bilgisi yok"}
                                        </small>

                                        <div className="kalori-kayit-makrolar">
                                            <span>
                                                {sayiyiFormatla(
                                                    kayit.kalori,
                                                )}{" "}
                                                kcal
                                            </span>

                                            <span>
                                                P{" "}
                                                {sayiyiFormatla(
                                                    kayit.protein,
                                                    1,
                                                )}
                                            </span>

                                            <span>
                                                K{" "}
                                                {sayiyiFormatla(
                                                    kayit.karbonhidrat,
                                                    1,
                                                )}
                                            </span>

                                            <span>
                                                Y{" "}
                                                {sayiyiFormatla(
                                                    kayit.yag,
                                                    1,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="kalori-kayit-sil"
                                        onClick={() =>
                                            kaydiSil(
                                                kayit.id,
                                            )
                                        }
                                        disabled={
                                            silinenKayitId ===
                                            kayit.id
                                        }
                                        aria-label={`${kayit.yemek_adi} kaydını sil`}
                                    >
                                        {silinenKayitId ===
                                            kayit.id ? (
                                            <LoaderCircle
                                                className="donen-ikon"
                                                size={
                                                    16
                                                }
                                            />
                                        ) : (
                                            <Trash2
                                                size={
                                                    16
                                                }
                                            />
                                        )}
                                    </button>
                                </article>
                            ),
                        )}
                    </div>
                ) : (
                    <div className="kalori-kayit-bos">
                        <Flame
                            size={25}
                        />

                        <div>
                            <strong>
                                Bugün henüz yemek kaydı yok
                            </strong>

                            <span>
                                Yemeğinin fotoğrafını çekerek ilk kalori kaydını oluştur.
                            </span>
                        </div>
                    </div>
                )}
            </section>

            {mesaj && (
                <div className="kalori-panel-mesaj kalori-panel-mesaj--basarili">
                    {mesaj}
                </div>
            )}

            {hata && (
                <div className="kalori-panel-mesaj kalori-panel-mesaj--hata">
                    {hata}
                </div>
            )}
        </div>
    );
}