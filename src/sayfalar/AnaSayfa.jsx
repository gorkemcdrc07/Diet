import { useEffect, useMemo, useState } from "react";
import {
    BellRing,
    CheckCircle2,
    ChevronRight,
    Flame,
    Heart,
    Sparkles,
    TriangleAlert,
    Trophy,
} from "lucide-react";

import {
    gunlukProgram,
    suHedefi,
} from "../veriler/gunlukProgram";

import {
    rastgeleMotivasyonMesaji,
} from "../veriler/motivasyonMesajlari";

import OgunKarti from "../bilesenler/OgunKarti";
import SuTakibi from "../bilesenler/SuTakibi";

import {
    pushAboneligiOlustur,
} from "../servisler/bildirimServisi";

import {
    telefonuKaydet,
} from "../servisler/telefonBildirimServisi";

const TAMAMLANANLAR_KEY = "diyet-tamamlanan-ogunler";
const SU_KEY = "diyet-su-miktari";
const TARIH_KEY = "diyet-kayit-tarihi";

function bugununAnahtari() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
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

        const suKaydi = Number(localStorage.getItem(SU_KEY));
        const su = Number.isFinite(suKaydi) ? suKaydi : 0;

        return {
            tamamlananlar: Array.isArray(tamamlananlar)
                ? tamamlananlar
                : [],
            su,
        };
    } catch (error) {
        console.error("Günlük kayıtlar okunamadı:", error);

        return {
            tamamlananlar: [],
            su: 0,
        };
    }
}

function saatDakikaDegeri(saat) {
    const [saatDegeri, dakikaDegeri] = saat
        .split(":")
        .map(Number);

    return saatDegeri * 60 + dakikaDegeri;
}

function istanbulSaatiniGetir() {
    const parcalar = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const saat = Number(
        parcalar.find((parca) => parca.type === "hour")?.value || 0,
    );

    const dakika = Number(
        parcalar.find((parca) => parca.type === "minute")?.value || 0,
    );

    return {
        saat,
        dakika,
        toplamDakika: saat * 60 + dakika,
    };
}

function sonrakiOgunuBul(tamamlananlar) {
    const { toplamDakika } = istanbulSaatiniGetir();

    const tamamlanmayanlar = gunlukProgram.filter(
        (ogun) => !tamamlananlar.includes(ogun.id),
    );

    const saateGoreSonraki = tamamlanmayanlar.find(
        (ogun) =>
            saatDakikaDegeri(ogun.saat) >= toplamDakika,
    );

    return saateGoreSonraki || tamamlanmayanlar[0] || null;
}

