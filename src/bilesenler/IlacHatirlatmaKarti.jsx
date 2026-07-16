import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Bell,
    BellRing,
    Check,
    Clock3,
    Pill,
    Save,
    Settings2,
    X,
} from "lucide-react";

import {
    bugunkuIlacDurumunuGetir,
    bugunkuIlacDurumunuOlustur,
    ilacAyariniGetir,
    ilacAyariniKaydet,
    ilacHatirlatmasiniIsle,
    ilaciIctim,
    istanbulSaatiniGetir,
} from "../servisler/ilacServisi";

import "./IlacHatirlatmaKarti.css";

function ilkHatirlatmaZamaniniHesapla(ayar) {
    const simdi = istanbulSaatiniGetir();

    const [saat, dakika] = String(
        ayar?.aksam_yemegi_saati || "20:00",
    )
        .split(":")
        .map(Number);

    const tarih = new Date(simdi);

    tarih.setHours(
        Number(saat) || 0,
        Number(dakika) || 0,
        0,
        0,
    );

    tarih.setMinutes(
        tarih.getMinutes() +
        Number(ayar?.yemekten_sonra_dakika || 0),
    );

    return tarih;
}

function saatFormatla(tarih) {
    if (!tarih) {
        return "--:--";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
    }).format(new Date(tarih));
}

function kalanSureyiFormatla(hedefZaman) {
    if (!hedefZaman) {
        return "";
    }

    const fark =
        new Date(hedefZaman).getTime() -
        Date.now();

    if (fark <= 0) {
        return "Hatırlatma zamanı";
    }

    const toplamDakika =
        Math.ceil(fark / 60000);

    if (toplamDakika < 60) {
        return `${toplamDakika} dk kaldı`;
    }

    const saat =
        Math.floor(toplamDakika / 60);

    const dakika =
        toplamDakika % 60;

    return dakika > 0
        ? `${saat} sa ${dakika} dk kaldı`
        : `${saat} saat kaldı`;
}

async function bildirimIzniIste() {
    if (!("Notification" in window)) {
        throw new Error(
            "Bu tarayıcı bildirimleri desteklemiyor.",
        );
    }

    if (
        Notification.permission ===
        "granted"
    ) {
        return true;
    }

    return (
        await Notification.requestPermission()
    ) === "granted";
}

function ilacBildirimiGoster(ilacAdi) {
    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    const bildirim = new Notification(
        "💊 İlaç zamanı",
        {
            body:
                `${ilacAdi} ilacını içtin mi? Uygulamayı açıp “İçtim” butonuna dokun.`,

            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
            tag: "aksam-ilac-hatirlatmasi",
            renotify: true,
            requireInteraction: true,
        },
    );

    bildirim.onclick = () => {
        window.focus();
        bildirim.close();
    };
}

