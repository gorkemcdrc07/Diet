import {
    Camera,
    Check,
    ChevronDown,
    ChevronUp,
    ImagePlus,
    LoaderCircle,
    RefreshCw,
    Save,
    Sparkles,
    Trash2,
    Utensils,
    X,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    yemekFotografiniAnalizEt,
} from "../servisler/yemekFotografiServisi";

import {
    yemekKaydiEkle,
} from "../servisler/kaloriServisi";

import {
    yemekFotografiniSil,
    yemekFotografiniYukle,
} from "../servisler/yemekFotografiYuklemeServisi";

import "./YemekFotografiAnalizPaneli.css";

const OGUN_SECENEKLERI = [
    {
        value: "kahvalti",
        label: "Kahvaltı",
    },
    {
        value: "ara-ogun",
        label: "Ara Öğün",
    },
    {
        value: "ogle",
        label: "Öğle Yemeği",
    },
    {
        value: "aksam",
        label: "Akşam Yemeği",
    },
    {
        value: "gece",
        label: "Gece Öğünü",
    },
    {
        value: "diger",
        label: "Diğer",
    },
];

function sayiyaCevir(
    deger,
    varsayilan = 0,
) {
    const sayi = Number(
        String(
            deger ?? "",
        ).replace(",", "."),
    );

    return Number.isFinite(sayi)
        ? sayi
        : varsayilan;
}

function sayiyiYuvarla(
    deger,
    basamak = 1,
) {
    const sayi =
        sayiyaCevir(deger);

    return Number(
        sayi.toFixed(
            basamak,
        ),
    );
}

function dosyaGecerliMi(dosya) {
    if (!dosya) {
        return false;
    }

    const gecerliTipler = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
    ];

    if (
        dosya.type &&
        !gecerliTipler.includes(
            dosya.type,
        )
    ) {
        return false;
    }

    const maksimumBoyut =
        8 * 1024 * 1024;

    return dosya.size <= maksimumBoyut;
}

function analizYemeginiNormalizeEt(
    yemek,
    index,
) {
    return {
        geciciId:
            `${Date.now()}-${index}`,

        ad:
            String(
                yemek?.ad ||
                `Yemek ${index + 1}`,
            ),

        tahmini_gram:
            sayiyiYuvarla(
                yemek?.tahmini_gram,
            ),

        kalori:
            sayiyiYuvarla(
                yemek?.kalori,
            ),

        protein:
            sayiyiYuvarla(
                yemek?.protein,
            ),

        karbonhidrat:
            sayiyiYuvarla(
                yemek?.karbonhidrat,
            ),

        yag:
            sayiyiYuvarla(
                yemek?.yag,
            ),

        guven:
            Math.min(
                Math.max(
                    sayiyaCevir(
                        yemek?.guven,
                    ),
                    0,
                ),
                1,
            ),

        acik:
            index === 0,
    };
}
function programOgunTurunuGetir(
    baslangicAnalizi,
) {
    const hamTur =
        baslangicAnalizi?.ogun
            ?.ogunTuru ||
        baslangicAnalizi?.ogun
            ?.ogun_turu ||
        baslangicAnalizi?.ogun
            ?.tur ||
        "";

    const temizTur =
        String(hamTur)
            .trim()
            .toLocaleLowerCase(
                "tr-TR",
            );

    const eslesmeler = {
        kahvalti: "kahvalti",
        kahvaltı: "kahvalti",
        "ara-ogun": "ara-ogun",
        "ara öğün": "ara-ogun",
        araogun: "ara-ogun",
        ogle: "ogle",
        öğle: "ogle",
        "öğle yemeği": "ogle",
        aksam: "aksam",
        akşam: "aksam",
        "akşam yemeği": "aksam",
        gece: "gece",
        "gece öğünü": "gece",
        diger: "diger",
        diğer: "diger",
    };

    return (
        eslesmeler[temizTur] ||
        "diger"
    );
}

