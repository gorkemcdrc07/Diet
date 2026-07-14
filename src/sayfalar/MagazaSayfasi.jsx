import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Check,
    Coins,
    Heart,
    PackageOpen,
    PawPrint,
    ShoppingBag,
    Sparkles,
} from "lucide-react";

import {
    envanteriGetir,
    magazaUrunleriniGetir,
    magazaUrunuSatinAl,
} from "../servisler/magazaServisi";

import {
    coinOzetiniGetir,
} from "../servisler/coinServisi";

import "./MagazaSayfasi.css";

const KATEGORILER = [
    {
        id: "tumu",
        etiket: "Tümü",
        ikon: ShoppingBag,
    },
    {
        id: "romantik",
        etiket: "Romantik",
        ikon: Heart,
    },
    {
        id: "mico",
        etiket: "Miço",
        ikon: PawPrint,
    },
    {
        id: "viki",
        etiket: "Viki",
        ikon: PawPrint,
    },
    {
        id: "efekt",
        etiket: "Efekt",
        ikon: Sparkles,
    },
    {
        id: "tema",
        etiket: "Tema",
        ikon: PackageOpen,
    },
];

function urunKategoriyeUyuyorMu(
    urun,
    seciliKategori,
) {
    if (seciliKategori === "tumu") {
        return true;
    }

    if (seciliKategori === "mico") {
        return urun.karakter === "mico";
    }

    if (seciliKategori === "viki") {
        return urun.karakter === "viki";
    }

    return urun.kategori === seciliKategori;
}

function nadirlikEtiketiGetir(
    nadirlik,
) {
    switch (nadirlik) {
        case "efsanevi":
            return "Efsanevi";

        case "epik":
            return "Epik";

        case "nadir":
            return "Nadir";

        default:
            return "Normal";
    }
}