export default function IlacHatirlatmaKarti() {
    const [ayar, setAyar] =
        useState(null);

    const [gunlukDurum, setGunlukDurum] =
        useState(null);

    const [ayarAcik, setAyarAcik] =
        useState(false);

    const [ilacAdi, setIlacAdi] =
        useState("Akşam ilacı");

    const [yemekSaati, setYemekSaati] =
        useState("20:00");

    const [
        yemekSonrasiDakika,
        setYemekSonrasiDakika,
    ] = useState(0);

    const [tekrarDakika, setTekrarDakika] =
        useState(10);

    const [bildirimIzni, setBildirimIzni] =
        useState(
            typeof Notification !== "undefined"
                ? Notification.permission
                : "unsupported",
        );

    const [yukleniyor, setYukleniyor] =
        useState(true);

    const [kaydediliyor, setKaydediliyor] =
        useState(false);

    const [hata, setHata] =
        useState("");

    const [mesaj, setMesaj] =
        useState("");

    const [simdi, setSimdi] =
        useState(Date.now());

    const ilkHatirlatmaZamani =
        useMemo(() => {
            if (!ayar) {
                return null;
            }

            return ilkHatirlatmaZamaniniHesapla(
                ayar,
            );
        }, [ayar]);

    const sonrakiHatirlatmaZamani =
        gunlukDurum?.sonraki_hatirlatma_zamani ||
        ilkHatirlatmaZamani?.toISOString() ||
        null;

    const ilacIcildi =
        gunlukDurum?.durum === "icildi";

    const hatirlatmaAktif =
        Boolean(
            ayar?.aktif &&
            !ilacIcildi &&
            sonrakiHatirlatmaZamani &&
            Date.now() >=
            new Date(
                sonrakiHatirlatmaZamani,
            ).getTime(),
        );

    const verileriYukle =
        useCallback(async () => {
            setYukleniyor(true);
            setHata("");

            try {
                const ayarVerisi =
                    await ilacAyariniGetir();

                if (!ayarVerisi) {
                    setAyarAcik(true);
                    return;
                }

                setAyar(ayarVerisi);
                setIlacAdi(ayarVerisi.ilac_adi);

                setYemekSaati(
                    String(
                        ayarVerisi
                            .aksam_yemegi_saati,
                    ).slice(0, 5),
                );

                setYemekSonrasiDakika(
                    Number(
                        ayarVerisi
                            .yemekten_sonra_dakika,
                    ),
                );

                setTekrarDakika(
                    Number(
                        ayarVerisi
                            .tekrar_dakika,
                    ),
                );

                const durumVerisi =
                    await bugunkuIlacDurumunuGetir(
                        ayarVerisi.id,
                    );

                if (durumVerisi) {
                    setGunlukDurum(durumVerisi);
                    return;
                }

                const ilkZaman =
                    ilkHatirlatmaZamaniniHesapla(
                        ayarVerisi,
                    );

                const yeniDurum =
                    await bugunkuIlacDurumunuOlustur(
                        {
                            ayarId:
                                ayarVerisi.id,

                            ilkHatirlatmaZamani:
                                ilkZaman.toISOString(),
                        },
                    );

                setGunlukDurum(yeniDurum);
            } catch (error) {
                console.error(
                    "İlaç kartı yüklenemedi:",
                    error,
                );

                setHata(
                    error?.message ||
                    "İlaç bilgileri yüklenemedi.",
                );
            } finally {
                setYukleniyor(false);
            }
        }, []);

    useEffect(() => {
        verileriYukle();
    }, [verileriYukle]);

    useEffect(() => {
        const zamanlayici =
            window.setInterval(
                () => setSimdi(Date.now()),
                30000,
            );

        return () =>
            window.clearInterval(zamanlayici);
    }, []);

    useEffect(() => {
        if (
            !ayar ||
            !ayar.aktif ||
            !gunlukDurum ||
            ilacIcildi
        ) {
            return;
        }

        const sonrakiZaman =
            gunlukDurum
                .sonraki_hatirlatma_zamani ||
            gunlukDurum
                .ilk_hatirlatma_zamani;

        if (
            !sonrakiZaman ||
            Date.now() <
            new Date(
                sonrakiZaman,
            ).getTime()
        ) {
            return;
        }

        let iptalEdildi = false;

        async function hatirlat() {
            try {
                ilacBildirimiGoster(
                    ayar.ilac_adi,
                );

                const yeniDurum =
                    await ilacHatirlatmasiniIsle(
                        {
                            durumId:
                                gunlukDurum.id,

                            tekrarDakika:
                                ayar.tekrar_dakika,
                        },
                    );

                if (
                    !iptalEdildi &&
                    yeniDurum
                ) {
                    setGunlukDurum(yeniDurum);

                    setMesaj(
                        `${ayar.tekrar_dakika} dakika sonra yeniden hatırlatılacak.`,
                    );
                }
            } catch (error) {
                console.error(
                    "Hatırlatma gönderilemedi:",
                    error,
                );
            }
        }

        hatirlat();

        return () => {
            iptalEdildi = true;
        };
    }, [
        ayar,
        gunlukDurum,
        ilacIcildi,
        simdi,
    ]);

    async function ayariKaydet() {
        setKaydediliyor(true);
        setHata("");
        setMesaj("");

        try {
            const kaydedilenAyar =
                await ilacAyariniKaydet({
                    ilacAdi,
                    aksamYemegiSaati:
                        yemekSaati,

                    yemektenSonraDakika:
                        yemekSonrasiDakika,

                    tekrarDakika,
                    aktif: true,
                });

            setAyar(kaydedilenAyar);

            const ilkZaman =
                ilkHatirlatmaZamaniniHesapla(
                    kaydedilenAyar,
                );

            const yeniDurum =
                await bugunkuIlacDurumunuOlustur(
                    {
                        ayarId:
                            kaydedilenAyar.id,

                        ilkHatirlatmaZamani:
                            ilkZaman.toISOString(),
                    },
                );

            setGunlukDurum(yeniDurum);
            setAyarAcik(false);

            setMesaj(
                "İlaç hatırlatman güncellendi.",
            );
        } catch (error) {
            setHata(
                error?.message ||
                "Ayar kaydedilemedi.",
            );
        } finally {
            setKaydediliyor(false);
        }
    }

    async function bildirimiAc() {
        setHata("");
        setMesaj("");

        try {
            const izinVar =
                await bildirimIzniIste();

            setBildirimIzni(
                izinVar
                    ? "granted"
                    : Notification.permission,
            );

            if (izinVar) {
                setMesaj("Bildirimler açıldı.");
            } else {
                setHata(
                    "Bildirim izni verilmedi.",
                );
            }
        } catch (error) {
            setHata(
                error?.message ||
                "Bildirim izni açılamadı.",
            );
        }
    }

    async function ictimOlarakIsaretle() {
        if (!gunlukDurum?.id) {
            return;
        }

        setKaydediliyor(true);
        setHata("");

        try {
            const yeniDurum =
                await ilaciIctim({
                    durumId:
                        gunlukDurum.id,
                });

            setGunlukDurum(yeniDurum);

            setMesaj(
                "Bugünkü ilaç kaydın tamamlandı.",
            );
        } catch (error) {
            setHata(
                error?.message ||
                "İlaç durumu güncellenemedi.",
            );
        } finally {
            setKaydediliyor(false);
        }
    }

    if (yukleniyor) {
        return (
            <section className="ilac-karti ilac-karti--yukleniyor">
                <span />
                <strong>
                    İlaç bilgileri hazırlanıyor...
                </strong>
            </section>
        );
    }

    return (
        <>
            <section
                className={[
                    "ilac-karti",
                    ilacIcildi
                        ? "ilac-karti--icildi"
                        : "",
                    hatirlatmaAktif
                        ? "ilac-karti--aktif"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div className="ilac-karti-ust">
                    <div className="ilac-karti-kimlik">
                        <span className="ilac-karti-ikon">
                            {ilacIcildi ? (
                                <Check size={21} />
                            ) : (
                                <Pill size={21} />
                            )}
                        </span>

                        <div>
                            <span className="ilac-mini-baslik">
                                Günlük sağlık
                            </span>

                            <h2>
                                {ayar?.ilac_adi ||
                                    "İlaç Hatırlatması"}
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="ilac-ayar-butonu"
                        aria-label="İlaç ayarlarını aç"
                        onClick={() =>
                            setAyarAcik(true)
                        }
                    >
                        <Settings2 size={17} />
                    </button>
                </div>

                {ayar ? (
                    <div className="ilac-ana-alan">
                        <div className="ilac-zaman-bilgisi">
                            <span>
                                {ilacIcildi
                                    ? "Bugün tamamlandı"
                                    : hatirlatmaAktif
                                        ? "Şimdi içmelisin"
                                        : "Sonraki hatırlatma"}
                            </span>

                            <strong>
                                {ilacIcildi
                                    ? saatFormatla(
                                        gunlukDurum
                                            ?.icilme_zamani,
                                    )
                                    : saatFormatla(
                                        sonrakiHatirlatmaZamani,
                                    )}
                            </strong>

                            <small>
                                {ilacIcildi
                                    ? "Bugün başka bildirim gönderilmeyecek"
                                    : kalanSureyiFormatla(
                                        sonrakiHatirlatmaZamani,
                                    )}
                            </small>
                        </div>

                        <div className="ilac-kisa-bilgiler">
                            <span>
                                <Clock3 size={14} />
                                Yemek{" "}
                                {String(
                                    ayar
                                        .aksam_yemegi_saati,
                                ).slice(0, 5)}
                            </span>

                            <span>
                                <BellRing size={14} />
                                Her{" "}
                                {ayar.tekrar_dakika} dk
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="ilac-bos-durum">
                        <Pill size={22} />

                        <div>
                            <strong>
                                Hatırlatma ayarla
                            </strong>

                            <span>
                                Akşam ilacını unutmamak
                                için saatini belirle.
                            </span>
                        </div>
                    </div>
                )}

                {ayar && !ilacIcildi && (
                    <button
                        type="button"
                        className="ilac-ictim-butonu"
                        disabled={kaydediliyor}
                        onClick={
                            ictimOlarakIsaretle
                        }
                    >
                        <Check size={18} />

                        {kaydediliyor
                            ? "Kaydediliyor..."
                            : "İlacımı İçtim"}
                    </button>
                )}

                {!ayar && (
                    <button
                        type="button"
                        className="ilac-ictim-butonu"
                        onClick={() =>
                            setAyarAcik(true)
                        }
                    >
                        <Settings2 size={18} />
                        Hatırlatma Oluştur
                    </button>
                )}

                {bildirimIzni !== "granted" && (
                    <button
                        type="button"
                        className="ilac-bildirim-satiri"
                        onClick={bildirimiAc}
                    >
                        <span>
                            <Bell size={16} />
                            Bildirimler kapalı
                        </span>

                        <strong>Aç</strong>
                    </button>
                )}

                {hata && (
                    <div className="ilac-mesaj ilac-mesaj--hata">
                        {hata}
                    </div>
                )}

                {mesaj && (
                    <div className="ilac-mesaj ilac-mesaj--basarili">
                        {mesaj}
                    </div>
                )}
            </section>

            {ayarAcik && (
                <div
                    className="ilac-sheet-katmani"
                    onClick={() =>
                        setAyarAcik(false)
                    }
                >
                    <section
                        className="ilac-sheet"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="ilac-sheet-tutamac" />

                        <div className="ilac-sheet-baslik">
                            <div>
                                <span>Sağlık ayarı</span>
                                <h2>
                                    İlaç hatırlatması
                                </h2>
                            </div>

                            <button
                                type="button"
                                aria-label="Ayarları kapat"
                                onClick={() =>
                                    setAyarAcik(false)
                                }
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="ilac-sheet-form">
                            <label>
                                <span>İlaç adı</span>

                                <input
                                    type="text"
                                    value={ilacAdi}
                                    placeholder="Akşam ilacı"
                                    onChange={(event) =>
                                        setIlacAdi(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>

                            <div className="ilac-sheet-grid">
                                <label>
                                    <span>
                                        Akşam yemeği
                                    </span>

                                    <input
                                        type="time"
                                        value={yemekSaati}
                                        onChange={(event) =>
                                            setYemekSaati(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    <span>
                                        Yemekten sonra
                                    </span>

                                    <select
                                        value={
                                            yemekSonrasiDakika
                                        }
                                        onChange={(event) =>
                                            setYemekSonrasiDakika(
                                                Number(
                                                    event
                                                        .target
                                                        .value,
                                                ),
                                            )
                                        }
                                    >
                                        <option value="0">
                                            Hemen
                                        </option>
                                        <option value="5">
                                            5 dakika
                                        </option>
                                        <option value="10">
                                            10 dakika
                                        </option>
                                        <option value="15">
                                            15 dakika
                                        </option>
                                        <option value="30">
                                            30 dakika
                                        </option>
                                    </select>
                                </label>
                            </div>

                            <label>
                                <span>
                                    Tekrar aralığı
                                </span>

                                <select
                                    value={tekrarDakika}
                                    onChange={(event) =>
                                        setTekrarDakika(
                                            Number(
                                                event
                                                    .target
                                                    .value,
                                            ),
                                        )
                                    }
                                >
                                    <option value="5">
                                        5 dakikada bir
                                    </option>
                                    <option value="10">
                                        10 dakikada bir
                                    </option>
                                    <option value="15">
                                        15 dakikada bir
                                    </option>
                                    <option value="30">
                                        30 dakikada bir
                                    </option>
                                </select>
                            </label>
                        </div>

                        <button
                            type="button"
                            className="ilac-kaydet-butonu"
                            disabled={kaydediliyor}
                            onClick={ayariKaydet}
                        >
                            <Save size={17} />

                            {kaydediliyor
                                ? "Kaydediliyor..."
                                : "Ayarları Kaydet"}
                        </button>
                    </section>
                </div>
            )}
        </>
    );
}
