import { useEffect } from "react";
import {
    CheckCircle2,
    Sparkles,
    X,
} from "lucide-react";

import "./GorevKutlamasi.css";

export default function GorevKutlamasi({
    gorunur,
    gorev,
    toplamXp = 0,
    gorevSayisi = 1,
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

    if (!gorunur || !gorev) {
        return null;
    }

    const karakter =
        gorev.karakter || "ikisi";

    const karakterGorseli =
        karakter === "viki"
            ? "/karakterler/viki-mama.png"
            : "/karakterler/mico-kizgin.png";

    const karakterAdi =
        karakter === "viki"
            ? "Viki"
            : karakter === "mico"
                ? "Miço"
                : "Miço & Viki";

    return (
        <div
            className="gorev-kutlama-katmani"
            role="dialog"
            aria-modal="true"
            aria-label="Günlük görev tamamlandı"
        >
            <button
                type="button"
                className="gorev-kutlama-kapat"
                onClick={onKapat}
                aria-label="Görev kutlamasını kapat"
            >
                <X size={19} />
            </button>

            <span className="gorev-kutlama-isik gorev-kutlama-isik--bir" />
            <span className="gorev-kutlama-isik gorev-kutlama-isik--iki" />

            <section className="gorev-kutlama-karti">
                <div className="gorev-kutlama-ikon">
                    <CheckCircle2 size={40} />

                    <Sparkles
                        className="gorev-kutlama-parilti"
                        size={22}
                    />
                </div>

                <span className="gorev-kutlama-mini">
                    Günlük görev tamamlandı
                </span>

                <h2>
                    {gorevSayisi > 1
                        ? `${gorevSayisi} görev tamamlandı`
                        : gorev.ad}
                </h2>

                <p>
                    {gorevSayisi > 1
                        ? "Bugünkü hedeflerinden birkaçını aynı anda tamamladın."
                        : gorev.aciklama}
                </p>

                <div className="gorev-kutlama-odul">
                    <span>Kazanılan ödül</span>

                    <strong>
                        +{toplamXp} XP
                    </strong>
                </div>

                <div className="gorev-kutlama-karakter">
                    <img
                        src={karakterGorseli}
                        alt={karakterAdi}
                    />

                    <div>
                        <strong>
                            {karakterAdi}
                        </strong>

                        <span>
                            {karakter === "viki"
                                ? "Harikasın! Birlikte daha çok hedef tamamlayalım."
                                : karakter === "mico"
                                    ? "Bu görev beklediğimden daha iyi tamamlandı."
                                    : "Bugünkü ilerlemen ikimizi de çok mutlu etti."}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="gorev-kutlama-devam"
                    onClick={onKapat}
                >
                    Devam et
                </button>
            </section>
        </div>
    );
}