function kalanSureMetni(saat) {
    if (!saat) {
        return "";
    }

    const { toplamDakika } = istanbulSaatiniGetir();
    const hedefDakika = saatDakikaDegeri(saat);
    const fark = hedefDakika - toplamDakika;

    if (fark === 0) {
        return "Öğün saati geldi";
    }

    if (fark < 0) {
        return "Öğün saati geçti";
    }

    const saatFarki = Math.floor(fark / 60);
    const dakikaFarki = fark % 60;

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

export default function AnaSayfa() {
    const ilkKayit = useMemo(() => kayitlariOku(), []);

    const [tamamlananlar, setTamamlananlar] = useState(
        ilkKayit.tamamlananlar,
    );

    const [suMiktari, setSuMiktari] = useState(
        ilkKayit.su,
    );

    const [motivasyonMesaji] = useState(() =>
        rastgeleMotivasyonMesaji(),
    );

    const [bildirimMesaji, setBildirimMesaji] = useState("");
    const [bildirimHatasi, setBildirimHatasi] = useState("");
    const [bildirimYukleniyor, setBildirimYukleniyor] =
        useState(false);

    const [zamanGuncelleme, setZamanGuncelleme] =
        useState(0);

    useEffect(() => {
        const zamanlayici = window.setInterval(() => {
            setZamanGuncelleme((mevcut) => mevcut + 1);
        }, 60_000);

        return () => {
            window.clearInterval(zamanlayici);
        };
    }, []);

    const sonrakiOgun = useMemo(
        () => sonrakiOgunuBul(tamamlananlar),
        [tamamlananlar, zamanGuncelleme],
    );

    const tamamlananSayisi = tamamlananlar.length;
    const toplamOgunSayisi = gunlukProgram.length;

    const ilerlemeYuzdesi =
        toplamOgunSayisi > 0
            ? Math.round(
                (tamamlananSayisi / toplamOgunSayisi) * 100,
            )
            : 0;

    useEffect(() => {
        localStorage.setItem(
            TAMAMLANANLAR_KEY,
            JSON.stringify(tamamlananlar),
        );
    }, [tamamlananlar]);

    useEffect(() => {
        localStorage.setItem(
            SU_KEY,
            String(suMiktari),
        );
    }, [suMiktari]);

    function ogunDurumunuDegistir(id) {
        setTamamlananlar((mevcut) => {
            if (mevcut.includes(id)) {
                return mevcut.filter(
                    (ogunId) => ogunId !== id,
                );
            }

            return [...mevcut, id];
        });
    }

    function suArtir() {
        setSuMiktari((mevcut) =>
            Math.min(mevcut + 1, suHedefi),
        );
    }

    function suAzalt() {
        setSuMiktari((mevcut) =>
            Math.max(mevcut - 1, 0),
        );
    }

    async function anaSayfadanBildirimAc() {
        setBildirimMesaji("");
        setBildirimHatasi("");
        setBildirimYukleniyor(true);

        try {
            const pushAboneligi =
                await pushAboneligiOlustur();

            await telefonuKaydet(pushAboneligi);

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
            setBildirimYukleniyor(false);
        }
    }

    return (
        <div className="ana-sayfa">
            <header className="ana-baslik">
                <div>
                    <span className="tarih-yazisi">
                        {bugununTarihiniGetir()}
                    </span>

                    <h1>
                        Günaydın <span>Güzelim</span>
                    </h1>

                    <p>
                        Bugün de kendin için güzel bir adım
                        atıyorsun.
                    </p>
                </div>

                <button
                    type="button"
                    className="kalp-butonu"
                    aria-label="Sevgi"
                >
                    <Heart
                        size={21}
                        fill="currentColor"
                    />
                </button>
            </header>

            <section className="motivasyon-karti">
                <div className="motivasyon-ikon">
                    <Sparkles size={21} />
                </div>

                <div>
                    <span>Günün motivasyonu</span>
                    <p>{motivasyonMesaji}</p>
                </div>
            </section>

            {sonrakiOgun ? (
                <section className="sonraki-ogun-karti">
                    <div className="sonraki-ogun-ust">
                        <span>Sıradaki öğün</span>

                        <div className="canli-durum">
                            <i />
                            Yaklaşıyor
                        </div>
                    </div>

                    <div className="sonraki-ogun-icerik">
                        <div className="sonraki-ogun-emoji">
                            {sonrakiOgun.emoji}
                        </div>

                        <div className="sonraki-ogun-bilgi">
                            <strong>
                                {sonrakiOgun.kisaBaslik}
                            </strong>

                            <span>
                                {sonrakiOgun.saat}
                            </span>

                            <small>
                                {kalanSureMetni(
                                    sonrakiOgun.saat,
                                )}
                            </small>
                        </div>

                        <ChevronRight size={22} />
                    </div>
                </section>
            ) : (
                <section className="tum-ogunler-tamam">
                    <Trophy size={28} />

                    <div>
                        <strong>
                            Bugünkü program tamamlandı
                        </strong>

                        <span>
                            Bugün gösterdiğin çabayla
                            gurur duyuyorum.
                        </span>
                    </div>
                </section>
            )}

            <section className="ilerleme-karti">
                <div className="ilerleme-ust">
                    <div>
                        <span className="mini-baslik">
                            Günlük ilerleme
                        </span>

                        <h2>Bugünkü Programın</h2>
                    </div>

                    <div className="ilerleme-yuzde">
                        %{ilerlemeYuzdesi}
                    </div>
                </div>

                <div className="ilerleme-cubugu">
                    <div
                        className="ilerleme-dolgu"
                        style={{
                            width: `${ilerlemeYuzdesi}%`,
                        }}
                    />
                </div>

                <div className="ilerleme-alt">
                    <span>
                        {tamamlananSayisi} /{" "}
                        {toplamOgunSayisi} öğün
                        tamamlandı
                    </span>

                    <span className="seri-bilgisi">
                        <Flame size={15} />
                        1 günlük seri
                    </span>
                </div>
            </section>

            <section className="bolum">
                <div className="bolum-baslik">
                    <div>
                        <span className="mini-baslik">
                            Beslenme planı
                        </span>

                        <h2>Bugünkü Öğünler</h2>
                    </div>

                    <span className="ogun-sayisi">
                        {toplamOgunSayisi} öğün
                    </span>
                </div>

                <div className="ogun-listesi">
                    {gunlukProgram.map((ogun) => (
                        <OgunKarti
                            key={ogun.id}
                            ogun={ogun}
                            tamamlandi={tamamlananlar.includes(
                                ogun.id,
                            )}
                            onToggle={
                                ogunDurumunuDegistir
                            }
                        />
                    ))}
                </div>
            </section>

            <SuTakibi
                miktar={suMiktari}
                hedef={suHedefi}
                onArtir={suArtir}
                onAzalt={suAzalt}
            />

            <section className="bildirim-karti">
                <div className="bildirim-ikon">
                    <BellRing size={23} />
                </div>

                <div className="bildirim-metin">
                    <strong>
                        Bildirimleri aç
                    </strong>

                    <span>
                        Öğün saatlerini kaçırma
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
                    <CheckCircle2 size={19} />

                    <div>
                        <strong>Başarılı</strong>
                        <span>
                            {bildirimMesaji}
                        </span>
                    </div>
                </section>
            )}

            {bildirimHatasi && (
                <section className="bildirim-uyari hata">
                    <TriangleAlert size={19} />

                    <div>
                        <strong>
                            Bildirim açılamadı
                        </strong>

                        <span>
                            {bildirimHatasi}
                        </span>
                    </div>
                </section>
            )}
        </div>
    );
}