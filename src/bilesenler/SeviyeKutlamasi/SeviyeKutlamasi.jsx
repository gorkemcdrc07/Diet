import { useEffect } from "react";
import {
    Sparkles,
    Trophy,
    X,
} from "lucide-react";

import "./SeviyeKutlamasi.css";

function micoUnvaniniGetir(seviye) {
    const guvenliSeviye =
        Number(seviye) || 1;

    if (guvenliSeviye >= 20) {
        return "Büyük Patron";
    }

    if (guvenliSeviye >= 10) {
        return "Evin Patronu";
    }

    if (guvenliSeviye >= 5) {
        return "Baş Denetçi";
    }

    return "Huysuz Denetçi";
}

function vikiUnvaniniGetir(seviye) {
    const guvenliSeviye =
        Number(seviye) || 1;

    if (guvenliSeviye >= 20) {
        return "Mama Kraliçesi";
    }

    if (guvenliSeviye >= 10) {
        return "Tavuk Uzmanı";
    }

    if (guvenliSeviye >= 5) {
        return "Mama Avcısı";
    }

    return "Mama Meraklısı";
}

export default function SeviyeKutlamasi({
    gorunur,
    seviye,
    karakter = "ikisi",
    onKapat,
}) {
    useEffect(() => {
        if (!gorunur) {
            return undefined;
        }

        const zamanlayici =
            window.setTimeout(() => {
                onKapat?.();
            }, 6000);

        return () => {
            window.clearTimeout(
                zamanlayici,
            );
        };
    }, [gorunur, onKapat]);

    if (!gorunur) {
        return null;
    }

    const micoGoster =
        karakter === "mico" ||
        karakter === "ikisi";

    const vikiGoster =
        karakter === "viki" ||
        karakter === "ikisi";

    return (
        <div
            className="seviye-kutlama-katmani"
            role="dialog"
            aria-modal="true"
            aria-label="Seviye atlama kutlaması"
        >
            <button
                type="button"
                className="seviye-kutlama-kapat"
                onClick={onKapat}
                aria-label="Kutlamayı kapat"
            >
                <X size={19} />
            </button>

            <div className="seviye-kutlama-parilti seviye-kutlama-parilti--bir" />
            <div className="seviye-kutlama-parilti seviye-kutlama-parilti--iki" />

            <section className="seviye-kutlama-karti">
                <div className="seviye-kutlama-ikon">
                    <Trophy size={30} />

                    <Sparkles
                        className="seviye-kutlama-ikon-parilti"
                        size={20}
                    />
                </div>

                <span className="seviye-kutlama-mini">
                    Yeni başarı
                </span>

                <h2>Seviye atladın!</h2>

                <div className="seviye-kutlama-seviye">
                    <span>Seviye</span>
                    <strong>{seviye}</strong>
                </div>

                <div className="seviye-kutlama-karakterler">
                    {micoGoster && (
                        <article>
                            <img
                                src="/karakterler/mico-kizgin.png"
                                alt="Miço"
                            />

                            <div>
                                <span>Miço</span>

                                <strong>
                                    {micoUnvaniniGetir(
                                        seviye,
                                    )}
                                </strong>
                            </div>
                        </article>
                    )}

                    {vikiGoster && (
                        <article>
                            <img
                                src="/karakterler/viki-mama.png"
                                alt="Viki"
                            />

                            <div>
                                <span>Viki</span>

                                <strong>
                                    {vikiUnvaniniGetir(
                                        seviye,
                                    )}
                                </strong>
                            </div>
                        </article>
                    )}
                </div>

                <p>
                    Yeni seviyen açıldı. Miço biraz
                    gururlu, Viki ise kutlama maması
                    bekliyor.
                </p>

                <button
                    type="button"
                    className="seviye-kutlama-devam"
                    onClick={onKapat}
                >
                    Devam et
                </button>
            </section>
        </div>
    );
}