export default function MagazaSayfasi() {
    const [
        urunler,
        setUrunler,
    ] = useState([]);

    const [
        envanter,
        setEnvanter,
    ] = useState([]);

    const [
        coinOzeti,
        setCoinOzeti,
    ] = useState(null);

    const [
        seciliKategori,
        setSeciliKategori,
    ] = useState("tumu");

    const [
        yukleniyor,
        setYukleniyor,
    ] = useState(true);

    const [
        hata,
        setHata,
    ] = useState("");

    const [
        satinAlinanUrun,
        setSatinAlinanUrun,
    ] = useState(null);

    const [
        satinAlinanUrunId,
        setSatinAlinanUrunId,
    ] = useState(null);

    async function verileriYukle() {
        setYukleniyor(true);
        setHata("");

        try {
            const [
                urunVerisi,
                envanterVerisi,
                coinVerisi,
            ] = await Promise.all([
                magazaUrunleriniGetir(),
                envanteriGetir(),
                coinOzetiniGetir(),
            ]);

            setUrunler(
                Array.isArray(urunVerisi)
                    ? urunVerisi
                    : [],
            );

            setEnvanter(
                Array.isArray(envanterVerisi)
                    ? envanterVerisi
                    : [],
            );

            setCoinOzeti(
                coinVerisi,
            );
        } catch (error) {
            console.error(
                "Mağaza verileri yüklenemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Mağaza yüklenemedi.",
            );
        } finally {
            setYukleniyor(false);
        }
    }

    useEffect(() => {
        verileriYukle();
    }, []);

    const satinAlinanUrunIdleri =
        useMemo(() => {
            return new Set(
                envanter
                    .map(
                        (kayit) =>
                            kayit?.urun?.id,
                    )
                    .filter(Boolean),
            );
        }, [envanter]);

    const filtrelenmisUrunler =
        useMemo(() => {
            return urunler.filter(
                (urun) =>
                    urunKategoriyeUyuyorMu(
                        urun,
                        seciliKategori,
                    ),
            );
        }, [
            urunler,
            seciliKategori,
        ]);

    async function urunuSatinAl(
        urun,
    ) {
        if (!urun?.id) {
            return;
        }

        setSatinAlinanUrunId(
            urun.id,
        );

        setHata("");

        try {
            const sonuc =
                await magazaUrunuSatinAl(
                    urun.id,
                );

            if (
                sonuc?.tekrar
            ) {
                setHata(
                    "Bu ürün zaten envanterinde.",
                );

                return;
            }

            setSatinAlinanUrun(
                sonuc?.urun ||
                urun,
            );

            const [
                yeniEnvanter,
                yeniCoinOzeti,
            ] = await Promise.all([
                envanteriGetir(),
                coinOzetiniGetir(),
            ]);

            setEnvanter(
                Array.isArray(
                    yeniEnvanter,
                )
                    ? yeniEnvanter
                    : [],
            );

            setCoinOzeti(
                yeniCoinOzeti,
            );
        } catch (error) {
            console.error(
                "Satın alma işlemi başarısız:",
                error,
            );

            setHata(
                error?.message ||
                "Ürün satın alınamadı.",
            );
        } finally {
            setSatinAlinanUrunId(
                null,
            );
        }
    }

    return (
        <div className="magaza-sayfasi">
            <section className="magaza-hero">
                <div>
                    <span className="magaza-mini-baslik">
                        Miço, Viki ve senin için
                    </span>

                    <h1>Ödül Mağazası</h1>

                    <p>
                        Günlük hedeflerini tamamla,
                        coin biriktir ve özel
                        ödülleri aç.
                    </p>
                </div>

                <div className="magaza-coin-karti">
                    <Coins size={22} />

                    <div>
                        <strong>
                            {coinOzeti?.mevcut_coin || 0}
                        </strong>

                        <span>Coin</span>
                    </div>
                </div>
            </section>

            <section className="magaza-kategoriler">
                {KATEGORILER.map(
                    (kategori) => {
                        const Icon =
                            kategori.ikon;

                        const aktif =
                            seciliKategori ===
                            kategori.id;

                        return (
                            <button
                                key={
                                    kategori.id
                                }
                                type="button"
                                className={
                                    aktif
                                        ? "aktif"
                                        : ""
                                }
                                onClick={() =>
                                    setSeciliKategori(
                                        kategori.id,
                                    )
                                }
                            >
                                <Icon
                                    size={17}
                                />

                                <span>
                                    {
                                        kategori.etiket
                                    }
                                </span>
                            </button>
                        );
                    },
                )}
            </section>

            {hata && (
                <section className="magaza-hata">
                    {hata}
                </section>
            )}

            {yukleniyor ? (
                <section className="magaza-yukleniyor">
                    <span />

                    <strong>
                        Mağaza hazırlanıyor...
                    </strong>
                </section>
            ) : (
                <section className="magaza-urun-grid">
                    {filtrelenmisUrunler.map(
                        (urun) => {
                            const satinAlindi =
                                satinAlinanUrunIdleri.has(
                                    urun.id,
                                );

                            const islemde =
                                satinAlinanUrunId ===
                                urun.id;

                            const yetersizCoin =
                                Number(
                                    coinOzeti?.mevcut_coin,
                                ) <
                                Number(
                                    urun.fiyat,
                                );

                            return (
                                <article
                                    key={
                                        urun.id
                                    }
                                    className={[
                                        "magaza-urun-karti",
                                        `magaza-urun-karti--${urun.nadirlik}`,
                                    ].join(
                                        " ",
                                    )}
                                >
                                    <div className="magaza-urun-ust">
                                        <span className="magaza-urun-ikon">
                                            {urun.ikon ||
                                                "🎁"}
                                        </span>

                                        <span className="magaza-nadirlik">
                                            {nadirlikEtiketiGetir(
                                                urun.nadirlik,
                                            )}
                                        </span>
                                    </div>

                                    <div className="magaza-urun-icerik">
                                        <span className="magaza-urun-kategori">
                                            {
                                                urun.kategori
                                            }
                                        </span>

                                        <h2>
                                            {
                                                urun.ad
                                            }
                                        </h2>

                                        <p>
                                            {
                                                urun.aciklama
                                            }
                                        </p>
                                    </div>

                                    <div className="magaza-urun-alt">
                                        <div className="magaza-fiyat">
                                            <Coins
                                                size={
                                                    17
                                                }
                                            />

                                            <strong>
                                                {
                                                    urun.fiyat
                                                }
                                            </strong>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={
                                                satinAlindi ||
                                                islemde ||
                                                yetersizCoin
                                            }
                                            onClick={() =>
                                                urunuSatinAl(
                                                    urun,
                                                )
                                            }
                                        >
                                            {satinAlindi ? (
                                                <>
                                                    <Check
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    Envanterde
                                                </>
                                            ) : islemde ? (
                                                "Alınıyor..."
                                            ) : yetersizCoin ? (
                                                "Coin Yetersiz"
                                            ) : (
                                                "Satın Al"
                                            )}
                                        </button>
                                    </div>
                                </article>
                            );
                        },
                    )}
                </section>
            )}

            {satinAlinanUrun && (
                <div className="magaza-kutlama-katmani">
                    <section className="magaza-kutlama-karti">
                        <div className="magaza-kutlama-ikon">
                            {satinAlinanUrun.ikon ||
                                "🎁"}
                        </div>

                        <span>
                            Satın alma tamamlandı
                        </span>

                        <h2>
                            {
                                satinAlinanUrun.ad
                            }
                        </h2>

                        <p>
                            Ürün envanterine
                            eklendi.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSatinAlinanUrun(
                                    null,
                                )
                            }
                        >
                            Harika
                        </button>
                    </section>
                </div>
            )}
        </div>
    );
}