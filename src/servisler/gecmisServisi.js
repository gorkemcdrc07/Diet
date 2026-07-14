const GECMIS_KEY = "diyet-gunluk-gecmis";
const EN_FAZLA_GUN = 60;

export function tarihAnahtariGetir(tarih = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(tarih);
}

export function gecmisiOku() {
    try {
        const kayit = localStorage.getItem(GECMIS_KEY);

        if (!kayit) {
            return {};
        }

        const gecmis = JSON.parse(kayit);

        return gecmis && typeof gecmis === "object"
            ? gecmis
            : {};
    } catch (error) {
        console.error(
            "Geçmiş kayıtlar okunamadı:",
            error,
        );

        return {};
    }
}

function eskiKayitlariTemizle(gecmis) {
    const siraliTarihler = Object.keys(gecmis)
        .sort()
        .reverse();

    const tutulacakTarihler = new Set(
        siraliTarihler.slice(0, EN_FAZLA_GUN),
    );

    return Object.fromEntries(
        Object.entries(gecmis).filter(
            ([tarih]) =>
                tutulacakTarihler.has(tarih),
        ),
    );
}

export function gunlukKaydiGuncelle({
    tamamlananOgunler,
    toplamOgunSayisi,
    suMiktari,
    suHedefi,
}) {
    const bugun = tarihAnahtariGetir();
    const gecmis = gecmisiOku();

    const tamamlananSayisi = Array.isArray(
        tamamlananOgunler,
    )
        ? tamamlananOgunler.length
        : 0;

    const ogunYuzdesi =
        toplamOgunSayisi > 0
            ? Math.round(
                (
                    tamamlananSayisi /
                    toplamOgunSayisi
                ) * 100,
            )
            : 0;

    const suYuzdesi =
        suHedefi > 0
            ? Math.min(
                100,
                Math.round(
                    (suMiktari / suHedefi) * 100,
                ),
            )
            : 0;

    gecmis[bugun] = {
        tarih: bugun,
        tamamlananOgunler:
            tamamlananOgunler || [],
        tamamlananOgunSayisi:
            tamamlananSayisi,
        toplamOgunSayisi,
        ogunYuzdesi,
        suMiktari,
        suHedefi,
        suYuzdesi,
        gunTamamlandi:
            tamamlananSayisi ===
            toplamOgunSayisi &&
            toplamOgunSayisi > 0,
        guncellenmeZamani:
            new Date().toISOString(),
    };

    const temizGecmis =
        eskiKayitlariTemizle(gecmis);

    localStorage.setItem(
        GECMIS_KEY,
        JSON.stringify(temizGecmis),
    );

    window.dispatchEvent(
        new CustomEvent(
            "diyet-gecmis-guncellendi",
        ),
    );

    return temizGecmis[bugun];
}

export function sonGunlariGetir(gunSayisi = 7) {
    const gecmis = gecmisiOku();
    const gunler = [];

    const bugunMetni = tarihAnahtariGetir();
    const [yil, ay, gun] = bugunMetni
        .split("-")
        .map(Number);

    for (
        let geriye = gunSayisi - 1;
        geriye >= 0;
        geriye -= 1
    ) {
        const tarih = new Date(
            Date.UTC(
                yil,
                ay - 1,
                gun - geriye,
                12,
                0,
                0,
            ),
        );

        const tarihAnahtari =
            tarihAnahtariGetir(tarih);

        const gunBilgisi =
            gecmis[tarihAnahtari] || null;

        gunler.push({
            tarih: tarihAnahtari,
            tarihNesnesi: tarih,
            kayit: gunBilgisi,
            bugun:
                tarihAnahtari === bugunMetni,
        });
    }

    return gunler;
}

export function haftalikOzetiGetir() {
    const gunler = sonGunlariGetir(7);

    const kayitliGunler = gunler.filter(
        (gun) => Boolean(gun.kayit),
    );

    const tamamlananGunSayisi =
        kayitliGunler.filter(
            (gun) =>
                gun.kayit?.gunTamamlandi,
        ).length;

    const toplamTamamlananOgun =
        kayitliGunler.reduce(
            (toplam, gun) =>
                toplam +
                (
                    gun.kayit
                        ?.tamamlananOgunSayisi || 0
                ),
            0,
        );

    const toplamPlanlananOgun =
        kayitliGunler.reduce(
            (toplam, gun) =>
                toplam +
                (
                    gun.kayit
                        ?.toplamOgunSayisi || 0
                ),
            0,
        );

    const ortalamaOgunYuzdesi =
        toplamPlanlananOgun > 0
            ? Math.round(
                (
                    toplamTamamlananOgun /
                    toplamPlanlananOgun
                ) * 100,
            )
            : 0;

    const toplamSu =
        kayitliGunler.reduce(
            (toplam, gun) =>
                toplam +
                (
                    gun.kayit?.suMiktari || 0
                ),
            0,
        );

    return {
        gunler,
        kayitliGunSayisi:
            kayitliGunler.length,
        tamamlananGunSayisi,
        toplamTamamlananOgun,
        toplamPlanlananOgun,
        ortalamaOgunYuzdesi,
        toplamSu,
    };
}