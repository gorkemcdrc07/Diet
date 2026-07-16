import {
    Camera,
    Check,
    ImagePlus,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import "./OgunTamamlamaModali.css";

export default function OgunTamamlamaModali({
    acik,
    ogun,
    onKapat,
    onTamamla,
    onKaloriAnalizineGonder,
}) {
    const kameraInputRef =
        useRef(null);

    const galeriInputRef =
        useRef(null);

    const [
        fotograf,
        setFotograf,
    ] = useState(null);

    const [
        onizleme,
        setOnizleme,
    ] = useState("");

    const [
        notMetni,
        setNotMetni,
    ] = useState("");

    useEffect(() => {
        if (!acik) {
            return;
        }

        setFotograf(null);
        setOnizleme("");
        setNotMetni("");
    }, [
        acik,
        ogun?.id,
    ]);

    useEffect(() => {
        return () => {
            if (onizleme) {
                URL.revokeObjectURL(
                    onizleme,
                );
            }
        };
    }, [
        onizleme,
    ]);

    if (!acik || !ogun) {
        return null;
    }

    function fotografSecildi(event) {
        const dosya =
            event.target.files?.[0];

        event.target.value = "";

        if (!dosya) {
            return;
        }

        if (
            !String(dosya.type)
                .startsWith("image/")
        ) {
            window.alert(
                "Lütfen bir fotoğraf seç.",
            );

            return;
        }

        if (
            dosya.size >
            8 * 1024 * 1024
        ) {
            window.alert(
                "Fotoğraf 8 MB'tan küçük olmalıdır.",
            );

            return;
        }

        if (onizleme) {
            URL.revokeObjectURL(
                onizleme,
            );
        }

        setFotograf(dosya);

        setOnizleme(
            URL.createObjectURL(
                dosya,
            ),
        );
    }

    function fotografiTemizle() {
        if (onizleme) {
            URL.revokeObjectURL(
                onizleme,
            );
        }

        setFotograf(null);
        setOnizleme("");
    }

    function sadeceTamamla() {
        onTamamla?.({
            ogun,
            fotograf,
            notMetni:
                notMetni.trim(),
        });
    }

    function kaloriyeGonder() {
        if (!fotograf) {
            window.alert(
                "Kalori analizi için önce fotoğraf çek veya galeriden seç.",
            );

            return;
        }

        onKaloriAnalizineGonder?.({
            ogun,
            fotograf,
            notMetni:
                notMetni.trim(),
        });
    }

    return (
        <div
            className="ogun-tamamlama-modal-arkaplan"
            role="presentation"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onKapat?.();
                }
            }}
        >
            <section
                className="ogun-tamamlama-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Öğünü tamamla"
            >
                <header className="ogun-tamamlama-modal-baslik">
                    <div>
                        <span>
                            Öğün kaydı
                        </span>

                        <h2>
                            {ogun.baslik}
                        </h2>

                        <p>
                            {ogun.saat}
                            {" · "}
                            {ogun.kisaBaslik}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onKapat}
                        aria-label="Modalı kapat"
                    >
                        <X size={19} />
                    </button>
                </header>

                {!onizleme ? (
                    <div className="ogun-fotograf-secim">
                        <span className="ogun-fotograf-buyuk-ikon">
                            <Camera size={30} />
                        </span>

                        <strong>
                            Öğününü fotoğraflandır
                        </strong>

                        <p>
                            Fotoğraf eklemek zorunlu değil.
                            Kalori analizi yapmak için fotoğraf gereklidir.
                        </p>

                        <div className="ogun-fotograf-butonlari">
                            <button
                                type="button"
                                onClick={() =>
                                    kameraInputRef
                                        .current
                                        ?.click()
                                }
                            >
                                <Camera size={18} />
                                Fotoğraf Çek
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    galeriInputRef
                                        .current
                                        ?.click()
                                }
                            >
                                <ImagePlus size={18} />
                                Galeriden Seç
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="ogun-fotograf-onizleme">
                        <img
                            src={onizleme}
                            alt="Tamamlanan öğün"
                        />

                        <button
                            type="button"
                            onClick={
                                fotografiTemizle
                            }
                        >
                            <Trash2 size={16} />
                            Fotoğrafı kaldır
                        </button>
                    </div>
                )}

                <input
                    ref={kameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={
                        fotografSecildi
                    }
                />

                <input
                    ref={galeriInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                        fotografSecildi
                    }
                />

                <label className="ogun-tamamlama-not">
                    <span>
                        Öğün notu
                    </span>

                    <textarea
                        rows={3}
                        value={notMetni}
                        onChange={(event) =>
                            setNotMetni(
                                event.target.value,
                            )
                        }
                        placeholder="Örn. Pilavı yarım porsiyon yedim, salata ekledim."
                    />
                </label>

                <div className="ogun-tamamlama-modal-islemler">
                    <button
                        type="button"
                        className="ogun-sadece-tamamla"
                        onClick={
                            sadeceTamamla
                        }
                    >
                        <Check size={18} />
                        Öğünü Tamamla
                    </button>

                    <button
                        type="button"
                        className="ogun-kaloriye-gonder"
                        onClick={
                            kaloriyeGonder
                        }
                    >
                        <Sparkles size={18} />
                        Kalori Analizine Gönder
                    </button>
                </div>
            </section>
        </div>
    );
}