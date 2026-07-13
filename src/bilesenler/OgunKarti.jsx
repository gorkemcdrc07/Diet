import { useState } from "react";
import {
    Check,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock3,
    Info,
} from "lucide-react";

export default function OgunKarti({
    ogun,
    tamamlandi,
    onToggle,
}) {
    const [detayAcik, setDetayAcik] = useState(false);

    return (
        <article
            className={`ogun-karti ${tamamlandi ? "tamamlandi" : ""}`}
        >
            <button
                type="button"
                className="ogun-karti-ana"
                onClick={() => setDetayAcik((mevcut) => !mevcut)}
            >
                <div className="ogun-emoji">{ogun.emoji}</div>

                <div className="ogun-bilgi">
                    <div className="ogun-bilgi-ust">
                        <strong>{ogun.baslik}</strong>

                        <span className="ogun-saat">
                            <Clock3 size={14} />
                            {ogun.saat}
                        </span>
                    </div>

                    <span>{ogun.kisaBaslik}</span>
                </div>

                <div className="detay-oku">
                    {detayAcik ? (
                        <ChevronUp size={19} />
                    ) : (
                        <ChevronDown size={19} />
                    )}
                </div>
            </button>

            {detayAcik && (
                <div className="ogun-detay">
                    <div className="ogun-detay-bolum">
                        <h4>Tüketilecekler</h4>

                        <ul>
                            {ogun.icerikler.map((icerik) => (
                                <li key={icerik}>
                                    <Circle size={7} fill="currentColor" />
                                    <span>{icerik}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {ogun.secenekler?.length > 0 && (
                        <div className="ogun-detay-bolum">
                            <h4>Alternatif seçenekler</h4>

                            <ul>
                                {ogun.secenekler.map((secenek) => (
                                    <li key={secenek}>
                                        <Circle
                                            size={7}
                                            fill="currentColor"
                                        />
                                        <span>{secenek}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {ogun.notlar?.length > 0 && (
                        <div className="ogun-notlari">
                            <div className="ogun-not-baslik">
                                <Info size={16} />
                                <strong>Notlar</strong>
                            </div>

                            {ogun.notlar.map((not) => (
                                <p key={not}>{not}</p>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        className={`tamamla-butonu ${tamamlandi ? "geri-al" : ""
                            }`}
                        onClick={() => onToggle(ogun.id)}
                    >
                        {tamamlandi ? (
                            <>
                                <Check size={18} />
                                Tamamlandı
                            </>
                        ) : (
                            <>
                                <Circle size={18} />
                                Öğünü tamamladım
                            </>
                        )}
                    </button>
                </div>
            )}

            {!detayAcik && tamamlandi && (
                <button
                    type="button"
                    className="mini-tamamlandi"
                    onClick={() => onToggle(ogun.id)}
                    aria-label="Tamamlanma durumunu değiştir"
                >
                    <Check size={16} />
                </button>
            )}
        </article>
    );
}