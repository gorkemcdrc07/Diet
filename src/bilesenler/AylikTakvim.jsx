import { useMemo, useState } from "react";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    CircleDashed,
    Droplets,
    Utensils,
} from "lucide-react";

import {
    gecmisiOku,
    tarihAnahtariGetir,
} from "../servisler/gecmisServisi";

const AY_ADLARI = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
];

const GUN_ADLARI = [
    "Pzt",
    "Sal",
    "Çar",
    "Per",
    "Cum",
    "Cmt",
    "Paz",
];

function ikiHane(deger) {
    return String(deger).padStart(2, "0");
}

function tarihAnahtariOlustur(yil, ay, gun) {
    return `${yil}-${ikiHane(ay + 1)}-${ikiHane(gun)}`;
}

function ayGunleriniOlustur(yil, ay) {
    const ayinIlkGunu = new Date(yil, ay, 1);
    const ayinGunSayisi = new Date(
        yil,
        ay + 1,
        0,
    ).getDate();

    const haftaninIlkGunu =
        (ayinIlkGunu.getDay() + 6) % 7;

    const hucreler = [];

    for (
        let bosluk = 0;
        bosluk < haftaninIlkGunu;
        bosluk += 1
    ) {
        hucreler.push({
            tur: "bos",
            id: `bos-${bosluk}`,
        });
    }

    for (
        let gun = 1;
        gun <= ayinGunSayisi;
        gun += 1
    ) {
        hucreler.push({
            tur: "gun",
            id: tarihAnahtariOlustur(
                yil,
                ay,
                gun,
            ),
            gun,
        });
    }

    return hucreler;
}

function gunDurumunuGetir({
    tarih,
    kayit,
    bugun,
}) {
    if (tarih > bugun) {
        return "gelecek";
    }

    if (!kayit) {
        return tarih === bugun
            ? "bugun"
            : "kayitsiz";
    }

    if (kayit.gunTamamlandi) {
        return "tamamlandi";
    }

    if (
        kayit.tamamlananOgunSayisi > 0 ||
        kayit.suMiktari > 0
    ) {
        return "yarim";
    }

    return "kayitsiz";
}

function GunDetayi({ seciliGun }) {
    if (!seciliGun) {
        return (
            <div className="takvim-gun-detayi bos">
                <CircleDashed size={19} />

                <span>
                    Detaylarını görmek için bir gün seç.
                </span>
            </div>
        );
    }

    const { tarih, kayit, durum } = seciliGun;

    const tarihMetni =
        new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Europe/Istanbul",
        }).format(
            new Date(`${tarih}T12:00:00`),
        );

    return (
        <div
            className={`takvim-gun-detayi durum-${durum}`}
        >
            <div className="takvim-detay-baslik">
                <div>
                    <span>Seçilen gün</span>
                    <strong>{tarihMetni}</strong>
                </div>

                {durum === "tamamlandi" && (
                    <div className="takvim-detay-tamamlandi">
                        <Check size={16} />
                    </div>
                )}
            </div>

            {kayit ? (
                <div className="takvim-detay-metrikler">
                    <div>
                        <Utensils size={17} />

                        <span>Öğün</span>

                        <strong>
                            {kayit.tamamlananOgunSayisi}
                            {" / "}
                            {kayit.toplamOgunSayisi}
                        </strong>
                    </div>

                    <div>
                        <Droplets size={17} />

                        <span>Su</span>

                        <strong>
                            {kayit.suMiktari}
                            {" / "}
                            {kayit.suHedefi}
                        </strong>
                    </div>

                    <div>
                        <span>Başarı</span>

                        <strong>
                            %{kayit.ogunYuzdesi || 0}
                        </strong>
                    </div>
                </div>
            ) : (
                <p className="takvim-kayit-yok">
                    Bu gün için henüz kayıt bulunmuyor.
                </p>
            )}
        </div>
    );
}

export default function AylikTakvim() {
    const simdi = new Date();

    const [gorunenAy, setGorunenAy] = useState(
        simdi.getMonth(),
    );

    const [gorunenYil, setGorunenYil] = useState(
        simdi.getFullYear(),
    );

    const [seciliTarih, setSeciliTarih] =
        useState(() =>
            tarihAnahtariGetir(),
        );

    const gecmis = gecmisiOku();
    const bugun = tarihAnahtariGetir();

    const gunler = useMemo(
        () =>
            ayGunleriniOlustur(
                gorunenYil,
                gorunenAy,
            ),
        [
            gorunenYil,
            gorunenAy,
        ],
    );

    const seciliGun = seciliTarih
        ? {
            tarih: seciliTarih,
            kayit:
                gecmis[seciliTarih] || null,
            durum: gunDurumunuGetir({
                tarih: seciliTarih,
                kayit:
                    gecmis[seciliTarih] || null,
                bugun,
            }),
        }
        : null;

    function oncekiAyaGit() {
        if (gorunenAy === 0) {
            setGorunenAy(11);
            setGorunenYil(
                (mevcut) => mevcut - 1,
            );
            return;
        }

        setGorunenAy(
            (mevcut) => mevcut - 1,
        );
    }

    function sonrakiAyaGit() {
        if (gorunenAy === 11) {
            setGorunenAy(0);
            setGorunenYil(
                (mevcut) => mevcut + 1,
            );
            return;
        }

        setGorunenAy(
            (mevcut) => mevcut + 1,
        );
    }

    return (
        <section className="aylik-takvim-karti">
            <div className="takvim-ust">
                <div>
                    <span className="mini-baslik">
                        Geçmiş görünümü
                    </span>

                    <h2>
                        {AY_ADLARI[gorunenAy]}{" "}
                        {gorunenYil}
                    </h2>
                </div>

                <div className="takvim-gezinme">
                    <button
                        type="button"
                        onClick={oncekiAyaGit}
                        aria-label="Önceki ay"
                    >
                        <ChevronLeft size={19} />
                    </button>

                    <button
                        type="button"
                        onClick={sonrakiAyaGit}
                        aria-label="Sonraki ay"
                    >
                        <ChevronRight size={19} />
                    </button>
                </div>
            </div>

            <div className="takvim-gun-adlari">
                {GUN_ADLARI.map((gun) => (
                    <span key={gun}>
                        {gun}
                    </span>
                ))}
            </div>

            <div className="takvim-grid">
                {gunler.map((hucre) => {
                    if (hucre.tur === "bos") {
                        return (
                            <div
                                key={hucre.id}
                                className="takvim-hucre bos"
                            />
                        );
                    }

                    const kayit =
                        gecmis[hucre.id] || null;

                    const durum =
                        gunDurumunuGetir({
                            tarih: hucre.id,
                            kayit,
                            bugun,
                        });

                    const secili =
                        seciliTarih === hucre.id;

                    return (
                        <button
                            key={hucre.id}
                            type="button"
                            className={[
                                "takvim-hucre",
                                `durum-${durum}`,
                                secili
                                    ? "secili"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={() =>
                                setSeciliTarih(
                                    hucre.id,
                                )
                            }
                        >
                            <span>{hucre.gun}</span>

                            {durum ===
                                "tamamlandi" && (
                                    <Check size={11} />
                                )}

                            {durum === "yarim" && (
                                <i />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="takvim-aciklama">
                <span>
                    <i className="tamamlandi" />
                    Tamamlandı
                </span>

                <span>
                    <i className="yarim" />
                    Devam edildi
                </span>

                <span>
                    <i className="kayitsiz" />
                    Kayıt yok
                </span>
            </div>

            <GunDetayi
                seciliGun={seciliGun}
            />
        </section>
    );
}