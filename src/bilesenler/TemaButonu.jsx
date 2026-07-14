import {
    Laptop2,
    Moon,
    Sun,
} from "lucide-react";

const temaSecenekleri = [
    {
        id: "acik",
        etiket: "Açık",
        ikon: Sun,
    },
    {
        id: "koyu",
        etiket: "Koyu",
        ikon: Moon,
    },
    {
        id: "sistem",
        etiket: "Sistem",
        ikon: Laptop2,
    },
];

export default function TemaButonu({
    tema,
    onTemaDegistir,
}) {
    return (
        <section className="tema-karti">
            <div className="tema-karti-baslik">
                <div>
                    <span className="mini-baslik">
                        Görünüm
                    </span>

                    <h2>Uygulama Teması</h2>
                </div>

                <div className="tema-karti-ikon">
                    {tema === "koyu" ? (
                        <Moon size={21} />
                    ) : (
                        <Sun size={21} />
                    )}
                </div>
            </div>

            <div className="tema-secenekleri">
                {temaSecenekleri.map((secenek) => {
                    const Icon = secenek.ikon;
                    const aktif =
                        tema === secenek.id;

                    return (
                        <button
                            key={secenek.id}
                            type="button"
                            className={
                                aktif
                                    ? "aktif"
                                    : ""
                            }
                            onClick={() =>
                                onTemaDegistir(
                                    secenek.id,
                                )
                            }
                        >
                            <Icon size={18} />

                            <span>
                                {secenek.etiket}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}