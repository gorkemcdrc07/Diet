import {
    CheckCircle2,
    Droplets,
    Flame,
    Heart,
    Sparkles,
    Utensils,
} from "lucide-react";

function yuzdeSinirla(deger) {
    return Math.min(
        100,
        Math.max(0, Number(deger) || 0),
    );
}

function mesajGetir({
    genelYuzde,
    tamamlananOgun,
    suMiktari,
}) {
    if (genelYuzde >= 100) {
        return {
            baslik: "Bugünkü hedeflerin tamamlandı",
            mesaj:
                "Kendine gösterdiğin özenle gurur duyuyorum. Harikasın güzelim. ❤️",
            emoji: "🥳",
        };
    }

    if (genelYuzde >= 75) {
        return {
            baslik: "Harika gidiyorsun",
            mesaj:
                "Bugünün büyük kısmını tamamladın. Biraz daha devam edelim. 🌸",
            emoji: "✨",
        };
    }

    if (genelYuzde >= 50) {
        return {
            baslik: "Günün yarısını geçtin",
            mesaj:
                "Her küçük adım seni hedefine biraz daha yaklaştırıyor.",
            emoji: "💗",
        };
    }

    if (
        tamamlananOgun > 0 ||
        suMiktari > 0
    ) {
        return {
            baslik: "Güzel bir başlangıç",
            mesaj:
                "Bugün kendin için ilk adımı attın. Devamı da gelecek.",
            emoji: "🌷",
        };
    }

    return {
        baslik: "Yeni bir gün başlıyor",
        mesaj:
            "Bugün kendin için yapacağın küçük bir şey bile çok değerli.",
        emoji: "☀️",
    };
}

export default function GununOzeti({
    tamamlananOgun,
    toplamOgun,
    suMiktari,
    suHedefi,
    gunlukSeri,
}) {
    const ogunYuzdesi =
        toplamOgun > 0
            ? Math.round(
                (
                    tamamlananOgun /
                    toplamOgun
                ) * 100,
            )
            : 0;

    const suYuzdesi =
        suHedefi > 0
            ? Math.round(
                (
                    suMiktari /
                    suHedefi
                ) * 100,
            )
            : 0;

    const genelYuzde =
        Math.round(
            (
                yuzdeSinirla(
                    ogunYuzdesi,
                ) +
                yuzdeSinirla(
                    suYuzdesi,
                )
            ) / 2,
        );

    const durumMesaji =
        mesajGetir({
            genelYuzde,
            tamamlananOgun,
            suMiktari,
        });

    const tumOgunlerTamamlandi =
        toplamOgun > 0 &&
        tamamlananOgun === toplamOgun;

    const suTamamlandi =
        suHedefi > 0 &&
        suMiktari >= suHedefi;

    return (
        <section className="gunun-ozeti-karti">
            <div className="gunun-ozeti-isik bir" />
            <div className="gunun-ozeti-isik iki" />

            <div className="gunun-ozeti-baslik">
                <div>
                    <span className="gunun-ozeti-mini">
                        Günün özeti
                    </span>

                    <h2>
                        Bugün Nasıl Gidiyor?
                    </h2>
                </div>

                <div className="gunun-ozeti-kalp">
                    <Heart
                        size={21}
                        fill="currentColor"
                    />
                </div>
            </div>

            <div className="gunun-ozeti-ilerleme">
                <div
                    className="gunun-ozeti-halka"
                    style={{
                        "--gunun-ozeti-yuzde":
                            `${yuzdeSinirla(
                                genelYuzde,
                            ) * 3.6
                            }deg`,
                    }}
                >
                    <div>
                        <strong>
                            %{genelYuzde}
                        </strong>

                        <span>
                            Günlük başarı
                        </span>
                    </div>
                </div>

                <div className="gunun-ozeti-durum">
                    <span>
                        {durumMesaji.emoji}
                    </span>

                    <div>
                        <strong>
                            {
                                durumMesaji.baslik
                            }
                        </strong>

                        <p>
                            {
                                durumMesaji.mesaj
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="gunun-ozeti-metrikler">
                <article
                    className={
                        tumOgunlerTamamlandi
                            ? "tamamlandi"
                            : ""
                    }
                >
                    <div className="gunun-ozeti-metrik-ikon ogun">
                        {tumOgunlerTamamlandi ? (
                            <CheckCircle2
                                size={19}
                            />
                        ) : (
                            <Utensils
                                size={19}
                            />
                        )}
                    </div>

                    <div>
                        <span>Öğün</span>

                        <strong>
                            {tamamlananOgun}
                            {" / "}
                            {toplamOgun}
                        </strong>
                    </div>

                    <small>
                        %{yuzdeSinirla(
                            ogunYuzdesi,
                        )}
                    </small>
                </article>

                <article
                    className={
                        suTamamlandi
                            ? "tamamlandi"
                            : ""
                    }
                >
                    <div className="gunun-ozeti-metrik-ikon su">
                        {suTamamlandi ? (
                            <CheckCircle2
                                size={19}
                            />
                        ) : (
                            <Droplets
                                size={19}
                            />
                        )}
                    </div>

                    <div>
                        <span>Su</span>

                        <strong>
                            {suMiktari}
                            {" / "}
                            {suHedefi}
                        </strong>
                    </div>

                    <small>
                        %{yuzdeSinirla(
                            suYuzdesi,
                        )}
                    </small>
                </article>

                <article>
                    <div className="gunun-ozeti-metrik-ikon seri">
                        <Flame size={19} />
                    </div>

                    <div>
                        <span>Seri</span>

                        <strong>
                            {gunlukSeri} gün
                        </strong>
                    </div>

                    <Sparkles
                        className="gunun-ozeti-parilti"
                        size={17}
                    />
                </article>
            </div>
        </section>
    );
}