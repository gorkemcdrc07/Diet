import { useEffect } from "react";
import "./XPToast.css";

export default function XPToast({
    xp,
    mesaj,
    karakter = "ikisi",
    gorunur,
    onKapat,
}) {
    useEffect(() => {
        if (!gorunur) return undefined;

        const timer = window.setTimeout(() => {
            onKapat?.();
        }, 2400);

        return () => window.clearTimeout(timer);
    }, [gorunur, onKapat]);

    if (!gorunur || !xp) {
        return null;
    }

    const karakterIkonu = {
        mico: "🐶",
        viki: "🐱",
        ikisi: "🐾",
    };

    return (
        <div className="xp-toast-container" aria-live="polite">
            <div className="xp-toast">
                <span className="xp-toast-icon">
                    {karakterIkonu[karakter] || "🐾"}
                </span>

                <div className="xp-toast-content">
                    <strong>+{xp} XP</strong>

                    {mesaj && <span>{mesaj}</span>}
                </div>
            </div>
        </div>
    );
}