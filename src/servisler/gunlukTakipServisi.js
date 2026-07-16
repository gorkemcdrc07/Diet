const TAMAMLANANLAR_KEY =
    "diyet-tamamlanan-ogunler";

const SU_KEY =
    "diyet-su-miktari";

const TARIH_KEY =
    "diyet-kayit-tarihi";

export const GUNLUK_TAKIP_EVENT =
    "gunluk-takip-degisti";

export function bugununTakipAnahtariniGetir() {
    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "Europe/Istanbul",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        },
    ).format(new Date());
}

function gunuKontrolEt() {
    const bugun =
        bugununTakipAnahtariniGetir();

    const kayitliTarih =
        localStorage.getItem(
            TARIH_KEY,
        );

    if (kayitliTarih === bugun) {
        return;
    }

    localStorage.setItem(
        TARIH_KEY,
        bugun,
    );

    localStorage.removeItem(
        TAMAMLANANLAR_KEY,
    );

    localStorage.removeItem(
        SU_KEY,
    );
}

function takipDegisiminiYayinla(veri) {
    window.dispatchEvent(
        new CustomEvent(
            GUNLUK_TAKIP_EVENT,
            {
                detail: veri,
            },
        ),
    );
}

export function gunlukTakibiOku() {
    gunuKontrolEt();

    try {
        const tamamlananlarKaydi =
            localStorage.getItem(
                TAMAMLANANLAR_KEY,
            );

        const tamamlananlar =
            tamamlananlarKaydi
                ? JSON.parse(
                    tamamlananlarKaydi,
                )
                : [];

        const suMiktari =
            Number(
                localStorage.getItem(
                    SU_KEY,
                ),
            );

        return {
            tarih:
                bugununTakipAnahtariniGetir(),

            tamamlananlar:
                Array.isArray(
                    tamamlananlar,
                )
                    ? tamamlananlar
                    : [],

            suMiktari:
                Number.isFinite(
                    suMiktari,
                )
                    ? Math.max(
                        suMiktari,
                        0,
                    )
                    : 0,
        };
    } catch (error) {
        console.error(
            "Günlük takip okunamadı:",
            error,
        );

        return {
            tarih:
                bugununTakipAnahtariniGetir(),

            tamamlananlar: [],
            suMiktari: 0,
        };
    }
}

export function tamamlananOgunleriKaydet(
    tamamlananlar,
) {
    gunuKontrolEt();

    const guvenliListe =
        Array.isArray(
            tamamlananlar,
        )
            ? [
                ...new Set(
                    tamamlananlar,
                ),
            ]
            : [];

    localStorage.setItem(
        TAMAMLANANLAR_KEY,
        JSON.stringify(
            guvenliListe,
        ),
    );

    const mevcut =
        gunlukTakibiOku();

    const yeniTakip = {
        ...mevcut,
        tamamlananlar:
            guvenliListe,
    };

    takipDegisiminiYayinla(
        yeniTakip,
    );

    return yeniTakip;
}

export function ogunDurumunuKaydet(
    ogunId,
    tamamlandi,
) {
    const mevcut =
        gunlukTakibiOku();

    const mevcutListe =
        mevcut.tamamlananlar;

    const yeniListe =
        tamamlandi
            ? [
                ...new Set([
                    ...mevcutListe,
                    ogunId,
                ]),
            ]
            : mevcutListe.filter(
                (id) =>
                    String(id) !==
                    String(ogunId),
            );

    return tamamlananOgunleriKaydet(
        yeniListe,
    );
}

export function suMiktariniKaydet(
    miktar,
) {
    gunuKontrolEt();

    const guvenliMiktar =
        Math.max(
            Number(miktar) || 0,
            0,
        );

    localStorage.setItem(
        SU_KEY,
        String(
            guvenliMiktar,
        ),
    );

    const mevcut =
        gunlukTakibiOku();

    const yeniTakip = {
        ...mevcut,
        suMiktari:
            guvenliMiktar,
    };

    takipDegisiminiYayinla(
        yeniTakip,
    );

    return yeniTakip;
}

export function gunlukTakipDegisiminiDinle(
    callback,
) {
    if (
        typeof callback !==
        "function"
    ) {
        return () => { };
    }

    function degisimiDinle(event) {
        callback(
            event?.detail ||
            gunlukTakibiOku(),
        );
    }

    function storageDegisiminiDinle(
        event,
    ) {
        if (
            event.key ===
            TAMAMLANANLAR_KEY ||
            event.key ===
            SU_KEY ||
            event.key ===
            TARIH_KEY
        ) {
            callback(
                gunlukTakibiOku(),
            );
        }
    }

    window.addEventListener(
        GUNLUK_TAKIP_EVENT,
        degisimiDinle,
    );

    window.addEventListener(
        "storage",
        storageDegisiminiDinle,
    );

    return () => {
        window.removeEventListener(
            GUNLUK_TAKIP_EVENT,
            degisimiDinle,
        );

        window.removeEventListener(
            "storage",
            storageDegisiminiDinle,
        );
    };
}