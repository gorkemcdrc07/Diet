import { useEffect } from "react";
import {
    Award,
    Sparkles,
    X,
} from "lucide-react";

import "./RozetKutlamasi.css";

export default function RozetKutlamasi({
    gorunur,
    rozet,
    onKapat,
}) {
    useEffect(() => {
        if (!gorunur) {
            return undefined;
        }

        const zamanlayici =
            window.setTimeout(() => {
                onKapat?.();
            }, 6500);

        return () => {
            window.clearTimeout(
                zamanlayici,
            );
        };
    }, [gorunur, onKapat]);

    if (!gorunur || !rozet) {
        return null;
    }

    return (
        <div
            className="rozet-kutlama-katmani"
            role="dialog"
            aria-modal="true"
            aria-label="Yeni rozet kazanıldı"
        >
            <button
                type="button"
                className="rozet-kutlama-kapat"
                onClick={onKapat}
                aria-label="Rozet kutlamasını kapat"
            >
                <X size={19} />
            </button>

            <span className="rozet-kutlama-isik rozet-kutlama-isik--bir" />
            <span className="rozet-kutlama-isik rozet-kutlama-isik--iki" />

            <section className="rozet-kutlama-karti">
                <div className="rozet-kutlama-ikon-alani">
                    <span className="rozet-kutlama-emoji">
                        {rozet.ikon || "🏅"}
                    </span>

                    <Award
                        className="rozet-kutlama-award"
                        size={27}
                    />

                    <Sparkles
                        className="rozet-kutlama-parilti"
                        size={21}
                    />
                </div>

                <span className="rozet-kutlama-mini">
                    Yeni rozet açıldı
                </span>

                <h2>{rozet.ad}</h2>

                <p>{rozet.aciklama}</p>

                {Number(rozet.xp_odulu) > 0 && (
                    <div className="rozet-kutlama-odul">
                        <span>Rozet ödülü</span>

                        <strong>
                            +{rozet.xp_odulu} XP
                        </strong>
                    </div>
                )}

                <div className="rozet-kutlama-mesaj">
                    <img
                        src="/karakterler/mico-kizgin.png"
                        alt="Miço"
                    />

                    <div>
                        <strong>Miço</strong>

                        <span>
                            Fena değil. Bu rozeti
                            gerçekten hak ettin.
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="rozet-kutlama-devam"
                    onClick={onKapat}
                >
                    Harika
                </button>
            </section>
        </div>
    );
}