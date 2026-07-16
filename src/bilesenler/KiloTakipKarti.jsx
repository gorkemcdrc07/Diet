import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    LoaderCircle,
    Save,
    Scale,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    gunlukKiloKaydet,
    kiloHedefiniKaydet,
    kiloOzetiniGetir,
} from "../servisler/kiloServisi";

import {
    kiloMotivasyonunuGetir,
} from "../servisler/kiloMotivasyonServisi";

import "./KiloTakipKarti.css";

function sayiyiFormatla(deger) {
    const sayi =
        Number(deger);

    if (!Number.isFinite(sayi)) {
        return "-";
    }

    return new Intl.NumberFormat(
        "tr-TR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        },
    ).format(sayi);
}

function degisimMetniGetir(deger) {
    const sayi =
        Number(deger);

    if (!Number.isFinite(sayi)) {
        return "Henüz karşılaştırma yok";
    }

    if (sayi === 0) {
        return "Değişim yok";
    }

    const isaret =
        sayi > 0
            ? "+"
            : "";

    return `${isaret}${sayiyiFormatla(sayi)} kg`;
}

export default function KiloTakipKarti() {
    const [
        kiloOzeti,
        setKiloOzeti,
    ] = useState(null);

    const [
        yukleniyor,
        setYukleniyor,
    ] = useState(true);

    const [
        kaydediliyor,
        setKaydediliyor,
    ] = useState(false);

    const [
        ayarlarAcik,
        setAyarlarAcik,
    ] = useState(false);

    const [
        kiloDegeri,
        setKiloDegeri,
    ] = useState("");

    const [
        baslangicKilosu,
        setBaslangicKilosu,
    ] = useState("");

    const [
        hedefKilo,
        setHedefKilo,
    ] = useState("");

    const [
        hedefTuru,
        setHedefTuru,
    ] = useState("kilo-al");

    const [
        mesaj,
        setMesaj,
    ] = useState("");

    const [
        hata,
        setHata,
    ] = useState("");

    async function verileriYukle() {
        setYukleniyor(true);
        setHata("");

        try {
            const ozet =
                await kiloOzetiniGetir();

            setKiloOzeti(
                ozet,
            );

            if (
                ozet?.bugunKaydi?.kilo
            ) {
                setKiloDegeri(
                    String(
                        ozet.bugunKaydi.kilo,
                    ),
                );
            } else if (
                ozet?.mevcutKilo
            ) {
                setKiloDegeri(
                    String(
                        ozet.mevcutKilo,
                    ),
                );
            }

            if (
                ozet?.baslangicKilosu
            ) {
                setBaslangicKilosu(
                    String(
                        ozet.baslangicKilosu,
                    ),
                );
            }

            if (
                ozet?.hedefKilo
            ) {
                setHedefKilo(
                    String(
                        ozet.hedefKilo,
                    ),
                );
            }

            if (
                ozet?.hedef
                    ?.hedef_turu
            ) {
                setHedefTuru(
                    ozet.hedef.hedef_turu,
                );
            }
        } catch (error) {
            console.error(
                "Kilo verileri alınamadı:",
                error,
            );

            setHata(
                error?.message ||
                "Kilo verileri alınamadı.",
            );
        } finally {
            setYukleniyor(false);
        }
    }

    useEffect(() => {
        verileriYukle();
    }, []);

    const motivasyon =
        useMemo(() => {
            return kiloMotivasyonunuGetir({
                hedefTuru:
                    kiloOzeti?.hedef
                        ?.hedef_turu ||
                    hedefTuru,

                gunlukDegisim:
                    kiloOzeti
                        ?.gunlukDegisim,

                haftalikDegisim:
                    kiloOzeti
                        ?.haftalikDegisim,

                hedefeKalan:
                    kiloOzeti
                        ?.hedefeKalan,
            });
        }, [
            kiloOzeti,
            hedefTuru,
        ]);

    async function gunlukKiloyuKaydet() {
        const guvenliKilo =
            Number(
                String(
                    kiloDegeri,
                ).replace(",", "."),
            );

        if (
            !Number.isFinite(
                guvenliKilo,
            ) ||
            guvenliKilo < 20 ||
            guvenliKilo > 300
        ) {
            setHata(
                "20 ile 300 kg arasında geçerli bir kilo gir.",
            );

            return;
        }

        setKaydediliyor(true);
        setMesaj("");
        setHata("");

        try {
            await gunlukKiloKaydet({
                kilo:
                    guvenliKilo,
            });

            await verileriYukle();

            setMesaj(
                "Bugünkü kilo kaydın güncellendi.",
            );
        } catch (error) {
            console.error(
                "Kilo kaydedilemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Kilo kaydedilemedi.",
            );
        } finally {
            setKaydediliyor(false);
        }
    }

    async function hedefiKaydet() {
        const guvenliBaslangic =
            Number(
                String(
                    baslangicKilosu,
                ).replace(",", "."),
            );

        const guvenliHedef =
            Number(
                String(
                    hedefKilo,
                ).replace(",", "."),
            );

        if (
            !Number.isFinite(
                guvenliBaslangic,
            ) ||
            !Number.isFinite(
                guvenliHedef,
            )
        ) {
            setHata(
                "Başlangıç ve hedef kilosunu doğru gir.",
            );

            return;
        }

        setKaydediliyor(true);
        setMesaj("");
        setHata("");

        try {
            await kiloHedefiniKaydet({
                baslangicKilosu:
                    guvenliBaslangic,

                hedefKilo:
                    guvenliHedef,

                hedefTuru,
            });

            await verileriYukle();

            setAyarlarAcik(false);

            setMesaj(
                "Kilo hedefin kaydedildi.",
            );
        } catch (error) {
            console.error(
                "Kilo hedefi kaydedilemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Kilo hedefi kaydedilemedi.",
            );
        } finally {
            setKaydediliyor(false);
        }
    }

    if (yukleniyor) {
        return (
            <section className="kilo-karti kilo-karti--yukleniyor">
                <LoaderCircle
                    className="donen-ikon"
                    size={24}
                />

                <span>
                    Kilo bilgileri hazırlanıyor...
                </span>
            </section>
        );
    }

    const haftalikDegisim =
        Number(
            kiloOzeti?.haftalikDegisim,
        );

    const HaftalikIcon =
        haftalikDegisim > 0
            ? TrendingUp
            : haftalikDegisim < 0
                ? TrendingDown
                : CheckCircle2;

    return (
        <section className="kilo-karti">
            <div className="kilo-karti-ust">
                <div className="kilo-baslik-alani">
                    <span className="kilo-ikon">
                        <Scale size={22} />
                    </span>

                    <div>
                        <span className="mini-baslik">
                            Günlük takip
                        </span>

                        <h2>
                            Kilo Takibi
                        </h2>
                    </div>
                </div>

                <button
                    type="button"
                    className="kilo-ayar-butonu"
                    onClick={() =>
                        setAyarlarAcik(
                            (mevcut) =>
                                !mevcut,
                        )
                    }
                >
                    <Target size={17} />

                    <span>
                        Hedef
                    </span>

                    {ayarlarAcik ? (
                        <ChevronUp
                            size={15}
                        />
                    ) : (
                        <ChevronDown
                            size={15}
                        />
                    )}
                </button>
            </div>

            <div className="kilo-ana-alan">
                <div className="kilo-mevcut-deger">
                    <span>
                        Güncel kilo
                    </span>

                    <strong>
                        {sayiyiFormatla(
                            kiloOzeti
                                ?.mevcutKilo,
                        )}
                    </strong>

                    <small>
                        kg
                    </small>
                </div>

                <div className="kilo-ozet-grid">
                    <div>
                        <span>
                            Başlangıç
                        </span>

                        <strong>
                            {sayiyiFormatla(
                                kiloOzeti
                                    ?.baslangicKilosu,
                            )} kg
                        </strong>
                    </div>

                    <div>
                        <span>
                            Hedef
                        </span>

                        <strong>
                            {sayiyiFormatla(
                                kiloOzeti
                                    ?.hedefKilo,
                            )} kg
                        </strong>
                    </div>

                    <div>
                        <span>
                            Hedefe kalan
                        </span>

                        <strong>
                            {sayiyiFormatla(
                                kiloOzeti
                                    ?.hedefeKalan,
                            )} kg
                        </strong>
                    </div>

                    <div>
                        <span>
                            Bu hafta
                        </span>

                        <strong className="kilo-degisim">
                            <HaftalikIcon
                                size={15}
                            />

                            {degisimMetniGetir(
                                kiloOzeti
                                    ?.haftalikDegisim,
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="kilo-giris-alani">
                <label>
                    <span>
                        Bugünkü kilon
                    </span>

                    <div className="kilo-input-sarmalayici">
                        <input
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            min="20"
                            max="300"
                            value={
                                kiloDegeri
                            }
                            onChange={(event) =>
                                setKiloDegeri(
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Örn. 52.4"
                        />

                        <span>
                            kg
                        </span>
                    </div>
                </label>

                <button
                    type="button"
                    onClick={
                        gunlukKiloyuKaydet
                    }
                    disabled={
                        kaydediliyor
                    }
                >
                    {kaydediliyor ? (
                        <LoaderCircle
                            className="donen-ikon"
                            size={18}
                        />
                    ) : (
                        <Save size={18} />
                    )}

                    Kaydet
                </button>
            </div>

            <div className="kilo-karakter-mesajlari">
                <article>
                    <div className="kilo-karakter-avatar">
                        😼
                    </div>

                    <div>
                        <strong>
                            Miço
                        </strong>

                        <p>
                            {motivasyon.mico}
                        </p>
                    </div>
                </article>

                <article>
                    <div className="kilo-karakter-avatar">
                        🐶
                    </div>

                    <div>
                        <strong>
                            Vicky
                        </strong>

                        <p>
                            {motivasyon.vicky}
                        </p>
                    </div>
                </article>
            </div>

            {ayarlarAcik && (
                <div className="kilo-hedef-formu">
                    <div className="kilo-hedef-grid">
                        <label>
                            <span>
                                Başlangıç kilosu
                            </span>

                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="20"
                                max="300"
                                value={
                                    baslangicKilosu
                                }
                                onChange={(event) =>
                                    setBaslangicKilosu(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Hedef kilo
                            </span>

                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="20"
                                max="300"
                                value={
                                    hedefKilo
                                }
                                onChange={(event) =>
                                    setHedefKilo(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </label>

                        <label>
                            <span>
                                Hedef türü
                            </span>

                            <select
                                value={
                                    hedefTuru
                                }
                                onChange={(event) =>
                                    setHedefTuru(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            >
                                <option value="kilo-al">
                                    Kilo almak
                                </option>

                                <option value="kilo-ver">
                                    Kilo vermek
                                </option>

                                <option value="kiloyu-koru">
                                    Kiloyu korumak
                                </option>
                            </select>
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={
                            hedefiKaydet
                        }
                        disabled={
                            kaydediliyor
                        }
                    >
                        <Target size={18} />

                        Hedefi Kaydet
                    </button>
                </div>
            )}

            {mesaj && (
                <div className="kilo-mesaj kilo-mesaj--basarili">
                    {mesaj}
                </div>
            )}

            {hata && (
                <div className="kilo-mesaj kilo-mesaj--hata">
                    {hata}
                </div>
            )}
        </section>
    );
}