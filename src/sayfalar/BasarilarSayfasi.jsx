import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Award,
    CheckCircle2,
    LockKeyhole,
    RefreshCw,
    Sparkles,
    Trophy,
} from "lucide-react";

import {
    kazanilanRozetleriGetir,
    tumRozetleriGetir,
} from "../servisler/rozetServisi";

import "./BasarilarSayfasi.css";

export default function BasarilarSayfasi() {
    const [tumRozetler, setTumRozetler] =
        useState([]);

    const [
        kazanilanRozetler,
        setKazanilanRozetler,
    ] = useState([]);

    const [yukleniyor, setYukleniyor] =
        useState(true);

    const [hata, setHata] =
        useState("");

    async function rozetleriYukle() {
        setYukleniyor(true);
        setHata("");

        try {
            const [
                rozetListesi,
                kazanilanListe,
            ] = await Promise.all([
                tumRozetleriGetir(),
                kazanilanRozetleriGetir(),
            ]);

            setTumRozetler(
                Array.isArray(rozetListesi)
                    ? rozetListesi
                    : [],
            );

            setKazanilanRozetler(
                Array.isArray(kazanilanListe)
                    ? kazanilanListe
                    : [],
            );
        } catch (error) {
            console.error(
                "Başarılar yüklenemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Başarılar yüklenemedi.",
            );
        } finally {
            setYukleniyor(false);
        }
    }

    useEffect(() => {
        rozetleriYukle();
    }, []);

    const kazanilanRozetIdleri =
        useMemo(() => {
            return new Set(
                kazanilanRozetler
                    .map(
                        (kayit) =>
                            kayit?.rozet?.id,
                    )
                    .filter(Boolean),
            );
        }, [kazanilanRozetler]);

    const kazanilanSayisi =
        kazanilanRozetIdleri.size;

    const toplamRozetSayisi =
        tumRozetler.length;

    const tamamlanmaYuzdesi =
        toplamRozetSayisi > 0
            ? Math.round(
                (kazanilanSayisi /
                    toplamRozetSayisi) *
                100,
            )
            : 0;

    const toplamXpOdulu =
        kazanilanRozetler.reduce(
            (toplam, kayit) =>
                toplam +
                (Number(
                    kayit?.rozet?.xp_odulu,
                ) || 0),
            0,
        );

    if (yukleniyor) {
        return (
            <main className="basarilar-sayfasi">
                <div className="basarilar-yukleniyor">
                    <span />

                    <strong>
                        Başarıların hazırlanıyor...
                    </strong>
                </div>
            </main>
        );
    }

    return (
        <main className="basarilar-sayfasi">
            <header className="basarilar-baslik">
                <div>
                    <span>
                        Rozet koleksiyonun
                    </span>

                    <h1>Başarılar</h1>

                    <p>
                        Tamamladığın görevler,
                        kazandığın rozetler ve
                        açılmayı bekleyen yeni
                        başarılar burada.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={rozetleriYukle}
                    aria-label="Başarıları yenile"
                >
                    <RefreshCw size={19} />
                </button>
            </header>

            {hata && (
                <section className="basarilar-hata">
                    <strong>
                        Başarılar yüklenemedi
                    </strong>

                    <span>{hata}</span>
                </section>
            )}

            <section className="basarilar-ozet">
                <article>
                    <div className="basarilar-ozet-ikon">
                        <Trophy size={21} />
                    </div>

                    <div>
                        <strong>
                            {kazanilanSayisi}/
                            {toplamRozetSayisi}
                        </strong>

                        <span>
                            Kazanılan rozet
                        </span>
                    </div>
                </article>

                <article>
                    <div className="basarilar-ozet-ikon">
                        <Sparkles size={21} />
                    </div>

                    <div>
                        <strong>
                            %{tamamlanmaYuzdesi}
                        </strong>

                        <span>
                            Tamamlanma
                        </span>
                    </div>
                </article>

                <article>
                    <div className="basarilar-ozet-ikon">
                        <Award size={21} />
                    </div>

                    <div>
                        <strong>
                            {toplamXpOdulu}
                        </strong>

                        <span>
                            Rozet XP’si
                        </span>
                    </div>
                </article>
            </section>

            <section className="basarilar-ilerleme-karti">
                <div>
                    <span>
                        Koleksiyon ilerlemesi
                    </span>

                    <strong>
                        %{tamamlanmaYuzdesi}
                    </strong>
                </div>

                <div className="basarilar-ilerleme">
                    <span
                        style={{
                            width: `${tamamlanmaYuzdesi}%`,
                        }}
                    />
                </div>
            </section>

            <section className="basarilar-rozetler">
                <div className="basarilar-bolum-baslik">
                    <div>
                        <span>
                            Tüm başarılar
                        </span>

                        <h2>Rozetler</h2>
                    </div>

                    <strong>
                        {kazanilanSayisi}/
                        {toplamRozetSayisi}
                    </strong>
                </div>

                <div className="basarilar-grid">
                    {tumRozetler.map(
                        (rozet) => {
                            const kazanildi =
                                kazanilanRozetIdleri.has(
                                    rozet.id,
                                );

                            return (
                                <article
                                    key={rozet.id}
                                    className={[
                                        "basari-rozet-karti",
                                        kazanildi
                                            ? "basari-rozet-karti--acik"
                                            : "basari-rozet-karti--kilitli",
                                    ].join(" ")}
                                >
                                    <div className="basari-rozet-ikon">
                                        <span>
                                            {rozet.ikon ||
                                                "🏅"}
                                        </span>

                                        {kazanildi ? (
                                            <CheckCircle2
                                                size={18}
                                            />
                                        ) : (
                                            <LockKeyhole
                                                size={17}
                                            />
                                        )}
                                    </div>

                                    <div className="basari-rozet-icerik">
                                        <span>
                                            {kazanildi
                                                ? "Kazanıldı"
                                                : "Kilitli"}
                                        </span>

                                        <h3>
                                            {rozet.ad}
                                        </h3>

                                        <p>
                                            {
                                                rozet.aciklama
                                            }
                                        </p>

                                        <div className="basari-rozet-alt">
                                            <strong>
                                                +
                                                {
                                                    rozet.xp_odulu
                                                }{" "}
                                                XP
                                            </strong>

                                            <span>
                                                Hedef:{" "}
                                                {
                                                    rozet.kosul_degeri
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        },
                    )}
                </div>
            </section>
        </main>
    );
}