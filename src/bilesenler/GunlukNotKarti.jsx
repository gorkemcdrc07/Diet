import { Heart } from "lucide-react";

export default function GunlukNotKarti({ not }) {
    if (!not) {
        return null;
    }

    return (
        <section className="gunluk-not-karti">
            <div className="gunluk-not-isik gunluk-not-isik-bir" />
            <div className="gunluk-not-isik gunluk-not-isik-iki" />

            <div className="gunluk-not-ust">
                <div className="gunluk-not-emoji">
                    {not.emoji}
                </div>

                <div>
                    <span>Sevgilimden</span>
                    <strong>{not.baslik}</strong>
                </div>

                <Heart
                    className="gunluk-not-kalp"
                    size={21}
                    fill="currentColor"
                />
            </div>

            <blockquote>
                “{not.mesaj}”
            </blockquote>

            <div className="gunluk-not-imza">
                Senin için hazırlandı
                <span>❤️</span>
            </div>
        </section>
    );
}