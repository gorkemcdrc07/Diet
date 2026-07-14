import { Droplets, Target, Trophy } from "lucide-react";

const GUN_ADLARI = [
    "Paz",
    "Pzt",
    "Sal",
    "Çar",
    "Per",
    "Cum",
    "Cmt",
];

function gunEtiketiGetir(tarih) {
    return GUN_ADLARI[tarih.getUTCDay()];
}

function gunNumarasiGetir(tarih) {
    return tarih.getUTCDate();
}

function durumSinifiGetir(gun) {
    if (!gun.kayit) {
        return gun.bugun
            ? "bugun bos"
            : "bos";
    }

    if (gun.kayit.gunTamamlandi) {
        return "tamamlandi";
    }

    if (
        gun.kayit.tamamlananOgunSayisi > 0 ||
        gun.kayit.suMiktari > 0
    ) {
        return "devam-ediyor";
    }

    return "bos";
}

export default function HaftalikIlerleme({
    ozet,
}) {
    return (
        <section className="haftalik-kart">
            <div className="haftalik-baslik">
                <div>
                    <span className="mini-baslik">
                        Son yedi gün
                    </span>

                    <h2>
                        Haftalık İlerlemen
                    </h2>
                </div>

                <div className="haftalik-yuzde">
                    %{ozet.ortalamaOgunYuzdesi}
                </div>
            </div>

            <div className="haftalik-gunler">
                {ozet.gunler.map((gun) => (
                    <div
                        key={gun.tarih}
                        className={`haftalik-gun ${durumSinifiGetir(
                            gun,
                        )}`}
                    >
                        <span>
                            {gunEtiketiGetir(
                                gun.tarihNesnesi,
                            )}
                        </span>

                        <div className="haftalik-gun-nokta">
                            <strong>
                                {gunNumarasiGetir(
                                    gun.tarihNesnesi,
                                )}
                            </strong>
                        </div>

                        <small>
                            {gun.kayit
                                ? `%${gun.kayit.ogunYuzdesi}`
                                : "—"}
                        </small>
                    </div>
                ))}
            </div>

            <div className="haftalik-istatistikler">
                <div className="haftalik-istatistik">
                    <div className="haftalik-istatistik-ikon">
                        <Trophy size={18} />
                    </div>

                    <div>
                        <strong>
                            {
                                ozet.tamamlananGunSayisi
                            }
                        </strong>

                        <span>
                            Tam gün
                        </span>
                    </div>
                </div>

                <div className="haftalik-istatistik">
                    <div className="haftalik-istatistik-ikon">
                        <Target size={18} />
                    </div>

                    <div>
                        <strong>
                            {
                                ozet.toplamTamamlananOgun
                            }
                        </strong>

                        <span>
                            Öğün
                        </span>
                    </div>
                </div>

                <div className="haftalik-istatistik">
                    <div className="haftalik-istatistik-ikon su">
                        <Droplets size={18} />
                    </div>

                    <div>
                        <strong>
                            {ozet.toplamSu}
                        </strong>

                        <span>
                            Bardak su
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}