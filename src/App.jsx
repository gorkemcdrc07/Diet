import {
    useEffect,
    useState,
} from "react";

import {
    Heart,
    Sparkles,
} from "lucide-react";

import AnaSayfa from "./sayfalar/AnaSayfa";
import ProgramSayfasi from "./sayfalar/ProgramSayfasi";
import IstatistiklerSayfasi from "./sayfalar/IstatistiklerSayfasi";
import BildirimAyarlari from "./sayfalar/BildirimAyarlari";
import KurulumRehberi from "./sayfalar/KurulumRehberi";
import Karakterler from "./sayfalar/Karakterler";
import GirisSayfasi from "./sayfalar/GirisSayfasi";

import AltMenu from "./bilesenler/AltMenu";
import TemaButonu from "./bilesenler/TemaButonu";
import BasarilarSayfasi from "./sayfalar/BasarilarSayfasi";
import ProfilSayfasi from "./sayfalar/ProfilSayfasi";
import MagazaSayfasi from "./sayfalar/MagazaSayfasi";
import BeslenmePlanlariSayfasi from "./sayfalar/BeslenmePlanlariSayfasi";

import {
    aktifOturumuGetir,
    cikisYap,
    oturumDegisikliginiDinle,
} from "./servisler/authServisi";

import "./App.css";

const AKTIF_SAYFA_KEY =
    "diyet-aktif-sayfa";

const SPLASH_GOSTERILDI_KEY =
    "diyet-splash-gosterildi";

const TEMA_KEY =
    "diyet-tema";

const GECERLI_SAYFALAR = [
    "ana-sayfa",
    "program",
    "basarilar",
    "karakterler",
    "profil",
    "magaza",
    "beslenme-planlari",

    // Bunlar artık gizli sayfalar.
    "istatistikler",
    "bildirimler",
    "kurulum",
];

const GECERLI_TEMALAR = [
    "acik",
    "koyu",
    "sistem",
];

function kayitliSayfayiGetir() {
    const kayitliSayfa =
        localStorage.getItem(
            AKTIF_SAYFA_KEY,
        );

    return GECERLI_SAYFALAR.includes(
        kayitliSayfa,
    )
        ? kayitliSayfa
        : "ana-sayfa";
}

function kayitliTemayiGetir() {
    const kayitliTema =
        localStorage.getItem(
            TEMA_KEY,
        );

    return GECERLI_TEMALAR.includes(
        kayitliTema,
    )
        ? kayitliTema
        : "sistem";
}

function gercekTemayiGetir(
    seciliTema,
) {
    if (seciliTema !== "sistem") {
        return seciliTema;
    }

    return window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches
        ? "koyu"
        : "acik";
}

