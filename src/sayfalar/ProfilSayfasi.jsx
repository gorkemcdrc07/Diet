import {
    useEffect,
    useState,
} from "react";

import {
    BarChart3,
    Bell,
    ChevronRight,
    LogOut,
    Moon,
    Palette,
    Salad,
    Smartphone,
    Sun,
    UserRound,
} from "lucide-react";

import {
    aktifKullaniciyiGetir,
    cikisYap,
    profilBilgisiniGetir,
} from "../servisler/authServisi";

import "./ProfilSayfasi.css";

function temaMetniniGetir(tema) {
    switch (tema) {
        case "acik":
            return "Açık tema";

        case "koyu":
            return "Koyu tema";

        case "sistem":
        default:
            return "Sistem teması";
    }
}

function TemaIkonu({ tema }) {
    if (tema === "acik") {
        return <Sun size={20} />;
    }

    if (tema === "koyu") {
        return <Moon size={20} />;
    }

    return <Palette size={20} />;
}

export default function ProfilSayfasi({
    tema,
    onTemaDegistir,
    onSayfaDegistir,
}) {
    const [profil, setProfil] =
        useState(null);

    const [kullanici, setKullanici] =
        useState(null);

    const [yukleniyor, setYukleniyor] =
        useState(true);

    const [hata, setHata] =
        useState("");

    const [
        cikisYapiliyor,
        setCikisYapiliyor,
    ] = useState(false);

    useEffect(() => {
        let aktif = true;

        async function profilYukle() {
            try {
                const [
                    aktifKullanici,
                    profilBilgisi,
                ] = await Promise.all([
                    aktifKullaniciyiGetir(),
                    profilBilgisiniGetir(),
                ]);

                if (!aktif) {
                    return;
                }

                setKullanici(
                    aktifKullanici,
                );

                setProfil(
                    profilBilgisi,
                );
            } catch (error) {
                console.error(
                    "Profil yüklenemedi:",
                    error,
                );

                if (aktif) {
                    setHata(
                        error?.message ||
                        "Profil bilgileri yüklenemedi.",
                    );
                }
            } finally {
                if (aktif) {
                    setYukleniyor(false);
                }
            }
        }

        profilYukle();

        return () => {
            aktif = false;
        };
    }, []);

    function siradakiTemayaGec() {
        const temaSirasi = [
            "sistem",
            "acik",
            "koyu",
        ];

        const mevcutIndex =
            temaSirasi.indexOf(tema);

        const sonrakiTema =
            temaSirasi[
            (mevcutIndex + 1) %
            temaSirasi.length
            ];

        onTemaDegistir?.(
            sonrakiTema,
        );
    }

    async function oturumuKapat() {
        if (cikisYapiliyor) {
            return;
        }

        setCikisYapiliyor(true);

        try {
            await cikisYap();
        } catch (error) {
            console.error(
                "Çıkış yapılamadı:",
                error,
            );

            setHata(
                error?.message ||
                "Çıkış işlemi başarısız oldu.",
            );
        } finally {
            setCikisYapiliyor(false);
        }
    }

    if (yukleniyor) {
        return (
            <main className="profil-sayfasi">
                <div className="profil-yukleniyor">
                    <span />

                    <strong>
                        Profilin hazırlanıyor...
                    </strong>
                </div>
            </main>
        );
    }

    const adSoyad =
        profil?.ad_soyad?.trim() ||
        kullanici?.user_metadata
            ?.ad_soyad?.trim() ||
        "Güzelim";

    const email =
        profil?.email ||
        kullanici?.email ||
        "";

    return (
        <main className="profil-sayfasi">
            <header className="profil-ust-kart">
                <div className="profil-avatar">
                    <UserRound size={30} />
                </div>

                <div className="profil-kimlik">
                    <span>Profil</span>

                    <h1>{adSoyad}</h1>

                    <p>{email}</p>
                </div>
            </header>

            {hata && (
                <section className="profil-hata">
                    {hata}
                </section>
            )}

            <section className="profil-menu-grubu">
                <div className="profil-menu-baslik">
                    <span>
                        Uygulama
                    </span>

                    <h2>
                        Yönetim
                    </h2>
                </div>

                <button
                    type="button"
                    className="profil-menu-satiri"
                    onClick={() =>
                        onSayfaDegistir?.(
                            "beslenme-planlari",
                        )
                    }
                >
                    <span className="profil-menu-ikon">
                        <Salad size={20} />
                    </span>

                    <span className="profil-menu-metin">
                        <strong>
                            Beslenme Planlarım
                        </strong>

                        <small>
                            PDF planlarını,
                            öğünleri ve saatleri
                            yönet
                        </small>
                    </span>

                    <ChevronRight size={18} />
                </button>

                <button
                    type="button"
                    className="profil-menu-satiri"
                    onClick={() =>
                        onSayfaDegistir?.(
                            "istatistikler",
                        )
                    }
                >
                    <span className="profil-menu-ikon">
                        <BarChart3 size={20} />
                    </span>

                    <span className="profil-menu-metin">
                        <strong>
                            İstatistikler
                        </strong>

                        <small>
                            Günlük ve haftalık
                            ilerlemeni incele
                        </small>
                    </span>

                    <ChevronRight size={18} />
                </button>

                <button
                    type="button"
                    className="profil-menu-satiri"
                    onClick={() =>
                        onSayfaDegistir?.(
                            "bildirimler",
                        )
                    }
                >
                    <span className="profil-menu-ikon">
                        <Bell size={20} />
                    </span>

                    <span className="profil-menu-metin">
                        <strong>
                            Bildirimler
                        </strong>

                        <small>
                            Hatırlatmaları ve
                            izinleri yönet
                        </small>
                    </span>

                    <ChevronRight size={18} />
                </button>

                <button
                    type="button"
                    className="profil-menu-satiri"
                    onClick={() =>
                        onSayfaDegistir?.(
                            "kurulum",
                        )
                    }
                >
                    <span className="profil-menu-ikon">
                        <Smartphone size={20} />
                    </span>

                    <span className="profil-menu-metin">
                        <strong>
                            Kurulum
                        </strong>

                        <small>
                            Uygulamayı telefona
                            ekleme adımlarını gör
                        </small>
                    </span>

                    <ChevronRight size={18} />
                </button>

                <button
                    type="button"
                    className="profil-menu-satiri"
                    onClick={
                        siradakiTemayaGec
                    }
                >
                    <span className="profil-menu-ikon">
                        <TemaIkonu
                            tema={tema}
                        />
                    </span>

                    <span className="profil-menu-metin">
                        <strong>
                            Görünüm
                        </strong>

                        <small>
                            {temaMetniniGetir(
                                tema,
                            )}
                        </small>
                    </span>

                    <ChevronRight size={18} />
                </button>
            </section>

            <section className="profil-hesap-grubu">
                <div className="profil-menu-baslik">
                    <span>
                        Hesap
                    </span>

                    <h2>
                        Oturum
                    </h2>
                </div>

                <button
                    type="button"
                    className="profil-cikis-butonu"
                    onClick={
                        oturumuKapat
                    }
                    disabled={
                        cikisYapiliyor
                    }
                >
                    <LogOut size={19} />

                    <span>
                        {cikisYapiliyor
                            ? "Çıkış yapılıyor..."
                            : "Çıkış yap"}
                    </span>
                </button>
            </section>
        </main>
    );
}