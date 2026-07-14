import {
    Award,
    CheckCircle2,
    Crown,
    Droplets,
    Flame,
    Heart,
    LockKeyhole,
    Medal,
    Sparkles,
    Target,
    Trophy,
} from "lucide-react";

import {
    haftalikOzetiGetir,
} from "../servisler/gecmisServisi";

import AylikTakvim from "../bilesenler/AylikTakvim";

const SERI_KEY = "diyet-gunluk-seri";

function yuzdeSinirla(deger) {
    return Math.min(
        100,
        Math.max(
            0,
            Number(deger) || 0,
        ),
    );
}

function tarihEtiketiGetir(tarih) {
    return new Intl.DateTimeFormat("tr-TR", {
        weekday: "short",
        timeZone: "Europe/Istanbul",
    })
        .format(tarih)
        .replace(".", "");
}

function rozetleriGetir({
    seri,
    tamamlananOgun,
    tamamlananGun,
    toplamSu,
}) {
    return [
        {
            id: "ilk-adim",
            baslik: "İlk Adım",
            aciklama:
                "İlk öğününü tamamla.",
            ikon: Sparkles,
            kazanildi:
                tamamlananOgun >= 1,
            ilerleme:
                Math.min(
                    tamamlananOgun,
                    1,
                ),
            hedef: 1,
        },
        {
            id: "ogun-10",
            baslik:
                "Kararlı Başlangıç",
            aciklama:
                "Toplam 10 öğün tamamla.",
            ikon: CheckCircle2,
            kazanildi:
                tamamlananOgun >= 10,
            ilerleme:
                Math.min(
                    tamamlananOgun,
                    10,
                ),
            hedef: 10,
        },
        {
            id: "su-20",
            baslik: "Su Yıldızı",
            aciklama:
                "Toplam 20 bardak su iç.",
            ikon: Droplets,
            kazanildi:
                toplamSu >= 20,
            ilerleme:
                Math.min(
                    toplamSu,
                    20,
                ),
            hedef: 20,
        },
        {
            id: "seri-3",
            baslik:
                "Üç Günlük Seri",
            aciklama:
                "Programı 3 gün art arda tamamla.",
            ikon: Flame,
            kazanildi:
                seri >= 3,
            ilerleme:
                Math.min(
                    seri,
                    3,
                ),
            hedef: 3,
        },
        {
            id: "tam-gun-7",
            baslik:
                "Muhteşem Hafta",
            aciklama:
                "Toplam 7 tam gün tamamla.",
            ikon: Trophy,
            kazanildi:
                tamamlananGun >= 7,
            ilerleme:
                Math.min(
                    tamamlananGun,
                    7,
                ),
            hedef: 7,
        },
        {
            id: "seri-30",
            baslik:
                "İstikrar Kraliçesi",
            aciklama:
                "30 günlük seri oluştur.",
            ikon: Crown,
            kazanildi:
                seri >= 30,
            ilerleme:
                Math.min(
                    seri,
                    30,
                ),
            hedef: 30,
        },
    ];
}

