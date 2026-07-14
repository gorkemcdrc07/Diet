import {
    CheckCircle2,
    ChevronRight,
    Clock3,
    Flame,
    Heart,
    Sparkles,
} from "lucide-react";

function zamanTemasiGetir() {
    const parcalar = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const saat = Number(
        parcalar.find(
            (parca) => parca.type === "hour",
        )?.value || 0,
    );

    if (saat >= 6 && saat < 12) {
        return {
            sinif: "sabah",
            selamlama: "Günaydın",
            emoji: "☀️",
            aciklama:
                "Bugün de kendin için güzel bir başlangıç yapıyorsun.",
        };
    }

    if (saat >= 12 && saat < 18) {
        return {
            sinif: "ogle",
            selamlama: "Güzel bir gün",
            emoji: "🌸",
            aciklama:
                "Kendine gösterdiğin özen her şeyden değerli.",
        };
    }

    if (saat >= 18 && saat < 22) {
        return {
            sinif: "aksam",
            selamlama: "İyi akşamlar",
            emoji: "🌙",
            aciklama:
                "Bugünü kendine iyi bakarak tamamlıyorsun.",
        };
    }

    return {
        sinif: "gece",
        selamlama: "Tatlı geceler",
        emoji: "✨",
        aciklama:
            "Bugün gösterdiğin çabayla gurur duyuyorum.",
    };
}

export default function PremiumUstAlan({
    tarih,
    motivasyonMesaji,
    ilerlemeYuzdesi,
    tamamlananSayisi,
    toplamOgunSayisi,
    gunlukSeri,
    sonrakiOgun,
    kalanSure,
}) {
    const tema = zamanTemasiGetir();

    return (
        <section
            className={`premium-ust-alan tema-${tema.sinif}`}
        >
            <div className="premium-isik premium-isik-bir" />
            <div className="premium-isik premium-isik-iki" />

            <div className="premium-ust-baslik">
                <div>
                    <span className="premium-tarih">
                        {tarih}
                    </span>

                    <h1>
                        {tema.selamlama},{" "}
                        <span>Güzelim</span>{" "}
                        {tema.emoji}
                    </h1>

                    <p>{tema.aciklama}</p>
                </div>

                <div className="premium-kalp">
                    <Heart
                        size={21}
                        fill="currentColor"
                    />
                </div>
            </div>

            <div className="premium-motivasyon">
                <Sparkles size={18} />

                <p>{motivasyonMesaji}</p>
            </div>

            <div className="premium-ozet-grid">
                <div className="premium-ilerleme-alani">
                    <div
                        className="premium-ilerleme-halka"
                        style={{
                            "--ilerleme":
                                `${ilerlemeYuzdesi * 3.6}deg`,
                        }}
                    >
                        <div>
                            <strong>
                                %{ilerlemeYuzdesi}
                            </strong>

                            <span>
                                Tamamlandı
                            </span>
                        </div>
                    </div>

                    <div className="premium-ilerleme-bilgi">
                        <span>
                            Bugünkü hedef
                        </span>

                        <strong>
                            {tamamlananSayisi} /{" "}
                            {toplamOgunSayisi} öğün
                        </strong>

                        <small>
                            <Flame size={14} />
                            {gunlukSeri} günlük seri
                        </small>
                    </div>
                </div>

                {sonrakiOgun ? (
                    <div className="premium-sonraki-ogun">
                        <div className="premium-sonraki-ust">
                            <span>
                                Sıradaki öğün
                            </span>

                            <ChevronRight size={18} />
                        </div>

                        <div className="premium-sonraki-icerik">
                            <div className="premium-sonraki-emoji">
                                {sonrakiOgun.emoji}
                            </div>

                            <div>
                                <strong>
                                    {sonrakiOgun.kisaBaslik ||
                                        sonrakiOgun.baslik}
                                </strong>

                                <span>
                                    <Clock3 size={13} />
                                    {sonrakiOgun.saat}
                                </span>

                                <small>
                                    {kalanSure}
                                </small>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="premium-sonraki-ogun tamamlandi">
                        <CheckCircle2 size={25} />

                        <span>
                            Bugünkü hedef
                        </span>

                        <strong>
                            Tüm öğünler tamamlandı
                        </strong>

                        <small>
                            Seninle gurur duyuyorum ❤️
                        </small>
                    </div>
                )}
            </div>
        </section>
    );
}