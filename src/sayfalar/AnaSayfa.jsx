import { useEffect, useMemo, useRef, useState } from "react";
import {
    BellRing,
    CheckCircle2,
    TriangleAlert,
    Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";

import {
    suHedefi,
} from "../veriler/gunlukProgram";

import sabitBeslenmePlani from "../veriler/aktifBeslenmePlani";

import {
    rastgeleMotivasyonMesaji,
} from "../veriler/motivasyonMesajlari";

import {
    bugununNotunuGetir,
} from "../veriler/gunlukNotlar";

import OgunKarti from "../bilesenler/OgunKarti";
import SuTakibi from "../bilesenler/SuTakibi";
import PremiumUstAlan from "../bilesenler/PremiumUstAlan";
import GunlukNotKarti from "../bilesenler/GunlukNotKarti";
import HaftalikIlerleme from "../bilesenler/HaftalikIlerleme";
import GununOzeti from "../bilesenler/GununOzeti";
import MicoVikiAsistan from "../bilesenler/MicoVikiAsistani";
import KarakterKutlamasi from "../bilesenler/KarakterKutlamasi";
import GunSonuKarakterKutlamasi from "../bilesenler/GunSonuKarakterKutlamasi";
import SeviyeKutlamasi from "../bilesenler/SeviyeKutlamasi/SeviyeKutlamasi";
import XPToast from "../components/XPToast/XPToast";
import RozetKutlamasi from "../bilesenler/RozetKutlamasi/RozetKutlamasi";
import GorevKutlamasi from "../bilesenler/GorevKutlamasi/GorevKutlamasi";
import {
    gorevOzetiniGetir,
    gunlukGorevOdulleriniVer,
} from "../servisler/gorevServisi";
import {
    ogunXpKazandir,
    suXpKazandir,
    suHedefiXpKazandir,
    tumOgunlerXpKazandir,
    xpOzetiGetir,
} from "../services/xpService";
import {
    pushAboneligiOlustur,
} from "../servisler/bildirimServisi";

import {
    telefonuKaydet,
} from "../servisler/telefonBildirimServisi";

import {
    gunlukKaydiGuncelle,
    haftalikOzetiGetir,
} from "../servisler/gecmisServisi";
import {
    rozetleriKontrolEt,
} from "../servisler/rozetServisi";
import {
    coinKazandir,
    coinOzetiniGetir,
    ogunCoinKazandir,
    suCoinKazandir,
    suHedefiCoinKazandir,
    tumOgunlerCoinKazandir,
} from "../servisler/coinServisi";

const TAMAMLANANLAR_KEY = "diyet-tamamlanan-ogunler";
const SU_KEY = "diyet-su-miktari";
const TARIH_KEY = "diyet-kayit-tarihi";
const SERI_KEY = "diyet-gunluk-seri";
const SON_TAMAMLANAN_GUN_KEY = "diyet-son-tamamlanan-gun";

function micoUnvaniniGetir(seviye) {
    const guvenliSeviye =
        Number(seviye) || 1;

    if (guvenliSeviye >= 20) {
        return "Büyük Patron";
    }

    if (guvenliSeviye >= 10) {
        return "Evin Patronu";
    }

    if (guvenliSeviye >= 5) {
        return "Baş Denetçi";
    }

    return "Huysuz Denetçi";
}

function vikiUnvaniniGetir(seviye) {
    const guvenliSeviye =
        Number(seviye) || 1;

    if (guvenliSeviye >= 20) {
        return "Mama Kraliçesi";
    }

    if (guvenliSeviye >= 10) {
        return "Tavuk Uzmanı";
    }

    if (guvenliSeviye >= 5) {
        return "Mama Avcısı";
    }

    return "Mama Meraklısı";
}

function bugununAnahtari() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

function birOncekiGunAnahtari() {
    const bugunMetni = bugununAnahtari();

    const [yil, ay, gun] = bugunMetni
        .split("-")
        .map(Number);

    const dun = new Date(
        Date.UTC(
            yil,
            ay - 1,
            gun - 1,
            12,
            0,
            0,
        ),
    );

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(dun);
}

function kayitlariOku() {
    try {
        const bugun = bugununAnahtari();
        const kayitTarihi = localStorage.getItem(TARIH_KEY);

        if (kayitTarihi !== bugun) {
            localStorage.setItem(TARIH_KEY, bugun);
            localStorage.removeItem(TAMAMLANANLAR_KEY);
            localStorage.removeItem(SU_KEY);

            return {
                tamamlananlar: [],
                su: 0,
            };
        }

        const tamamlananlarKaydi = localStorage.getItem(
            TAMAMLANANLAR_KEY,
        );

        const tamamlananlar = tamamlananlarKaydi
            ? JSON.parse(tamamlananlarKaydi)
            : [];

        const suKaydi = Number(
            localStorage.getItem(SU_KEY),
        );

        return {
            tamamlananlar: Array.isArray(tamamlananlar)
                ? tamamlananlar
                : [],

            su: Number.isFinite(suKaydi)
                ? suKaydi
                : 0,
        };
    } catch (error) {
        console.error(
            "Günlük kayıtlar okunamadı:",
            error,
        );

        return {
            tamamlananlar: [],
            su: 0,
        };
    }
}

function saatDakikaDegeri(saat) {
    const [saatDegeri, dakikaDegeri] =
        String(saat || "00:00")
            .split(":")
            .map(Number);

    const guvenliSaat =
        Number.isFinite(saatDegeri)
            ? saatDegeri
            : 0;

    const guvenliDakika =
        Number.isFinite(dakikaDegeri)
            ? dakikaDegeri
            : 0;

    return (
        guvenliSaat * 60 +
        guvenliDakika
    );
}

function istanbulSaatiniGetir() {
    const parcalar = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const saat = Number(
        parcalar.find(
            (parca) => parca.type === "hour",
        )?.value || 0,
    );

    const dakika = Number(
        parcalar.find(
            (parca) => parca.type === "minute",
        )?.value || 0,
    );

    return {
        saat,
        dakika,
        toplamDakika:
            saat * 60 + dakika,
    };
}

function sonrakiOgunuBul(
    tamamlananlar,
    program,
) {
    const { toplamDakika } =
        istanbulSaatiniGetir();

    const guvenliProgram =
        Array.isArray(program)
            ? program
            : [];

    const tamamlanmayanlar =
        guvenliProgram.filter(
            (ogun) =>
                !tamamlananlar.includes(
                    ogun.id,
                ),
        );

    const saateGoreSonraki =
        tamamlanmayanlar.find(
            (ogun) =>
                saatDakikaDegeri(
                    ogun.saat,
                ) >= toplamDakika,
        );

    return (
        saateGoreSonraki ||
        tamamlanmayanlar[0] ||
        null
    );
}
function kalanSureMetni(saat) {
    if (!saat) {
        return "";
    }

    const { toplamDakika } =
        istanbulSaatiniGetir();

    const hedefDakika =
        saatDakikaDegeri(saat);

    const fark =
        hedefDakika - toplamDakika;

    if (fark === 0) {
        return "Öğün saati geldi";
    }

    if (fark < 0) {
        return "Öğün saati geçti";
    }

    const saatFarki =
        Math.floor(fark / 60);

    const dakikaFarki =
        fark % 60;

    if (saatFarki === 0) {
        return `${dakikaFarki} dakika kaldı`;
    }

    if (dakikaFarki === 0) {
        return `${saatFarki} saat kaldı`;
    }

    return `${saatFarki} saat ${dakikaFarki} dakika kaldı`;
}

function bugununTarihiniGetir() {
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());
}

