import {
    CheckCircle2,
    Heart,
    Sparkles,
    X,
} from "lucide-react";

export default function TamamlamaKutlamasi({
    acik,
    gunlukSeri,
    onKapat,
}) {
    if (!acik) {
        return null;
    }

    return (
        <div
            className="kutlama-katmani"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kutlama-basligi"
        >
            <div className="kutlama-isik kutlama-isik-bir" />
            <div className="kutlama-isik kutlama-isik-iki" />

            <button
                type="button"
                className="kutlama-kapat"
                onClick={onKapat}
                aria-label="Kutlama ekranını kapat"
            >
                <X size={21} />
            </button>

            <div className="kutlama-icerik">
                <div className="kutlama-rozet">
                    <Heart
                        size={45}
                        fill="currentColor"
                    />

                    <Sparkles
                        className="kutlama-parilti"
                        size={25}
                    />
                </div>

                <span className="kutlama-etiket">
                    Bugünkü hedef tamamlandı
                </span>

                <h2 id="kutlama-basligi">
                    Harikasın Güzelim
                </h2>

                <p>
                    Bugünkü beslenme programının tamamını
                    bitirdin. Kendine gösterdiğin özenle
                    gurur duyuyorum.
                </p>

                <div className="kutlama-bilgi">
                    <CheckCircle2 size={21} />

                    <div>
                        <strong>
                            Tüm öğünler tamamlandı
                        </strong>

                        <span>
                            {gunlukSeri} günlük seri
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="kutlama-devam"
                    onClick={onKapat}
                >
                    Teşekkür ederim ❤️
                </button>
            </div>
        </div>
    );
}