export default function IstatistiklerSayfasi() {
    const haftalikOzet =
        haftalikOzetiGetir();

    const gunlukSeri =
        Number(
            localStorage.getItem(
                SERI_KEY,
            ),
        ) || 0;

    const rozetler =
        rozetleriGetir({
            seri: gunlukSeri,

            tamamlananOgun:
                haftalikOzet
                    .toplamTamamlananOgun,

            tamamlananGun:
                haftalikOzet
                    .tamamlananGunSayisi,

            toplamSu:
                haftalikOzet.toplamSu,
        });

    const kazanilanRozetSayisi =
        rozetler.filter(
            (rozet) =>
                rozet.kazanildi,
        ).length;

    return (
        <div className="istatistikler-sayfasi">
            <header className="istatistikler-baslik">
                <div>
                    <span className="mini-baslik">
                        Gelişim yolculuğun
                    </span>

                    <h1>
                        İstatistikler
                    </h1>

                    <p>
                        Attığın her küçük
                        adım burada güzel bir
                        başarıya dönüşüyor.
                    </p>
                </div>

                <div className="istatistikler-baslik-ikon">
                    <Medal size={25} />
                </div>
            </header>

            <section className="istatistik-hero">
                <div className="istatistik-hero-isik bir" />
                <div className="istatistik-hero-isik iki" />

                <div className="istatistik-hero-ust">
                    <div>
                        <span>
                            Haftalık başarı
                            oranın
                        </span>

                        <strong>
                            %
                            {
                                haftalikOzet
                                    .ortalamaOgunYuzdesi
                            }
                        </strong>
                    </div>

                    <div
                        className="istatistik-hero-halka"
                        style={{
                            "--istatistik-yuzde":
                                `${yuzdeSinirla(
                                    haftalikOzet
                                        .ortalamaOgunYuzdesi,
                                ) *
                                3.6
                                }deg`,
                        }}
                    >
                        <div>
                            <Heart
                                size={22}
                                fill="currentColor"
                            />
                        </div>
                    </div>
                </div>

                <div className="istatistik-hero-alt">
                    <Flame size={17} />

                    <span>
                        {gunlukSeri > 0
                            ? `${gunlukSeri} gündür harika ilerliyorsun.`
                            : "Bugün yeni bir seri başlatabilirsin."}
                    </span>
                </div>
            </section>

            <section className="istatistik-ozet-grid">
                <article className="istatistik-ozet-karti">
                    <div className="istatistik-ozet-ikon pembe">
                        <Target
                            size={20}
                        />
                    </div>

                    <strong>
                        {
                            haftalikOzet
                                .toplamTamamlananOgun
                        }
                    </strong>

                    <span>
                        Tamamlanan öğün
                    </span>
                </article>

                <article className="istatistik-ozet-karti">
                    <div className="istatistik-ozet-ikon mavi">
                        <Droplets
                            size={20}
                        />
                    </div>

                    <strong>
                        {
                            haftalikOzet
                                .toplamSu
                        }
                    </strong>

                    <span>
                        Bardak su
                    </span>
                </article>

                <article className="istatistik-ozet-karti">
                    <div className="istatistik-ozet-ikon mor">
                        <Trophy
                            size={20}
                        />
                    </div>

                    <strong>
                        {
                            haftalikOzet
                                .tamamlananGunSayisi
                        }
                    </strong>

                    <span>
                        Tam gün
                    </span>
                </article>

                <article className="istatistik-ozet-karti">
                    <div className="istatistik-ozet-ikon turuncu">
                        <Flame
                            size={20}
                        />
                    </div>

                    <strong>
                        {gunlukSeri}
                    </strong>

                    <span>
                        Günlük seri
                    </span>
                </article>
            </section>

            <section className="istatistik-panel">
                <div className="istatistik-panel-baslik">
                    <div>
                        <span className="mini-baslik">
                            Son yedi gün
                        </span>

                        <h2>
                            Haftalık Grafiğin
                        </h2>
                    </div>

                    <Award size={21} />
                </div>

                <div className="haftalik-grafik">
                    {haftalikOzet.gunler.map(
                        (gun) => {
                            const yuzde =
                                gun.kayit
                                    ?.ogunYuzdesi ||
                                0;

                            const sutunYuksekligi =
                                yuzde > 0
                                    ? Math.max(
                                        yuzde,
                                        10,
                                    )
                                    : 3;

                            return (
                                <div
                                    key={
                                        gun.tarih
                                    }
                                    className={[
                                        "haftalik-grafik-sutun",

                                        gun.bugun
                                            ? "bugun"
                                            : "",
                                    ]
                                        .filter(
                                            Boolean,
                                        )
                                        .join(
                                            " ",
                                        )}
                                >
                                    <div className="haftalik-grafik-alan">
                                        <div
                                            className="haftalik-grafik-dolgu"
                                            style={{
                                                height:
                                                    `${sutunYuksekligi}%`,
                                            }}
                                        >
                                            {yuzde >
                                                0 && (
                                                    <span>
                                                        %
                                                        {
                                                            yuzde
                                                        }
                                                    </span>
                                                )}
                                        </div>
                                    </div>

                                    <small>
                                        {tarihEtiketiGetir(
                                            gun.tarihNesnesi,
                                        )}
                                    </small>
                                </div>
                            );
                        },
                    )}
                </div>
            </section>

            <AylikTakvim />

            <section className="istatistik-panel">
                <div className="istatistik-panel-baslik">
                    <div>
                        <span className="mini-baslik">
                            Başarı
                            koleksiyonun
                        </span>

                        <h2>
                            Rozetlerin
                        </h2>
                    </div>

                    <span className="rozet-sayaci">
                        {
                            kazanilanRozetSayisi
                        }
                        {" / "}
                        {rozetler.length}
                    </span>
                </div>

                <div className="rozet-listesi">
                    {rozetler.map(
                        (rozet) => {
                            const Ikon =
                                rozet.ikon;

                            const ilerlemeYuzdesi =
                                rozet.hedef >
                                    0
                                    ? Math.round(
                                        (
                                            rozet.ilerleme /
                                            rozet.hedef
                                        ) *
                                        100,
                                    )
                                    : 0;

                            return (
                                <article
                                    key={
                                        rozet.id
                                    }
                                    className={[
                                        "rozet-karti",

                                        rozet.kazanildi
                                            ? "kazanildi"
                                            : "kilitli",
                                    ]
                                        .filter(
                                            Boolean,
                                        )
                                        .join(
                                            " ",
                                        )}
                                >
                                    <div className="rozet-ikon">
                                        {rozet.kazanildi ? (
                                            <Ikon
                                                size={
                                                    23
                                                }
                                            />
                                        ) : (
                                            <LockKeyhole
                                                size={
                                                    20
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="rozet-bilgi">
                                        <div className="rozet-baslik">
                                            <strong>
                                                {
                                                    rozet.baslik
                                                }
                                            </strong>

                                            {rozet.kazanildi && (
                                                <span>
                                                    Kazanıldı
                                                </span>
                                            )}
                                        </div>

                                        <p>
                                            {
                                                rozet.aciklama
                                            }
                                        </p>

                                        {!rozet.kazanildi && (
                                            <>
                                                <div className="rozet-ilerleme">
                                                    <div
                                                        style={{
                                                            width:
                                                                `${yuzdeSinirla(
                                                                    ilerlemeYuzdesi,
                                                                )}%`,
                                                        }}
                                                    />
                                                </div>

                                                <small>
                                                    {
                                                        rozet.ilerleme
                                                    }
                                                    {
                                                        " / "
                                                    }
                                                    {
                                                        rozet.hedef
                                                    }
                                                </small>
                                            </>
                                        )}
                                    </div>
                                </article>
                            );
                        },
                    )}
                </div>
            </section>
        </div>
    );
}