function konfetiPatlat(
    tumProgramTamamlandi = false,
) {
    confetti({
        particleCount:
            tumProgramTamamlandi
                ? 130
                : 80,

        spread:
            tumProgramTamamlandi
                ? 95
                : 70,

        startVelocity:
            tumProgramTamamlandi
                ? 48
                : 36,

        origin: {
            y: 0.72,
        },
    });

    window.setTimeout(() => {
        confetti({
            particleCount:
                tumProgramTamamlandi
                    ? 75
                    : 45,

            angle: 60,
            spread: 58,
            startVelocity: 36,

            origin: {
                x: 0,
                y: 0.78,
            },
        });

        confetti({
            particleCount:
                tumProgramTamamlandi
                    ? 75
                    : 45,

            angle: 120,
            spread: 58,
            startVelocity: 36,

            origin: {
                x: 1,
                y: 0.78,
            },
        });
    }, 160);
}

export default function AnaSayfa() {
    const ilkKayit = useMemo(
        () => kayitlariOku(),
        [],
    );

    const [tamamlananlar, setTamamlananlar] =
        useState(
            ilkKayit.tamamlananlar,
        );

    const [suMiktari, setSuMiktari] =
        useState(
            ilkKayit.su,
        );

    const [motivasyonMesaji] =
        useState(() =>
            rastgeleMotivasyonMesaji(),
        );

    const [gunlukNot] =
        useState(() =>
            bugununNotunuGetir(),
        );

    const [
        haftalikOzet,
        setHaftalikOzet,
    ] = useState(() =>
        haftalikOzetiGetir(),
    );

    const [
        bildirimMesaji,
        setBildirimMesaji,
    ] = useState("");

    const [
        bildirimHatasi,
        setBildirimHatasi,
    ] = useState("");

    const [
        bildirimYukleniyor,
        setBildirimYukleniyor,
    ] = useState(false);

    const [
        tebrikMesaji,
        setTebrikMesaji,
    ] = useState("");

    const [
        gunlukSeri,
        setGunlukSeri,
    ] = useState(() => {
        const kayitliSeri = Number(
            localStorage.getItem(
                SERI_KEY,
            ),
        );

        return Number.isFinite(
            kayitliSeri,
        )
            ? kayitliSeri
            : 0;
    });
    const [
        sonTamamlananOgun,
        setSonTamamlananOgun,
    ] = useState(null);

    const [
        karakterKutlamaTetikleyici,
        setKarakterKutlamaTetikleyici,
    ] = useState(null);

    const [
        gunSonuKutlamaTetikleyici,
        setGunSonuKutlamaTetikleyici,
    ] = useState(null);

    const [xpBildirim, setXpBildirim] = useState({
        gorunur: false,
        xp: 0,
        mesaj: "",
        karakter: "ikisi",
    });
    const [xpOzeti, setXpOzeti] = useState(null);
    const [coinOzeti, setCoinOzeti] = useState(null);

    const [coinHatasi, setCoinHatasi] = useState("");

    const [coinBildirim, setCoinBildirim] = useState({
        gorunur: false,
        coin: 0,
        mesaj: "",
    });

    const [seviyeKutlamasi, setSeviyeKutlamasi] = useState({
        gorunur: false,
        seviye: 1,
        karakter: "ikisi",
    });
    const [rozetKutlamasi, setRozetKutlamasi] = useState({
        gorunur: false,
        rozet: null,
    });
    const [gorevKutlamasi, setGorevKutlamasi] = useState({
        gorunur: false,
        gorev: null,
        toplamXp: 0,
        gorevSayisi: 1,
    });

    const [
        bekleyenSeviyeKutlamasi,
        setBekleyenSeviyeKutlamasi,
    ] = useState(null);

    // Not: Günlük görevlerin kendisi artık ana sayfada gösterilmiyor.
    // Ödül/coin/xp mantığı burada çalışmaya devam ediyor, listenin
    // görsel dökümü Başarılar sekmesine taşındı.
    const [gorevOzeti, setGorevOzeti] = useState(null);

    const [
        aktifBeslenmePlani,
        setAktifBeslenmePlani,
    ] = useState(null);

    const [
        beslenmePlaniYukleniyor,
        setBeslenmePlaniYukleniyor,
    ] = useState(true);

    const [
        beslenmePlaniHatasi,
        setBeslenmePlaniHatasi,
    ] = useState("");

    const sonOgunTimer = useRef(null);

    const [
        zamanGuncelleme,
        setZamanGuncelleme,
    ] = useState(0);

    const tebrikZamanlayiciRef =
        useRef(null);

    const gunlukProgram =
        useMemo(() => {
            const ogunler =
                aktifBeslenmePlani?.ogunler;

            if (!Array.isArray(ogunler)) {
                return [];
            }

            return [...ogunler]
                .sort(
                    (a, b) =>
                        Number(a?.sira || 0) -
                        Number(b?.sira || 0),
                )
                .map((ogun) => {
                    const ogunAdi =
                        ogun?.ogun_adi ||
                        ogun?.ogunAdi ||
                        "Öğün";

                    return {
                        id:
                            ogun?.id ||
                            ogun?.ogun_kodu,

                        ad:
                            ogunAdi,

                        baslik:
                            ogunAdi,

                        kisaBaslik:
                            ogunAdi,

                        isim:
                            ogunAdi,

                        adi:
                            ogunAdi,

                        saat:
                            String(
                                ogun?.saat ||
                                "00:00",
                            ).slice(0, 5),

                        ikon:
                            ogun?.ikon ||
                            "🍽️",

                        aciklama:
                            ogun?.aciklama ||
                            "",

                        detaylar:
                            Array.isArray(
                                ogun?.detaylar,
                            )
                                ? [...ogun.detaylar].sort(
                                    (a, b) =>
                                        Number(
                                            a?.sira ||
                                            0,
                                        ) -
                                        Number(
                                            b?.sira ||
                                            0,
                                        ),
                                )
                                : [],
                    };
                })
                .filter(
                    (ogun) =>
                        Boolean(ogun.id),
                );
        }, [aktifBeslenmePlani]);

    async function aktifPlaniYukle() {
        setBeslenmePlaniYukleniyor(true);
        setBeslenmePlaniHatasi("");

        try {
            setAktifBeslenmePlani(
                sabitBeslenmePlani,
            );
        } catch (error) {
            console.error(
                "Aktif beslenme planı yüklenemedi:",
                error,
            );

            setBeslenmePlaniHatasi(
                error?.message ||
                "Aktif beslenme planı yüklenemedi.",
            );
        } finally {
            setBeslenmePlaniYukleniyor(
                false,
            );
        }
    }

    useEffect(() => {
        aktifPlaniYukle();
    }, []);

    useEffect(() => {
        const zamanlayici =
            window.setInterval(() => {
                setZamanGuncelleme(
                    (mevcut) =>
                        mevcut + 1,
                );
            }, 60_000);

        return () => {
            window.clearInterval(
                zamanlayici,
            );
        };
    }, []);

    useEffect(() => {
        let aktif = true;

        async function xpOzetiniYukle() {
            try {
                const veri =
                    await xpOzetiGetir();

                if (aktif) {
                    setXpOzeti(veri);
                }
            } catch (error) {
                console.error(
                    "XP özeti yüklenemedi:",
                    error,
                );
            }
        }

        xpOzetiniYukle();

        return () => {
            aktif = false;
        };
    }, []);

    useEffect(() => {
        coinOzetiniYenile();
    }, []);

    useEffect(() => {
        gorevOzetiniYenile();
    }, []);

    useEffect(() => {
        return () => {
            if (tebrikZamanlayiciRef.current) {
                window.clearTimeout(
                    tebrikZamanlayiciRef.current,
                );
            }

            if (sonOgunTimer.current) {
                window.clearTimeout(
                    sonOgunTimer.current,
                );
            }
        };
    }, []);

    useEffect(() => {
        const aktifPlanId =
            aktifBeslenmePlani?.id;

        if (!aktifPlanId) {
            return;
        }

        const planKey =
            "diyet-aktif-plan-id";

        const oncekiPlanId =
            localStorage.getItem(
                planKey,
            );

        if (
            oncekiPlanId &&
            oncekiPlanId !== aktifPlanId
        ) {
            setTamamlananlar([]);

            localStorage.removeItem(
                TAMAMLANANLAR_KEY,
            );

            setSonTamamlananOgun(null);
            setTebrikMesaji("");
            setGunSonuKutlamaTetikleyici(
                null,
            );
        }

        localStorage.setItem(
            planKey,
            aktifPlanId,
        );
    }, [aktifBeslenmePlani?.id]);

    const sonrakiOgun = useMemo(
        () =>
            sonrakiOgunuBul(
                tamamlananlar,
                gunlukProgram,
            ),
        [
            tamamlananlar,
            zamanGuncelleme,
            gunlukProgram,
        ],
    );
    const tamamlananSayisi =
        tamamlananlar.length;

    const toplamOgunSayisi =
        gunlukProgram.length;

    const ilerlemeYuzdesi =
        toplamOgunSayisi > 0
            ? Math.round(
                (
                    tamamlananSayisi /
                    toplamOgunSayisi
                ) * 100,
            )
            : 0;

    useEffect(() => {
        localStorage.setItem(
            TAMAMLANANLAR_KEY,
            JSON.stringify(
                tamamlananlar,
            ),
        );
    }, [tamamlananlar]);

    useEffect(() => {
        localStorage.setItem(
            SU_KEY,
            String(suMiktari),
        );
    }, [suMiktari]);

    useEffect(() => {
        gunlukKaydiGuncelle({
            tamamlananOgunler:
                tamamlananlar,

            toplamOgunSayisi:
                gunlukProgram.length,

            suMiktari,
            suHedefi,
        });

        setHaftalikOzet(
            haftalikOzetiGetir(),
        );
    }, [
        tamamlananlar,
        suMiktari,
        gunlukProgram.length,
    ]);

    useEffect(() => {
        const tumOgunlerTamamlandi =
            gunlukProgram.length > 0 &&
            tamamlananlar.length ===
            gunlukProgram.length;

        if (!tumOgunlerTamamlandi) {
            return;
        }

        const bugun =
            bugununAnahtari();

        const sonTamamlananGun =
            localStorage.getItem(
                SON_TAMAMLANAN_GUN_KEY,
            );

        if (
            sonTamamlananGun === bugun
        ) {
            return;
        }

        const dun =
            birOncekiGunAnahtari();

        const mevcutSeri = Number(
            localStorage.getItem(
                SERI_KEY,
            ),
        );

        const yeniSeri =
            sonTamamlananGun === dun
                ? (
                    Number.isFinite(
                        mevcutSeri,
                    )
                        ? mevcutSeri
                        : 0
                ) + 1
                : 1;

        setGunlukSeri(
            yeniSeri,
        );

        localStorage.setItem(
            SERI_KEY,
            String(yeniSeri),
        );

        localStorage.setItem(
            SON_TAMAMLANAN_GUN_KEY,
            bugun,
        );
    }, [
        tamamlananlar,
        gunlukProgram.length,
    ]);

    function tebrikMesajiGoster(
        mesaj,
    ) {
        setTebrikMesaji(
            mesaj,
        );

        if (
            tebrikZamanlayiciRef.current
        ) {
            window.clearTimeout(
                tebrikZamanlayiciRef.current,
            );
        }

        tebrikZamanlayiciRef.current =
            window.setTimeout(() => {
                setTebrikMesaji("");
            }, 4200);
    }

    function xpBildirimiGoster({
        xp,
        mesaj,
        karakter = "ikisi",
    }) {
        if (!xp || xp <= 0) {
            return;
        }

        setXpBildirim({
            gorunur: true,
            xp,
            mesaj,
            karakter,
        });
    }

    function coinBildirimiGoster({
        coin,
        mesaj,
    }) {
        const kazanilanCoin =
            Number(coin) || 0;

        if (kazanilanCoin <= 0) {
            return;
        }

        setCoinBildirim({
            gorunur: true,
            coin: kazanilanCoin,
            mesaj:
                mesaj ||
                "Coin kazanıldı",
        });

        window.setTimeout(() => {
            setCoinBildirim((mevcut) => ({
                ...mevcut,
                gorunur: false,
            }));
        }, 3600);
    }

    async function xpOzetiniYenile() {
        try {
            const veri = await xpOzetiGetir();
            setXpOzeti(veri);
        } catch (error) {
            console.error(
                "XP özeti yenilenemedi:",
                error,
            );
        }
    }

    async function coinOzetiniYenile() {
        try {
            const veri =
                await coinOzetiniGetir();

            setCoinOzeti(veri);
            setCoinHatasi("");

            return veri;
        } catch (error) {
            console.error(
                "Coin özeti yenilenemedi:",
                error,
            );

            setCoinHatasi(
                error?.message ||
                "Coin bilgileri alınamadı.",
            );

            return null;
        }
    }

    async function gorevOzetiniYenile() {
        try {
            const veri =
                await gorevOzetiniGetir();

            setGorevOzeti(veri);

            return veri;
        } catch (error) {
            console.error(
                "Günlük görevler yenilenemedi:",
                error,
            );

            return null;
        }
    }

    async function gorevOdulleriniKontrolEt() {
        try {
            const sonuc =
                await gunlukGorevOdulleriniVer();

            const toplamOdulXp =
                Number(
                    sonuc?.toplam_odul_xp,
                ) || 0;

            const oduller =
                Array.isArray(
                    sonuc?.oduller,
                )
                    ? sonuc.oduller
                    : [];

            const seviyeAtlatanOdul =
                oduller.find(
                    (odul) =>
                        odul?.seviye_atladi,
                );

            let toplamGorevCoini = 0;

            for (const odul of oduller) {
                const coinSonucu =
                    await coinKazandir({
                        islemTuru:
                            "gunluk-gorev-tamamlandi",

                        aciklama:
                            `${odul?.ad || "Günlük görev"} tamamlandı`,

                        kaynakId:
                            odul?.gorev_id ||
                            odul?.kod,

                        benzersizAnahtar:
                            `coin-gunluk-gorev-${bugununAnahtari()}-${odul?.kod || odul?.gorev_id}`,

                        ekVeri: {
                            gorev_id:
                                odul?.gorev_id || null,

                            gorev_kodu:
                                odul?.kod || null,

                            gorev_adi:
                                odul?.ad || null,

                            tarih:
                                bugununAnahtari(),
                        },
                    });

                toplamGorevCoini +=
                    Number(
                        coinSonucu?.kazanilan_coin,
                    ) || 0;
            }

            if (sonuc?.gun_bonusu_verildi) {
                const bonusCoinSonucu =
                    await coinKazandir({
                        islemTuru:
                            "tum-gunluk-gorevler-tamamlandi",

                        aciklama:
                            "Bugünün bütün görevleri tamamlandı",

                        kaynakId:
                            bugununAnahtari(),

                        benzersizAnahtar:
                            `coin-tum-gunluk-gorevler-${bugununAnahtari()}`,

                        ekVeri: {
                            tarih:
                                bugununAnahtari(),

                            tamamlanan_gorev_sayisi:
                                Number(
                                    sonuc?.tamamlanan_gorev_sayisi,
                                ) || 0,

                            toplam_gorev_sayisi:
                                Number(
                                    sonuc?.toplam_gorev_sayisi,
                                ) || 0,
                        },
                    });

                toplamGorevCoini +=
                    Number(
                        bonusCoinSonucu?.kazanilan_coin,
                    ) || 0;
            }

            if (
                toplamOdulXp <= 0 &&
                toplamGorevCoini <= 0
            ) {
                return sonuc;
            }

            await xpOzetiniYenile();
            await coinOzetiniYenile();
            await gorevOzetiniYenile();

            const ilkOdul =
                oduller[0];

            if (toplamOdulXp > 0) {
                xpBildirimiGoster({
                    xp: toplamOdulXp,

                    mesaj:
                        oduller.length > 1
                            ? `${oduller.length} günlük görev tamamlandı`
                            : `${ilkOdul?.ad || "Günlük görev"} tamamlandı`,

                    karakter:
                        ilkOdul?.karakter ||
                        "ikisi",
                });
            }

            if (toplamGorevCoini > 0) {
                coinBildirimiGoster({
                    coin:
                        toplamGorevCoini,

                    mesaj:
                        sonuc?.gun_bonusu_verildi
                            ? "Günlük görev bonusu kazanıldı"
                            : oduller.length > 1
                                ? `${oduller.length} görev coin ödülü`
                                : `${ilkOdul?.ad || "Günlük görev"} coin ödülü`,
                });
            }

            if (toplamOdulXp > 0) {
                setGorevKutlamasi({
                    gorunur: true,

                    gorev:
                        ilkOdul || {
                            ad:
                                "Günlük görev",

                            aciklama:
                                "Bugünkü hedeflerinden birini tamamladın.",

                            karakter:
                                "ikisi",
                        },

                    toplamXp:
                        toplamOdulXp,

                    gorevSayisi:
                        Math.max(
                            oduller.length,
                            1,
                        ),
                });
            }

            if (seviyeAtlatanOdul) {
                setBekleyenSeviyeKutlamasi({
                    seviye:
                        Number(
                            seviyeAtlatanOdul.seviye,
                        ) || 1,

                    karakter:
                        seviyeAtlatanOdul.karakter ||
                        "ikisi",
                });
            }

            konfetiPatlat(
                Boolean(
                    sonuc?.gun_bonusu_verildi ||
                    oduller.length > 1,
                ),
            );

            return {
                ...sonuc,
                toplam_gorev_coini:
                    toplamGorevCoini,
            };
        } catch (error) {
            console.error(
                "Görev ödülleri kontrol edilemedi:",
                error,
            );

            return null;
        }
    }
    async function rozetleriYenidenKontrolEt() {
        try {
            const sonuc =
                await rozetleriKontrolEt();

            const yeniRozetler =
                Array.isArray(
                    sonuc?.kazanilan_rozetler,
                )
                    ? sonuc.kazanilan_rozetler
                    : [];

            const kazanilanRozetXp =
                Number(
                    sonuc?.kazanilan_rozet_xp,
                ) || 0;

            let kazanilanRozetCoin =
                0;

            for (const rozet of yeniRozetler) {
                const rozetKodu =
                    rozet?.kod ||
                    rozet?.slug ||
                    rozet?.id;

                if (!rozetKodu) {
                    continue;
                }

                const coinSonucu =
                    await coinKazandir({
                        islemTuru:
                            "rozet-kazanildi",

                        aciklama:
                            `${rozet?.ad || "Rozet"} kazanıldı`,

                        kaynakId:
                            rozet?.id ||
                            rozetKodu,

                        benzersizAnahtar:
                            `coin-rozet-${rozetKodu}`,

                        ekVeri: {
                            rozet_id:
                                rozet?.id || null,

                            rozet_kodu:
                                rozetKodu,

                            rozet_adi:
                                rozet?.ad || null,

                            tarih:
                                bugununAnahtari(),
                        },
                    });

                kazanilanRozetCoin +=
                    Number(
                        coinSonucu
                            ?.kazanilan_coin,
                    ) || 0;
            }

            if (kazanilanRozetXp > 0) {
                await xpOzetiniYenile();

                xpBildirimiGoster({
                    xp:
                        kazanilanRozetXp,

                    mesaj:
                        yeniRozetler.length > 1
                            ? `${yeniRozetler.length} rozet ödülü kazanıldı`
                            : "Rozet ödülü kazanıldı",

                    karakter:
                        "ikisi",
                });
            }

            if (kazanilanRozetCoin > 0) {
                await coinOzetiniYenile();

                coinBildirimiGoster({
                    coin:
                        kazanilanRozetCoin,

                    mesaj:
                        yeniRozetler.length > 1
                            ? `${yeniRozetler.length} rozet coin ödülü`
                            : `${yeniRozetler[0]?.ad || "Rozet"} coin ödülü`,
                });
            }

            if (yeniRozetler.length === 0) {
                return;
            }

            setRozetKutlamasi({
                gorunur: true,
                rozet:
                    yeniRozetler[0],
            });

            konfetiPatlat(true);
        } catch (error) {
            console.error(
                "Rozet kontrolü başarısız:",
                error,
            );
        }
    }

    async function ogunDurumunuDegistir(
        id,
    ) {
        setTamamlananlar(
            (mevcut) => {
                const zatenTamamlandi =
                    mevcut.includes(id);

                if (
                    zatenTamamlandi
                ) {
                    setTebrikMesaji("");
                    setGunSonuKutlamaTetikleyici(
                        null,
                    );

                    return mevcut.filter(
                        (ogunId) =>
                            ogunId !== id,
                    );
                }

                const yeniListe = [
                    ...mevcut,
                    id,
                ];

                const tamamlananOgun =
                    gunlukProgram.find(
                        (ogun) =>
                            String(ogun.id) === String(id),
                    );

                setSonTamamlananOgun(
                    tamamlananOgun,
                );

                // Miço veya Viki ekranın ortasına gelir.
                const tamamlananOgunAdi =
                    tamamlananOgun?.kisaBaslik ||
                    tamamlananOgun?.baslik ||
                    tamamlananOgun?.ad ||
                    tamamlananOgun?.isim ||
                    tamamlananOgun?.adi ||
                    "Öğün";

                if (sonOgunTimer.current) {
                    window.clearTimeout(
                        sonOgunTimer.current,
                    );
                }

                sonOgunTimer.current =
                    window.setTimeout(() => {
                        setSonTamamlananOgun(null);
                    }, 5000);

                const tumProgramTamamlandi =
                    gunlukProgram.length > 0 &&
                    yeniListe.length ===
                    gunlukProgram.length;

                if (tumProgramTamamlandi) {
                    setGunSonuKutlamaTetikleyici({
                        id: `gun-sonu-${Date.now()}`,
                        tur: "gun-tamamlandi",
                    });
                } else {
                    setKarakterKutlamaTetikleyici({
                        id: `${id}-${Date.now()}`,
                        tur: "ogun-tamamlandi",
                        ogunAdi: tamamlananOgunAdi,
                        ogun: tamamlananOgun,
                    });
                }

                konfetiPatlat(
                    tumProgramTamamlandi,
                );

                if (tumProgramTamamlandi) {
                    tebrikMesajiGoster(
                        "Bugünkü programın tamamlandı. Seninle gurur duyuyorum ❤️",
                    );
                } else {
                    const ogunAdi =
                        tamamlananOgun
                            ?.kisaBaslik ||
                        tamamlananOgun
                            ?.baslik ||
                        "Öğün";

                    tebrikMesajiGoster(
                        `${ogunAdi} tamamlandı. Çok güzel ilerliyorsun 🌸`,
                    );
                }
                window.setTimeout(async () => {
                    try {
                        const xpSonucu = await ogunXpKazandir({
                            ogunId: tamamlananOgun.id,
                            ogunAdi: tamamlananOgunAdi,
                            ogunSaati: tamamlananOgun.saat,
                            tarih: bugununAnahtari(),
                        });

                        const coinSonucu = await ogunCoinKazandir({
                            ogunId: tamamlananOgun.id,
                            ogunAdi: tamamlananOgunAdi,
                            tarih: bugununAnahtari(),
                        });
                        let toplamKazanilanCoin =
                            Number(
                                coinSonucu?.kazanilan_coin,
                            ) || 0;

                        let toplamKazanilanXp =
                            xpSonucu?.kazanilan_xp || 0;

                        if (tumProgramTamamlandi) {
                            const gunSonuXpSonucu =
                                await tumOgunlerXpKazandir({
                                    tamamlananOgunSayisi:
                                        yeniListe.length,

                                    toplamOgunSayisi:
                                        gunlukProgram.length,

                                    tarih:
                                        bugununAnahtari(),
                                });

                            toplamKazanilanXp +=
                                gunSonuXpSonucu?.kazanilan_xp || 0;

                            const gunSonuCoinSonucu =
                                await tumOgunlerCoinKazandir({
                                    tamamlananOgunSayisi:
                                        yeniListe.length,

                                    toplamOgunSayisi:
                                        gunlukProgram.length,

                                    tarih:
                                        bugununAnahtari(),
                                });

                            toplamKazanilanCoin +=
                                Number(
                                    gunSonuCoinSonucu?.kazanilan_coin,
                                ) || 0;
                        }
                        if (toplamKazanilanXp > 0) {
                            xpBildirimiGoster({
                                xp: toplamKazanilanXp,

                                mesaj: tumProgramTamamlandi
                                    ? "Tüm öğünler tamamlandı"
                                    : `${tamamlananOgunAdi} tamamlandı`,

                                karakter: "ikisi",
                            });
                        }
                        await xpOzetiniYenile();

                        coinBildirimiGoster({
                            coin: toplamKazanilanCoin,
                            mesaj: tumProgramTamamlandi
                                ? "Günün coin ödülü kazanıldı"
                                : `${tamamlananOgunAdi} coin ödülü`,
                        });

                        await coinOzetiniYenile();
                        await gorevOzetiniYenile();
                        await gorevOdulleriniKontrolEt();
                        await rozetleriYenidenKontrolEt();

                        if (xpSonucu?.seviye_atladi) {
                            setSeviyeKutlamasi({
                                gorunur: true,
                                seviye: xpSonucu.seviye,
                                karakter: "ikisi",
                            });

                            konfetiPatlat(true);
                        }
                    } catch (xpError) {
                        console.error(
                            "Öğün XP işlemi başarısız:",
                            xpError,
                        );
                    }
                }, 0);

                return yeniListe;
            },
        );
    }

    async function suArtir() {
        if (suMiktari >= suHedefi) {
            return;
        }

        const yeniMiktar = Math.min(
            suMiktari + 1,
            suHedefi,
        );

        const hedefTamamlandi =
            yeniMiktar === suHedefi;

        setSuMiktari(yeniMiktar);

        setKarakterKutlamaTetikleyici({
            id: `su-${yeniMiktar}-${Date.now()}`,
            tur: hedefTamamlandi
                ? "su-hedefi-tamamlandi"
                : "su-icildi",
            suMiktari: yeniMiktar,
            suHedefi,
        });

        if (hedefTamamlandi) {
            konfetiPatlat(false);

            tebrikMesajiGoster(
                "Bugünkü su hedefini tamamladın. Harikasın 💧",
            );
        }

        try {
            let toplamKazanilanXp = 0;
            let seviyeAtlamaSonucu = null;

            const suXpSonucu =
                await suXpKazandir({
                    bardakSayisi: yeniMiktar,
                    hedef: suHedefi,
                    tarih: bugununAnahtari(),
                });

            const suCoinSonucu =
                await suCoinKazandir({
                    bardakSayisi: yeniMiktar,
                    hedef: suHedefi,
                    tarih: bugununAnahtari(),
                });

            let toplamKazanilanCoin =
                Number(
                    suCoinSonucu?.kazanilan_coin,
                ) || 0;

            toplamKazanilanXp +=
                suXpSonucu?.kazanilan_xp || 0;

            if (suXpSonucu?.seviye_atladi) {
                seviyeAtlamaSonucu =
                    suXpSonucu;
            }

            if (hedefTamamlandi) {
                const hedefXpSonucu =
                    await suHedefiXpKazandir({
                        bardakSayisi:
                            yeniMiktar,
                        hedef: suHedefi,
                        tarih:
                            bugununAnahtari(),
                    });

                const hedefCoinSonucu =
                    await suHedefiCoinKazandir({
                        bardakSayisi: yeniMiktar,
                        hedef: suHedefi,
                        tarih: bugununAnahtari(),
                    });

                toplamKazanilanCoin +=
                    Number(
                        hedefCoinSonucu?.kazanilan_coin,
                    ) || 0;

                toplamKazanilanXp +=
                    hedefXpSonucu
                        ?.kazanilan_xp || 0;

                if (
                    hedefXpSonucu
                        ?.seviye_atladi
                ) {
                    seviyeAtlamaSonucu =
                        hedefXpSonucu;
                }
            }

            if (toplamKazanilanXp > 0) {
                xpBildirimiGoster({
                    xp: toplamKazanilanXp,
                    mesaj: hedefTamamlandi
                        ? "Su hedefi tamamlandı"
                        : `${yeniMiktar}. bardak su içildi`,
                    karakter: "viki",
                });
            }

            await xpOzetiniYenile();

            coinBildirimiGoster({
                coin: toplamKazanilanCoin,
                mesaj: hedefTamamlandi
                    ? "Su hedefi coin ödülü"
                    : `${yeniMiktar}. bardak su coin ödülü`,
            });

            await coinOzetiniYenile();
            await gorevOzetiniYenile();
            await gorevOdulleriniKontrolEt();
            await rozetleriYenidenKontrolEt();

            if (seviyeAtlamaSonucu) {
                setSeviyeKutlamasi({
                    gorunur: true,
                    seviye:
                        seviyeAtlamaSonucu
                            .seviye,
                    karakter: "viki",
                });

                konfetiPatlat(true);
            }
        } catch (xpError) {
            console.error(
                "Su XP işlemi başarısız:",
                xpError,
            );
        }
    }

    function suAzalt() {
        setSuMiktari(
            (mevcut) =>
                Math.max(
                    mevcut - 1,
                    0,
                ),
        );
    }

    async function anaSayfadanBildirimAc() {
        setBildirimMesaji("");
        setBildirimHatasi("");
        setBildirimYukleniyor(
            true,
        );

        try {
            const pushAboneligi =
                await pushAboneligiOlustur();

            await telefonuKaydet(
                pushAboneligi,
            );

            setBildirimMesaji(
                "Bildirimler hazır. Öğün saatlerinde bu telefona hatırlatma gelecek.",
            );
        } catch (error) {
            console.error(
                "Bildirim açma hatası:",
                error,
            );

            setBildirimHatasi(
                error?.message ||
                "Bildirimler açılırken beklenmeyen bir hata oluştu.",
            );
        } finally {
            setBildirimYukleniyor(
                false,
            );
        }
    }

    return (
        <div className="ana-sayfa">
            <KarakterKutlamasi
                tetikleyici={
                    karakterKutlamaTetikleyici
                }
                sure={5000}
            />

            <GunSonuKarakterKutlamasi
                tetikleyici={
                    gunSonuKutlamaTetikleyici
                }
                gunlukSeri={gunlukSeri}
            />
            <XPToast
                gorunur={xpBildirim.gorunur}
                xp={xpBildirim.xp}
                mesaj={xpBildirim.mesaj}
                karakter={xpBildirim.karakter}
                onKapat={() =>
                    setXpBildirim((mevcut) => ({
                        ...mevcut,
                        gorunur: false,
                    }))
                }
            />

            {coinBildirim.gorunur && (
                <div className="coin-bildirimi">
                    <div className="coin-bildirimi-ikon">
                        🪙
                    </div>

                    <div>
                        <strong>
                            +{coinBildirim.coin} Coin
                        </strong>

                        <span>
                            {coinBildirim.mesaj}
                        </span>
                    </div>
                </div>
            )}
            <SeviyeKutlamasi
                gorunur={seviyeKutlamasi.gorunur}
                seviye={seviyeKutlamasi.seviye}
                karakter={seviyeKutlamasi.karakter}
                onKapat={() =>
                    setSeviyeKutlamasi((mevcut) => ({
                        ...mevcut,
                        gorunur: false,
                    }))
                }
            />
            <RozetKutlamasi
                gorunur={rozetKutlamasi.gorunur}
                rozet={rozetKutlamasi.rozet}
                onKapat={() =>
                    setRozetKutlamasi({
                        gorunur: false,
                        rozet: null,
                    })
                }
            />
            <GorevKutlamasi
                gorunur={gorevKutlamasi.gorunur}
                gorev={gorevKutlamasi.gorev}
                toplamXp={gorevKutlamasi.toplamXp}
                gorevSayisi={gorevKutlamasi.gorevSayisi}
                onKapat={() => {
                    setGorevKutlamasi({
                        gorunur: false,
                        gorev: null,
                        toplamXp: 0,
                        gorevSayisi: 1,
                    });

                    if (bekleyenSeviyeKutlamasi) {
                        const kutlama =
                            bekleyenSeviyeKutlamasi;

                        setBekleyenSeviyeKutlamasi(
                            null,
                        );

                        window.setTimeout(() => {
                            setSeviyeKutlamasi({
                                gorunur: true,
                                seviye:
                                    kutlama.seviye,
                                karakter:
                                    kutlama.karakter,
                            });

                            konfetiPatlat(true);
                        }, 250);
                    }
                }}
            />
            {/*
              Üst alan artık coin bakiyesini de taşıyor (coinBakiyesi prop'u).
              PremiumUstAlan bileşeninde bu değeri küçük bir rozet olarak
              (örn. kalp ikonunun yanında "🪙 10") göstermen yeterli;
              ayrı büyük bir coin kartına gerek kalmadı.
            */}
            <PremiumUstAlan
                tarih={
                    bugununTarihiniGetir()
                }
                motivasyonMesaji={
                    motivasyonMesaji
                }
                ilerlemeYuzdesi={
                    ilerlemeYuzdesi
                }
                tamamlananSayisi={
                    tamamlananSayisi
                }
                toplamOgunSayisi={
                    toplamOgunSayisi
                }
                gunlukSeri={
                    gunlukSeri
                }
                sonrakiOgun={
                    sonrakiOgun
                }
                kalanSure={
                    sonrakiOgun
                        ? kalanSureMetni(
                            sonrakiOgun.saat,
                        )
                        : ""
                }
                coinBakiyesi={
                    coinOzeti?.mevcut_coin || 0
                }
            />

            {xpOzeti && (
                <section className="xp-ozet-karti">
                    <div className="xp-ozet-ust">
                        <div>
                            <span className="mini-baslik">
                                Seviye ilerlemesi
                            </span>

                            <h2>
                                Seviye {xpOzeti.seviye}
                            </h2>
                        </div>

                        <div className="xp-toplam-deger">
                            <strong>
                                {xpOzeti.toplam_xp}
                            </strong>

                            <span>XP</span>
                        </div>
                    </div>

                    <div className="xp-ilerleme-bilgisi">
                        <span>
                            {xpOzeti.mevcut_seviye_baslangic_xp} XP
                        </span>

                        <span>
                            {xpOzeti.sonraki_seviye_xp} XP
                        </span>
                    </div>

                    <div className="xp-ilerleme-cubugu">
                        <div
                            className="xp-ilerleme-dolgu"
                            style={{
                                width: `${Math.min(
                                    Math.max(
                                        Number(
                                            xpOzeti.seviye_ilerleme_yuzdesi,
                                        ) || 0,
                                        0,
                                    ),
                                    100,
                                )}%`,
                            }}
                        />
                    </div>

                    <div className="xp-ozet-alt">
                        <span>
                            Bugün +{xpOzeti.bugunku_xp} XP
                        </span>

                        <span>
                            Sonraki seviyeye{" "}
                            {xpOzeti.sonraki_seviyeye_kalan_xp} XP
                        </span>
                    </div>
                </section>
            )}

            {/*
              Beslenme planı ve su takibi artık ana sayfanın en görünür
              bölümü: üst alan ve seviye kartından hemen sonra geliyor.
            */}
            <section className="bolum">
                <div className="bolum-baslik">
                    <div>
                        <span className="mini-baslik">
                            Beslenme planı
                        </span>

                        <h2>
                            Bugünkü Öğünler
                        </h2>
                    </div>

                    <span className="ogun-sayisi">
                        {tamamlananSayisi}
                        {" / "}
                        {toplamOgunSayisi}
                    </span>
                </div>

                {beslenmePlaniYukleniyor && (
                    <div className="aktif-plan-durum-karti">
                        <strong>
                            Beslenme planın yükleniyor...
                        </strong>

                        <span>
                            Aktif planındaki öğünler hazırlanıyor.
                        </span>
                    </div>
                )}

                {!beslenmePlaniYukleniyor &&
                    beslenmePlaniHatasi && (
                        <div className="aktif-plan-durum-karti hata">
                            <strong>
                                Beslenme planı yüklenemedi
                            </strong>

                            <span>
                                {beslenmePlaniHatasi}
                            </span>

                            <button
                                type="button"
                                onClick={
                                    aktifPlaniYukle
                                }
                            >
                                Tekrar dene
                            </button>
                        </div>
                    )}

                {!beslenmePlaniYukleniyor &&
                    !beslenmePlaniHatasi &&
                    !aktifBeslenmePlani && (
                        <div className="aktif-plan-durum-karti">
                            <strong>
                                Aktif beslenme planı yok
                            </strong>

                            <span>
                                Profil → Beslenme Planlarım bölümünden
                                PDF yükleyip bir planı aktif yapmalısın.
                            </span>
                        </div>
                    )}

                {!beslenmePlaniYukleniyor &&
                    !beslenmePlaniHatasi &&
                    aktifBeslenmePlani &&
                    gunlukProgram.length === 0 && (
                        <div className="aktif-plan-durum-karti">
                            <strong>
                                Bu planda öğün bulunmuyor
                            </strong>

                            <span>
                                Planı düzenleyerek en az bir öğün eklemelisin.
                            </span>
                        </div>
                    )}

                <div className="ogun-listesi">
                    {gunlukProgram.map(
                        (ogun) => (
                            <OgunKarti
                                key={ogun.id}
                                ogun={ogun}
                                tamamlandi={tamamlananlar.includes(
                                    ogun.id,
                                )}
                                onToggle={() =>
                                    ogunDurumunuDegistir(ogun.id)
                                }
                            />
                        ),
                    )}
                </div>
            </section>

            <SuTakibi
                miktar={suMiktari}
                hedef={suHedefi}
                onArtir={suArtir}
                onAzalt={suAzalt}
            />

            {xpOzeti && (
                <section className="karakter-seviye-alani">
                    <article className="karakter-seviye-karti karakter-seviye-karti--mico">
                        <div className="karakter-seviye-gorsel">
                            <img
                                src="/karakterler/mico-kizgin.png"
                                alt="Miço"
                            />
                        </div>

                        <div className="karakter-seviye-icerik">
                            <span>Miço</span>

                            <h3>
                                Seviye {xpOzeti.mico_seviye}
                            </h3>

                            <p>
                                {micoUnvaniniGetir(
                                    xpOzeti.mico_seviye,
                                )}
                            </p>

                            <strong>
                                {xpOzeti.mico_xp} XP
                            </strong>
                        </div>
                    </article>

                    <article className="karakter-seviye-karti karakter-seviye-karti--viki">
                        <div className="karakter-seviye-gorsel">
                            <img
                                src="/karakterler/viki-mama.png"
                                alt="Viki"
                            />
                        </div>

                        <div className="karakter-seviye-icerik">
                            <span>Viki</span>

                            <h3>
                                Seviye {xpOzeti.viki_seviye}
                            </h3>

                            <p>
                                {vikiUnvaniniGetir(
                                    xpOzeti.viki_seviye,
                                )}
                            </p>

                            <strong>
                                {xpOzeti.viki_xp} XP
                            </strong>
                        </div>
                    </article>
                </section>
            )}

            <MicoVikiAsistan
                tamamlananOgun={tamamlananSayisi}
                toplamOgun={toplamOgunSayisi}
                suMiktari={suMiktari}
                suHedefi={suHedefi}
                gunlukSeri={gunlukSeri}
                sonrakiOgun={sonrakiOgun}
                kalanSure={
                    sonrakiOgun
                        ? kalanSureMetni(
                            sonrakiOgun.saat,
                        )
                        : ""
                }
                sonTamamlananOgun={
                    sonTamamlananOgun
                }
            />
            <GununOzeti
                tamamlananOgun={tamamlananSayisi}
                toplamOgun={toplamOgunSayisi}
                suMiktari={suMiktari}
                suHedefi={suHedefi}
                gunlukSeri={gunlukSeri}
            />

            <GunlukNotKarti
                not={gunlukNot}
            />

            <HaftalikIlerleme
                ozet={haftalikOzet}
            />

            {tebrikMesaji && (
                <section className="tebrik-bildirimi">
                    <div className="tebrik-ikon">
                        <Trophy
                            size={21}
                        />
                    </div>

                    <div>
                        <strong>
                            Harika gidiyorsun
                        </strong>

                        <span>
                            {tebrikMesaji}
                        </span>
                    </div>
                </section>
            )}

            <section className="bildirim-karti">
                <div className="bildirim-ikon">
                    <BellRing
                        size={23}
                    />
                </div>

                <div className="bildirim-metin">
                    <strong>
                        Bildirimleri aç
                    </strong>

                    <span>
                        Öğün saatlerini
                        kaçırma
                    </span>
                </div>

                <button
                    type="button"
                    onClick={
                        anaSayfadanBildirimAc
                    }
                    disabled={
                        bildirimYukleniyor
                    }
                >
                    {bildirimYukleniyor
                        ? "Açılıyor..."
                        : "Aç"}
                </button>
            </section>

            {bildirimMesaji && (
                <section className="bildirim-uyari basarili">
                    <CheckCircle2
                        size={19}
                    />

                    <div>
                        <strong>
                            Başarılı
                        </strong>

                        <span>
                            {
                                bildirimMesaji
                            }
                        </span>
                    </div>
                </section>
            )}

            {bildirimHatasi && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert
                        size={19}
                    />

                    <div>
                        <strong>
                            Bildirim açılamadı
                        </strong>

                        <span>
                            {
                                bildirimHatasi
                            }
                        </span>
                    </div>
                </section>
            )}
        </div>
    );
}