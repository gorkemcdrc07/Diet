import {
    Activity,
    ChevronRight,
    Droplets,
    Flame,
    Scale,
    TrendingUp,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import KiloTakipKarti from "../bilesenler/KiloTakipKarti";

import "./TakipSayfasi.css";

const SU_KEY = "diyet-su-miktari";

function suMiktariniOku() {
    const miktar = Number(
        localStorage.getItem(SU_KEY),
    );

    return Number.isFinite(miktar)
        ? Math.max(miktar, 0)
        : 0;
}

export default function TakipSayfasi() {
    const [aktifSekme, setAktifSekme] =
        useState("genel");

    const [suMiktari, setSuMiktari] =
        useState(() => suMiktariniOku());

    useEffect(() => {
        function suDegisiminiDinle(event) {
            const yeniMiktar = Number(
                event?.detail?.miktar,
            );

            if (Number.isFinite(yeniMiktar)) {
                setSuMiktari(
                    Math.max(yeniMiktar, 0),
                );

                return;
            }

            setSuMiktari(
                suMiktariniOku(),
            );
        }

        function storageDegisiminiDinle(
            event,
        ) {
            if (event.key === SU_KEY) {
                setSuMiktari(
                    suMiktariniOku(),
                );
            }
        }

        window.addEventListener(
            "gunluk-su-degisti",
            suDegisiminiDinle,
        );

        window.addEventListener(
            "storage",
            storageDegisiminiDinle,
        );

        return () => {
            window.removeEventListener(
                "gunluk-su-degisti",
                suDegisiminiDinle,
            );

            window.removeEventListener(
                "storage",
                storageDegisiminiDinle,
            );
        };
    }, []);

    const suYuzdesi = useMemo(() => {
        return Math.min(
            Math.round(
                (suMiktari / 8) * 100,
            ),
            100,
        );
    }, [suMiktari]);

    return (
        <div className="standart-sayfa takip-sayfasi">
            <header className="sayfa-basligi">
                <div className="sayfa-baslik-ikon">
                    <Activity size={22} />
                </div>

                <div>
                    <span>
                        Sağlık ve ilerleme
                    </span>

                    <h1>
                        Takip
                    </h1>
                </div>
            </header>

            <nav
                className="takip-sekme-menusu"
                aria-label="Takip bölümleri"
            >
                <button
                    type="button"
                    className={
                        aktifSekme === "genel"
                            ? "aktif"
                            : ""
                    }
                    onClick={() =>
                        setAktifSekme("genel")
                    }
                >
                    <TrendingUp size={17} />
                    Genel
                </button>

                <button
                    type="button"
                    className={
                        aktifSekme === "kilo"
                            ? "aktif"
                            : ""
                    }
                    onClick={() =>
                        setAktifSekme("kilo")
                    }
                >
                    <Scale size={17} />
                    Kilo
                </button>

                <button
                    type="button"
                    className={
                        aktifSekme === "kalori"
                            ? "aktif"
                            : ""
                    }
                    onClick={() =>
                        setAktifSekme("kalori")
                    }
                >
                    <Flame size={17} />
                    Kalori
                </button>
            </nav>

            {aktifSekme === "genel" && (
                <>
                    <section className="takip-hero-karti">
                        <div className="takip-hero-ust">
                            <div>
                                <span>
                                    Günlük durum
                                </span>

                                <h2>
                                    İlerlemeni tek
                                    ekrandan izle
                                </h2>

                                <p>
                                    Kilo, su ve kalori
                                    bilgilerini düzenli
                                    girdikçe Miço ve Vicky
                                    sana özel öneriler
                                    hazırlayacak.
                                </p>
                            </div>

                            <span className="takip-hero-ikon">
                                <Activity size={24} />
                            </span>
                        </div>
                    </section>

                    <section className="takip-ozet-grid">
                        <button
                            type="button"
                            className="takip-ozet-karti"
                            onClick={() =>
                                setAktifSekme(
                                    "kilo",
                                )
                            }
                        >
                            <span className="takip-ozet-ikon takip-ozet-ikon--kilo">
                                <Scale size={20} />
                            </span>

                            <div>
                                <span>
                                    Kilo takibi
                                </span>

                                <strong>
                                    Günlük ölçüm
                                </strong>

                                <small>
                                    Hedefini ve değişimini
                                    görüntüle
                                </small>
                            </div>

                            <ChevronRight
                                size={18}
                            />
                        </button>

                        <article className="takip-ozet-karti">
                            <span className="takip-ozet-ikon takip-ozet-ikon--su">
                                <Droplets size={20} />
                            </span>

                            <div>
                                <span>
                                    Bugünkü su
                                </span>

                                <strong>
                                    {suMiktari} / 8
                                    bardak
                                </strong>

                                <small>
                                    %{suYuzdesi}
                                    tamamlandı
                                </small>
                            </div>

                            <div className="takip-mini-halka">
                                <strong>
                                    %{suYuzdesi}
                                </strong>
                            </div>
                        </article>

                        <button
                            type="button"
                            className="takip-ozet-karti"
                            onClick={() =>
                                setAktifSekme(
                                    "kalori",
                                )
                            }
                        >
                            <span className="takip-ozet-ikon takip-ozet-ikon--kalori">
                                <Flame size={20} />
                            </span>

                            <div>
                                <span>
                                    Kalori
                                </span>

                                <strong>
                                    Hesaplama hazırla
                                </strong>

                                <small>
                                    Öğünlerden günlük kalori
                                    oluştur
                                </small>
                            </div>

                            <ChevronRight
                                size={18}
                            />
                        </button>
                    </section>

                    <section className="takip-karakter-notu">
                        <div className="takip-karakter-avatar">
                            😼
                        </div>

                        <div>
                            <span>
                                Miço'nun notu
                            </span>

                            <strong>
                                Düzenli veri girmezsen
                                seni nasıl takip edeceğim?
                            </strong>

                            <p>
                                Bugünkü kilonu girdikten
                                sonra haftalık değişimini
                                birlikte değerlendireceğiz.
                            </p>
                        </div>
                    </section>
                </>
            )}

            {aktifSekme === "kilo" && (
                <section className="takip-icerik-bolumu">
                    <div className="takip-bolum-basligi">
                        <div>
                            <span>
                                Vücut gelişimi
                            </span>

                            <h2>
                                Kilo Takibi
                            </h2>
                        </div>
                    </div>

                    <KiloTakipKarti />
                </section>
            )}

            {aktifSekme === "kalori" && (
                <section className="takip-bos-karti">
                    <span className="takip-bos-ikon">
                        <Flame size={25} />
                    </span>

                    <div>
                        <span>
                            Sıradaki geliştirme
                        </span>

                        <h2>
                            Kalori ve makro takibi
                        </h2>

                        <p>
                            Öğünlerdeki besinlerin kalori,
                            protein, karbonhidrat ve yağ
                            değerlerini hesaplayan sistemi
                            burada oluşturacağız.
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}