import {
    Minus,
    Plus,
    Waves,
} from "lucide-react";

import "./SuTakibi.css";

export default function SuTakibi({
    miktar,
    hedef,
    onArtir,
    onAzalt,
}) {
    const guvenliMiktar =
        Number(miktar) || 0;

    const guvenliHedef =
        Math.max(Number(hedef) || 1, 1);

    const yuzde =
        Math.min(
            Math.round(
                (guvenliMiktar / guvenliHedef) * 100,
            ),
            100,
        );

    const hedefTamamlandi =
        guvenliMiktar >= guvenliHedef;

    return (
        <section
            className={[
                "su-karti",
                hedefTamamlandi
                    ? "su-karti--tamamlandi"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="su-karti-sol">
                <span className="su-karti-ikon">
                    <Waves size={22} />
                </span>

                <div>
                    <span className="su-mini-baslik">
                        Günlük hedef
                    </span>

                    <h2>Su Takibi</h2>

                    <p>
                        {hedefTamamlandi
                            ? "Bugünkü su hedefin tamamlandı."
                            : `${guvenliHedef - guvenliMiktar} bardak kaldı.`}
                    </p>
                </div>
            </div>

            <div className="su-karti-orta">
                <div className="su-deger">
                    <strong>{guvenliMiktar}</strong>
                    <span>/ {guvenliHedef}</span>
                </div>

                <div className="su-ilerleme">
                    <span
                        style={{
                            width: `${yuzde}%`,
                        }}
                    />
                </div>

                <small>%{yuzde} tamamlandı</small>
            </div>

            <div className="su-karti-kontroller">
                <button
                    type="button"
                    onClick={onAzalt}
                    disabled={guvenliMiktar === 0}
                    aria-label="Su miktarını azalt"
                >
                    <Minus size={18} />
                </button>

                <button
                    type="button"
                    className="su-artir-butonu"
                    onClick={onArtir}
                    disabled={hedefTamamlandi}
                    aria-label="Su miktarını artır"
                >
                    <Plus size={20} />
                </button>
            </div>
        </section>
    );
}
