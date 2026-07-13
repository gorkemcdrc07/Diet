import { Minus, Plus } from "lucide-react";

export default function SuTakibi({
    miktar,
    hedef,
    onArtir,
    onAzalt,
}) {
    const yuzde = Math.min((miktar / hedef) * 100, 100);

    return (
        <section className="su-karti">
            <div className="su-ust">
                <div>
                    <span className="mini-baslik">Günlük hedef</span>
                    <h2>Su Takibi</h2>
                </div>

                <div className="su-deger">
                    <strong>{miktar}</strong>
                    <span>/ {hedef} bardak</span>
                </div>
            </div>

            <div className="su-ilerleme">
                <div
                    className="su-ilerleme-dolgu"
                    style={{ width: `${yuzde}%` }}
                />
            </div>

            <div className="su-alt">
                <button
                    type="button"
                    onClick={onAzalt}
                    disabled={miktar === 0}
                    aria-label="Su miktarını azalt"
                >
                    <Minus size={20} />
                </button>

                <div className="su-gorsel">
                    <span>💧</span>

                    <div>
                        <strong>
                            {miktar >= hedef
                                ? "Hedef tamamlandı"
                                : `${hedef - miktar} bardak kaldı`}
                        </strong>

                        <small>
                            {miktar >= hedef
                                ? "Bugün harika ilerledin"
                                : "Bir bardak daha içebilirsin"}
                        </small>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onArtir}
                    disabled={miktar >= hedef}
                    aria-label="Su miktarını artır"
                >
                    <Plus size={20} />
                </button>
            </div>
        </section>
    );
}