export default function YemekFotografiAnalizPaneli({
    varsayilanOgunTuru = "diger",
    baslangicAnalizi = null,
    onBaslangicAnaliziKullanildi,
    onKaydedildi,
}) {
    const kameraInputRef =
        useRef(null);

    const galeriInputRef =
        useRef(null);

    const [
        fotograf,
        setFotograf,
    ] = useState(null);

    const [
        fotografOnizleme,
        setFotografOnizleme,
    ] = useState("");

    const [
        ogunTuru,
        setOgunTuru,
    ] = useState(
        varsayilanOgunTuru,
    );

    const [
        aciklama,
        setAciklama,
    ] = useState("");

    const [
        analizEdiliyor,
        setAnalizEdiliyor,
    ] = useState(false);

    const [
        kaydediliyor,
        setKaydediliyor,
    ] = useState(false);

    const [
        analiz,
        setAnaliz,
    ] = useState(null);

    const [
        yemekler,
        setYemekler,
    ] = useState([]);

    const [
        hata,
        setHata,
    ] = useState("");

    const [
        mesaj,
        setMesaj,
    ] = useState("");

    useEffect(() => {
        setOgunTuru(
            varsayilanOgunTuru ||
            "diger",
        );
    }, [
        varsayilanOgunTuru,
    ]);
    useEffect(() => {
        const gelenFotograf =
            baslangicAnalizi?.fotograf;

        if (
            !gelenFotograf ||
            !(gelenFotograf instanceof File)
        ) {
            return;
        }

        if (
            !dosyaGecerliMi(
                gelenFotograf,
            )
        ) {
            setHata(
                "Program ekranından gelen fotoğraf geçersiz veya 8 MB'tan büyük.",
            );

            onBaslangicAnaliziKullanildi?.();

            return;
        }

        if (fotografOnizleme) {
            URL.revokeObjectURL(
                fotografOnizleme,
            );
        }

        const yeniOnizleme =
            URL.createObjectURL(
                gelenFotograf,
            );

        setFotograf(
            gelenFotograf,
        );

        setFotografOnizleme(
            yeniOnizleme,
        );

        setOgunTuru(
            programOgunTurunuGetir(
                baslangicAnalizi,
            ),
        );

        setAciklama(
            String(
                baslangicAnalizi
                    ?.notMetni ||
                baslangicAnalizi?.ogun
                    ?.kisaBaslik ||
                baslangicAnalizi?.ogun
                    ?.baslik ||
                "",
            ).trim(),
        );

        setAnaliz(null);
        setYemekler([]);
        setHata("");
        setMesaj("");

        onBaslangicAnaliziKullanildi?.();
    }, [
        baslangicAnalizi,
        onBaslangicAnaliziKullanildi,
    ]);

    useEffect(() => {
        return () => {
            if (
                fotografOnizleme
            ) {
                URL.revokeObjectURL(
                    fotografOnizleme,
                );
            }
        };
    }, [
        fotografOnizleme,
    ]);

    const toplamlar =
        useMemo(() => {
            return yemekler.reduce(
                (
                    toplam,
                    yemek,
                ) => {
                    toplam.kalori +=
                        sayiyaCevir(
                            yemek.kalori,
                        );

                    toplam.protein +=
                        sayiyaCevir(
                            yemek.protein,
                        );

                    toplam.karbonhidrat +=
                        sayiyaCevir(
                            yemek.karbonhidrat,
                        );

                    toplam.yag +=
                        sayiyaCevir(
                            yemek.yag,
                        );

                    return toplam;
                },
                {
                    kalori: 0,
                    protein: 0,
                    karbonhidrat: 0,
                    yag: 0,
                },
            );
        }, [
            yemekler,
        ]);

    function fotografSecildi(
        event,
    ) {
        const dosya =
            event.target.files?.[0];

        event.target.value = "";

        if (!dosya) {
            return;
        }

        if (
            !dosyaGecerliMi(
                dosya,
            )
        ) {
            setHata(
                "Fotoğraf JPG, PNG veya WEBP olmalı ve 8 MB'tan küçük olmalıdır.",
            );

            return;
        }

        if (
            fotografOnizleme
        ) {
            URL.revokeObjectURL(
                fotografOnizleme,
            );
        }

        const yeniOnizleme =
            URL.createObjectURL(
                dosya,
            );

        setFotograf(dosya);

        setFotografOnizleme(
            yeniOnizleme,
        );

        setAnaliz(null);
        setYemekler([]);
        setHata("");
        setMesaj("");
    }

    function fotografiTemizle() {
        if (
            fotografOnizleme
        ) {
            URL.revokeObjectURL(
                fotografOnizleme,
            );
        }

        setFotograf(null);
        setFotografOnizleme("");
        setAnaliz(null);
        setYemekler([]);
        setHata("");
        setMesaj("");
    }

    async function fotografiAnalizEt() {
        if (!fotograf) {
            setHata(
                "Önce bir yemek fotoğrafı çek veya galeriden seç.",
            );

            return;
        }

        setAnalizEdiliyor(true);
        setHata("");
        setMesaj("");

        try {
            const sonuc =
                await yemekFotografiniAnalizEt({
                    fotograf,
                    ogunTuru,
                    aciklama,
                });

            if (
                sonuc?.yemek_var ===
                false
            ) {
                setAnaliz(
                    sonuc,
                );

                setYemekler([]);

                setHata(
                    sonuc?.aciklama ||
                    "Fotoğrafta analiz edilebilir bir yemek bulunamadı.",
                );

                return;
            }

            const normalizeYemekler =
                Array.isArray(
                    sonuc?.yemekler,
                )
                    ? sonuc.yemekler.map(
                        analizYemeginiNormalizeEt,
                    )
                    : [];

            setAnaliz(
                sonuc,
            );

            setYemekler(
                normalizeYemekler,
            );

            if (
                normalizeYemekler.length ===
                0
            ) {
                setHata(
                    "Fotoğraftaki yemekler tespit edilemedi. Daha net bir fotoğraf dene.",
                );

                return;
            }

            setMesaj(
                "Analiz tamamlandı. Kaydetmeden önce porsiyonları ve değerleri kontrol et.",
            );
        } catch (error) {
            console.error(
                "Fotoğraf analiz hatası:",
                error,
            );

            setHata(
                error?.message ||
                "Fotoğraf analiz edilemedi.",
            );
        } finally {
            setAnalizEdiliyor(false);
        }
    }

    function yemekAlaniniDegistir(
        geciciId,
        alan,
        deger,
    ) {
        setYemekler(
            (mevcut) =>
                mevcut.map(
                    (yemek) =>
                        yemek.geciciId ===
                            geciciId
                            ? {
                                ...yemek,
                                [alan]:
                                    deger,
                            }
                            : yemek,
                ),
        );

        setMesaj("");
        setHata("");
    }

    function yemekDetayiniAcKapat(
        geciciId,
    ) {
        setYemekler(
            (mevcut) =>
                mevcut.map(
                    (yemek) =>
                        yemek.geciciId ===
                            geciciId
                            ? {
                                ...yemek,
                                acik:
                                    !yemek.acik,
                            }
                            : yemek,
                ),
        );
    }

    function yemegiListedenSil(
        geciciId,
    ) {
        setYemekler(
            (mevcut) =>
                mevcut.filter(
                    (yemek) =>
                        yemek.geciciId !==
                        geciciId,
                ),
        );
    }

    async function analiziKaydet() {
        if (yemekler.length === 0) {
            setHata(
                "Kaydedilecek yemek bulunamadı.",
            );

            return;
        }

        if (!fotograf) {
            setHata(
                "Kaydedilecek fotoğraf bulunamadı.",
            );

            return;
        }

        const gecersizKayit =
            yemekler.some(
                (yemek) =>
                    !String(
                        yemek.ad || "",
                    ).trim() ||
                    sayiyaCevir(
                        yemek.kalori,
                    ) < 0 ||
                    sayiyaCevir(
                        yemek.protein,
                    ) < 0 ||
                    sayiyaCevir(
                        yemek.karbonhidrat,
                    ) < 0 ||
                    sayiyaCevir(
                        yemek.yag,
                    ) < 0,
            );

        if (gecersizKayit) {
            setHata(
                "Yemek adlarını, kaloriyi ve makro değerlerini kontrol et.",
            );

            return;
        }

        setKaydediliyor(true);
        setHata("");
        setMesaj("");

        let fotografDosyaYolu = null;
        const kaydedilenler = [];

        try {
            const fotografSonucu =
                await yemekFotografiniYukle(
                    fotograf,
                );

            const fotografUrl =
                fotografSonucu.publicUrl;

            fotografDosyaYolu =
                fotografSonucu.dosyaYolu;

            for (const yemek of yemekler) {
                const kayit =
                    await yemekKaydiEkle({
                        ogunTuru,

                        yemekAdi:
                            String(
                                yemek.ad,
                            ).trim(),

                        porsiyonAciklamasi:
                            sayiyaCevir(
                                yemek.tahmini_gram,
                            ) > 0
                                ? `${sayiyiYuvarla(
                                    yemek.tahmini_gram,
                                )} gram`
                                : "Tahmini porsiyon",

                        kalori:
                            sayiyiYuvarla(
                                yemek.kalori,
                            ),

                        protein:
                            sayiyiYuvarla(
                                yemek.protein,
                            ),

                        karbonhidrat:
                            sayiyiYuvarla(
                                yemek.karbonhidrat,
                            ),

                        yag:
                            sayiyiYuvarla(
                                yemek.yag,
                            ),

                        fotografUrl,
                        fotografDosyaYolu,

                        kayitTuru:
                            "fotograf",

                        aiTahmini:
                            true,

                        aiGuvenOrani:
                            sayiyiYuvarla(
                                sayiyaCevir(
                                    yemek.guven,
                                ) * 100,
                            ),

                        kullaniciOnayladi:
                            true,

                        notMetni:
                            aciklama ||
                            analiz?.aciklama ||
                            null,
                    });

                kaydedilenler.push(
                    kayit,
                );
            }

            setMesaj(
                `${kaydedilenler.length} yemek günlük kalori kaydına eklendi.`,
            );

            onKaydedildi?.(
                kaydedilenler,
            );

            window.setTimeout(
                () => {
                    fotografiTemizle();
                    setAciklama("");
                },
                1400,
            );
        } catch (error) {
            console.error(
                "Yemek kaydı oluşturulamadı:",
                error,
            );

            if (
                kaydedilenler.length === 0 &&
                fotografDosyaYolu
            ) {
                try {
                    await yemekFotografiniSil(
                        fotografDosyaYolu,
                    );
                } catch (
                rollbackError
                ) {
                    console.warn(
                        "Başarısız kayıt sonrası fotoğraf silinemedi:",
                        rollbackError,
                    );
                }
            }

            setHata(
                error?.message ||
                "Yemekler kaydedilemedi.",
            );
        } finally {
            setKaydediliyor(false);
        }
    }
    return (
        <section className="yemek-fotograf-paneli">
            <div className="yemek-fotograf-baslik">
                <div className="yemek-fotograf-baslik-sol">
                    <span className="yemek-fotograf-ikon">
                        <Sparkles
                            size={21}
                        />
                    </span>

                    <div>
                        <span>
                            Yapay zekâ analizi
                        </span>

                        <h2>
                            Fotoğraftan Kalori Ölç
                        </h2>

                        <p>
                            Yemeğinin fotoğrafını çek,
                            Miço içeriği ve yaklaşık
                            kaloriyi analiz etsin.
                        </p>
                    </div>
                </div>

                {fotograf && (
                    <button
                        type="button"
                        className="yemek-fotograf-temizle"
                        onClick={
                            fotografiTemizle
                        }
                        aria-label="Fotoğrafı kaldır"
                    >
                        <X size={17} />
                    </button>
                )}
            </div>

            <div className="yemek-fotograf-form">
                <label>
                    <span>
                        Öğün türü
                    </span>

                    <select
                        value={ogunTuru}
                        onChange={(event) =>
                            setOgunTuru(
                                event.target
                                    .value,
                            )
                        }
                    >
                        {OGUN_SECENEKLERI.map(
                            (secenek) => (
                                <option
                                    key={
                                        secenek.value
                                    }
                                    value={
                                        secenek.value
                                    }
                                >
                                    {
                                        secenek.label
                                    }
                                </option>
                            ),
                        )}
                    </select>
                </label>

                <label>
                    <span>
                        Ek açıklama
                    </span>

                    <input
                        type="text"
                        value={aciklama}
                        onChange={(event) =>
                            setAciklama(
                                event.target
                                    .value,
                            )
                        }
                        placeholder="Örn. Tavuk yaklaşık 200 gram"
                    />
                </label>
            </div>

            {!fotografOnizleme ? (
                <div className="yemek-fotograf-secim-alani">
                    <div className="yemek-fotograf-secim-gorsel">
                        <Camera
                            size={32}
                        />
                    </div>

                    <strong>
                        Yemeğini fotoğraflandır
                    </strong>

                    <p>
                        Tabağın tamamı görünsün ve
                        ışık yeterli olsun.
                    </p>

                    <div className="yemek-fotograf-butonlari">
                        <button
                            type="button"
                            className="kamera-butonu"
                            onClick={() =>
                                kameraInputRef
                                    .current
                                    ?.click()
                            }
                        >
                            <Camera
                                size={18}
                            />

                            Fotoğraf Çek
                        </button>

                        <button
                            type="button"
                            className="galeri-butonu"
                            onClick={() =>
                                galeriInputRef
                                    .current
                                    ?.click()
                            }
                        >
                            <ImagePlus
                                size={18}
                            />

                            Galeriden Seç
                        </button>
                    </div>
                </div>
            ) : (
                <div className="yemek-fotograf-onizleme">
                    <img
                        src={
                            fotografOnizleme
                        }
                        alt="Analiz edilecek yemek"
                    />

                    <div className="yemek-fotograf-onizleme-alt">
                        <div>
                            <strong>
                                {fotograf?.name}
                            </strong>

                            <span>
                                {(
                                    fotograf.size /
                                    1024 /
                                    1024
                                ).toFixed(
                                    2,
                                )}{" "}
                                MB
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                galeriInputRef
                                    .current
                                    ?.click()
                            }
                        >
                            <RefreshCw
                                size={15}
                            />

                            Değiştir
                        </button>
                    </div>
                </div>
            )}

            <input
                ref={kameraInputRef}
                className="yemek-gizli-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={
                    fotografSecildi
                }
            />

            <input
                ref={galeriInputRef}
                className="yemek-gizli-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={
                    fotografSecildi
                }
            />

            {fotograf && (
                <button
                    type="button"
                    className="yemek-analiz-butonu"
                    onClick={
                        fotografiAnalizEt
                    }
                    disabled={
                        analizEdiliyor ||
                        kaydediliyor
                    }
                >
                    {analizEdiliyor ? (
                        <>
                            <LoaderCircle
                                className="donen-ikon"
                                size={19}
                            />

                            Miço fotoğrafı analiz
                            ediyor...
                        </>
                    ) : (
                        <>
                            <Sparkles
                                size={19}
                            />

                            Kaloriyi Analiz Et
                        </>
                    )}
                </button>
            )}

            {analizEdiliyor && (
                <div className="yemek-analiz-yukleniyor">
                    <div className="yemek-analiz-parilti">
                        😼
                    </div>

                    <div>
                        <strong>
                            Miço tabağı inceliyor
                        </strong>

                        <span>
                            Yiyecekler, porsiyonlar
                            ve makrolar tahmin
                            ediliyor.
                        </span>
                    </div>
                </div>
            )}

            {yemekler.length > 0 && (
                <div className="yemek-analiz-sonucu">
                    <div className="yemek-analiz-sonuc-baslik">
                        <div>
                            <span>
                                Analiz sonucu
                            </span>

                            <h3>
                                Tespit Edilen
                                Yiyecekler
                            </h3>
                        </div>

                        <strong>
                            {yemekler.length} ürün
                        </strong>
                    </div>

                    <div className="yemek-analiz-liste">
                        {yemekler.map(
                            (
                                yemek,
                                index,
                            ) => (
                                <article
                                    key={
                                        yemek.geciciId
                                    }
                                    className="yemek-analiz-karti"
                                >
                                    <button
                                        type="button"
                                        className="yemek-analiz-kart-ozet"
                                        onClick={() =>
                                            yemekDetayiniAcKapat(
                                                yemek.geciciId,
                                            )
                                        }
                                    >
                                        <span className="yemek-analiz-sira">
                                            {index +
                                                1}
                                        </span>

                                        <div>
                                            <strong>
                                                {
                                                    yemek.ad
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    yemek.tahmini_gram
                                                }{" "}
                                                g ·{" "}
                                                {
                                                    yemek.kalori
                                                }{" "}
                                                kcal
                                            </span>
                                        </div>

                                        <span className="yemek-guven">
                                            %
                                            {Math.round(
                                                yemek.guven *
                                                100,
                                            )}
                                        </span>

                                        {yemek.acik ? (
                                            <ChevronUp
                                                size={
                                                    17
                                                }
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={
                                                    17
                                                }
                                            />
                                        )}
                                    </button>

                                    {yemek.acik && (
                                        <div className="yemek-analiz-kart-detay">
                                            <label className="yemek-tam-genislik">
                                                <span>
                                                    Yemek
                                                    adı
                                                </span>

                                                <input
                                                    type="text"
                                                    value={
                                                        yemek.ad
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        yemekAlaniniDegistir(
                                                            yemek.geciciId,
                                                            "ad",
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <div className="yemek-analiz-grid">
                                                <label>
                                                    <span>
                                                        Gram
                                                    </span>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={
                                                            yemek.tahmini_gram
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            yemekAlaniniDegistir(
                                                                yemek.geciciId,
                                                                "tahmini_gram",
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label>
                                                    <span>
                                                        Kalori
                                                    </span>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={
                                                            yemek.kalori
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            yemekAlaniniDegistir(
                                                                yemek.geciciId,
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
                                                        step="0.1"
                                                        value={
                                                            yemek.protein
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            yemekAlaniniDegistir(
                                                                yemek.geciciId,
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
                                                        step="0.1"
                                                        value={
                                                            yemek.karbonhidrat
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            yemekAlaniniDegistir(
                                                                yemek.geciciId,
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
                                                        step="0.1"
                                                        value={
                                                            yemek.yag
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            yemekAlaniniDegistir(
                                                                yemek.geciciId,
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
                                                className="yemek-sil-butonu"
                                                onClick={() =>
                                                    yemegiListedenSil(
                                                        yemek.geciciId,
                                                    )
                                                }
                                            >
                                                <Trash2
                                                    size={
                                                        15
                                                    }
                                                />

                                                Bu
                                                ürünü
                                                kaldır
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ),
                        )}
                    </div>

                    <div className="yemek-toplam-karti">
                        <div className="yemek-toplam-ana">
                            <span>
                                Tahmini toplam
                            </span>

                            <strong>
                                {Math.round(
                                    toplamlar.kalori,
                                )}
                            </strong>

                            <small>
                                kcal
                            </small>
                        </div>

                        <div className="yemek-toplam-makrolar">
                            <span>
                                Protein
                                <strong>
                                    {sayiyiYuvarla(
                                        toplamlar.protein,
                                    )}{" "}
                                    g
                                </strong>
                            </span>

                            <span>
                                Karbonhidrat
                                <strong>
                                    {sayiyiYuvarla(
                                        toplamlar.karbonhidrat,
                                    )}{" "}
                                    g
                                </strong>
                            </span>

                            <span>
                                Yağ
                                <strong>
                                    {sayiyiYuvarla(
                                        toplamlar.yag,
                                    )}{" "}
                                    g
                                </strong>
                            </span>
                        </div>
                    </div>

                    <div className="yemek-analiz-uyari">
                        <Utensils
                            size={17}
                        />

                        <p>
                            Fotoğraftan yapılan
                            porsiyon ve kalori
                            hesapları yaklaşık
                            değerlerdir. Kaydetmeden
                            önce kontrol et.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="yemek-kaydet-butonu"
                        onClick={
                            analiziKaydet
                        }
                        disabled={
                            kaydediliyor
                        }
                    >
                        {kaydediliyor ? (
                            <>
                                <LoaderCircle
                                    className="donen-ikon"
                                    size={18}
                                />

                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save
                                    size={18}
                                />

                                Günlük Kaloriye
                                Kaydet
                            </>
                        )}
                    </button>
                </div>
            )}

            {mesaj && (
                <div className="yemek-panel-mesaj yemek-panel-mesaj--basarili">
                    <Check size={16} />
                    {mesaj}
                </div>
            )}

            {hata && (
                <div className="yemek-panel-mesaj yemek-panel-mesaj--hata">
                    <X size={16} />
                    {hata}
                </div>
            )}
        </section>
    );
}