function AcilisEkrani({
    kapanmayaBasladi,
}) {
    return (
        <div
            className={[
                "acilis-ekrani",
                kapanmayaBasladi
                    ? "acilis-ekrani-kapaniyor"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="acilis-isik acilis-isik-bir" />
            <div className="acilis-isik acilis-isik-iki" />
            <div className="acilis-isik acilis-isik-uc" />

            <div className="acilis-icerik">
                <div className="acilis-logo">
                    <Heart
                        size={48}
                        strokeWidth={1.8}
                        fill="currentColor"
                    />

                    <Sparkles
                        className="acilis-parilti acilis-parilti-bir"
                        size={24}
                    />

                    <Sparkles
                        className="acilis-parilti acilis-parilti-iki"
                        size={17}
                    />
                </div>

                <span className="acilis-mini-baslik">
                    Senin için hazırlandı
                </span>

                <h1>Güzelim</h1>

                <p>
                    Bugün de kendin için güzel bir
                    adım atıyorsun.
                </p>

                <div className="acilis-yukleniyor">
                    <span />
                </div>
            </div>

            <div className="acilis-alt-metin">
                <Heart
                    size={13}
                    fill="currentColor"
                />

                Sevgiyle hazırlandı
            </div>
        </div>
    );
}

function OturumYukleniyor() {
    return (
        <div className="acilis-ekrani">
            <div className="acilis-icerik">
                <div className="acilis-logo">
                    <Heart
                        size={46}
                        fill="currentColor"
                    />
                </div>

                <h1>Hazırlanıyor</h1>

                <p>
                    Hesabın ve ilerlemen kontrol
                    ediliyor.
                </p>

                <div className="acilis-yukleniyor">
                    <span />
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [
        aktifSayfa,
        setAktifSayfa,
    ] = useState(() =>
        kayitliSayfayiGetir(),
    );

    const [
        seciliTema,
        setSeciliTema,
    ] = useState(() =>
        kayitliTemayiGetir(),
    );

    const [
        gercekTema,
        setGercekTema,
    ] = useState(() =>
        gercekTemayiGetir(
            kayitliTemayiGetir(),
        ),
    );

    const [
        oturum,
        setOturum,
    ] = useState(null);

    const [
        oturumKontrolEdiliyor,
        setOturumKontrolEdiliyor,
    ] = useState(true);

    const [
        cikisYapiliyor,
        setCikisYapiliyor,
    ] = useState(false);

    const [
        splashGorunuyor,
        setSplashGorunuyor,
    ] = useState(false);

    const [
        splashKapaniyor,
        setSplashKapaniyor,
    ] = useState(false);

    useEffect(() => {
        let aktif = true;

        async function oturumuKontrolEt() {
            try {
                const mevcutOturum =
                    await aktifOturumuGetir();

                if (!aktif) {
                    return;
                }

                setOturum(mevcutOturum);

                if (
                    mevcutOturum &&
                    sessionStorage.getItem(
                        SPLASH_GOSTERILDI_KEY,
                    ) !== "true"
                ) {
                    setSplashGorunuyor(true);
                }
            } catch (error) {
                console.error(
                    "Başlangıç oturum kontrolü başarısız:",
                    error,
                );

                if (aktif) {
                    setOturum(null);
                }
            } finally {
                if (aktif) {
                    setOturumKontrolEdiliyor(
                        false,
                    );
                }
            }
        }

        oturumuKontrolEt();

        const dinlemeyiBirak =
            oturumDegisikliginiDinle(
                ({ session }) => {
                    if (!aktif) {
                        return;
                    }

                    setOturum(session);
                    setOturumKontrolEdiliyor(false);

                    if (session) {
                        setAktifSayfa(
                            "ana-sayfa",
                        );

                        if (
                            sessionStorage.getItem(
                                SPLASH_GOSTERILDI_KEY,
                            ) !== "true"
                        ) {
                            setSplashKapaniyor(false);
                            setSplashGorunuyor(true);
                        }
                    } else {
                        setSplashGorunuyor(false);
                        setSplashKapaniyor(false);
                    }
                },
            );

        return () => {
            aktif = false;
            dinlemeyiBirak?.();
        };
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            gercekTema,
        );
    }, [gercekTema]);

    useEffect(() => {
        localStorage.setItem(
            TEMA_KEY,
            seciliTema,
        );

        setGercekTema(
            gercekTemayiGetir(
                seciliTema,
            ),
        );

        if (seciliTema !== "sistem") {
            return undefined;
        }

        const medyaSorgusu =
            window.matchMedia(
                "(prefers-color-scheme: dark)",
            );

        function sistemTemasiDegisti(
            event,
        ) {
            setGercekTema(
                event.matches
                    ? "koyu"
                    : "acik",
            );
        }

        medyaSorgusu.addEventListener(
            "change",
            sistemTemasiDegisti,
        );

        return () => {
            medyaSorgusu.removeEventListener(
                "change",
                sistemTemasiDegisti,
            );
        };
    }, [seciliTema]);

    useEffect(() => {
        if (!splashGorunuyor) {
            return undefined;
        }

        const kapanmaZamanlayicisi =
            window.setTimeout(() => {
                setSplashKapaniyor(true);
            }, 1600);

        const kaldirmaZamanlayicisi =
            window.setTimeout(() => {
                setSplashGorunuyor(false);

                sessionStorage.setItem(
                    SPLASH_GOSTERILDI_KEY,
                    "true",
                );
            }, 2050);

        return () => {
            window.clearTimeout(
                kapanmaZamanlayicisi,
            );

            window.clearTimeout(
                kaldirmaZamanlayicisi,
            );
        };
    }, [splashGorunuyor]);

    useEffect(() => {
        localStorage.setItem(
            AKTIF_SAYFA_KEY,
            aktifSayfa,
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [aktifSayfa]);

    function sayfaGetir() {
        switch (aktifSayfa) {
            case "program":
                return <ProgramSayfasi />;

            case "magaza":
                return <MagazaSayfasi />;

            case "beslenme-planlari":
                return (
                    <BeslenmePlanlariSayfasi
                        onPlanDuzenle={(planId) => {
                            localStorage.setItem(
                                "duzenlenecek-beslenme-plani",
                                planId,
                            );

                            console.log(
                                "Düzenlenecek plan:",
                                planId,
                            );
                        }}
                    />
                );

            case "istatistikler":
                return <IstatistiklerSayfasi />;

            case "basarilar":
                return <BasarilarSayfasi />;

            case "karakterler":
                return <Karakterler />;

            case "profil":
                return (
                    <ProfilSayfasi
                        tema={seciliTema}
                        onTemaDegistir={setSeciliTema}
                        onSayfaDegistir={sayfayiDegistir}
                    />
                );

            case "bildirimler":
                return <BildirimAyarlari />;

            case "kurulum":
                return (
                    <div className="standart-sayfa">
                        <KurulumRehberi />

                        <TemaButonu
                            tema={seciliTema}
                            onTemaDegistir={setSeciliTema}
                        />
                    </div>
                );

            case "ana-sayfa":
            default:
                return <AnaSayfa />;
        }
    }
    function sayfayiDegistir(
        yeniSayfa,
    ) {
        if (
            !GECERLI_SAYFALAR.includes(
                yeniSayfa,
            )
        ) {
            return;
        }

        setAktifSayfa(yeniSayfa);
    }

    async function oturumuKapat() {
        if (cikisYapiliyor) {
            return;
        }

        setCikisYapiliyor(true);

        try {
            await cikisYap();

            sessionStorage.removeItem(
                SPLASH_GOSTERILDI_KEY,
            );

            setOturum(null);
        } catch (error) {
            console.error(
                "Çıkış işlemi başarısız:",
                error,
            );
        } finally {
            setCikisYapiliyor(false);
        }
    }

    if (oturumKontrolEdiliyor) {
        return <OturumYukleniyor />;
    }

    if (!oturum?.user) {
        return <GirisSayfasi />;
    }

    return (
        <>
            <div
                className={[
                    "uygulama",
                    splashGorunuyor
                        ? "uygulama-hazirlaniyor"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <main className="uygulama-icerik">
                    {sayfaGetir()}
                </main>

                <AltMenu
                    aktifSayfa={aktifSayfa}
                    onSayfaDegistir={
                        sayfayiDegistir
                    }
                />
            </div>

            {splashGorunuyor && (
                <AcilisEkrani
                    kapanmayaBasladi={
                        splashKapaniyor
                    }
                />
            )}
        </>
    );
}