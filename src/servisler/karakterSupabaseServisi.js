import { supabase } from "./supabase";
const VARSAYILAN_DURUM = {
    mico_ofke: 45,
    mico_mutluluk: 45,
    mico_ruh_hali: "kizgin",
    mico_dokunma_sayisi: 0,
    mico_konusma_sayisi: 0,

    viki_aclik: 65,
    viki_mutluluk: 70,
    viki_ruh_hali: "acik",
    viki_mama_istegi: 0,
    viki_dokunma_sayisi: 0,
    viki_konusma_sayisi: 0,

    gunluk_seri: 0,
    son_olay: null,
    son_karakter: null,
    son_mesaj: null,
};

function sayiyiSinirla(
    deger,
    min = 0,
    max = 100,
) {
    const sayi = Number(deger);

    if (!Number.isFinite(sayi)) {
        return min;
    }

    return Math.min(
        Math.max(sayi, min),
        max,
    );
}

function bugununAnahtari() {
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

export async function aktifKullaniciyiGetir() {
    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error(
            "Oturum bilgisi alınamadı:",
            sessionError,
        );

        return null;
    }

    if (!session?.user) {
        return null;
    }

    return session.user;
}
export async function karakterDurumunuGetir() {
    const user =
        await aktifKullaniciyiGetir();
    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("karakter_durumlari")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Karakter durumu alınamadı: ${error.message}`,
        );
    }

    if (data) {
        return data;
    }

    const { data: yeniDurum, error: eklemeHatasi } =
        await supabase
            .from("karakter_durumlari")
            .insert({
                user_id: user.id,
                ...VARSAYILAN_DURUM,
            })
            .select()
            .single();

    if (eklemeHatasi) {
        throw new Error(
            `Karakter durumu oluşturulamadı: ${eklemeHatasi.message}`,
        );
    }

    return yeniDurum;
}

export async function karakterDurumunuKaydet(
    guncellemeler,
) {
    const user =
        await aktifKullaniciyiGetir();
    if (!user) {
        return null;
    }
    const guvenliGuncellemeler = {
        ...guncellemeler,
    };

    const sinirlanacakAlanlar = [
        "mico_ofke",
        "mico_mutluluk",
        "viki_aclik",
        "viki_mutluluk",
    ];

    sinirlanacakAlanlar.forEach((alan) => {
        if (
            Object.prototype.hasOwnProperty.call(
                guvenliGuncellemeler,
                alan,
            )
        ) {
            guvenliGuncellemeler[alan] =
                sayiyiSinirla(
                    guvenliGuncellemeler[
                        alan
                    ],
                );
        }
    });

    const sayacAlanlari = [
        "mico_dokunma_sayisi",
        "mico_konusma_sayisi",
        "viki_mama_istegi",
        "viki_dokunma_sayisi",
        "viki_konusma_sayisi",
        "gunluk_seri",
    ];

    sayacAlanlari.forEach((alan) => {
        if (
            Object.prototype.hasOwnProperty.call(
                guvenliGuncellemeler,
                alan,
            )
        ) {
            guvenliGuncellemeler[alan] =
                Math.max(
                    Number(
                        guvenliGuncellemeler[
                            alan
                        ],
                    ) || 0,
                    0,
                );
        }
    });

    const { data, error } = await supabase
        .from("karakter_durumlari")
        .upsert(
            {
                user_id: user.id,
                ...VARSAYILAN_DURUM,
                ...guvenliGuncellemeler,
                son_giris:
                    new Date().toISOString(),
            },
            {
                onConflict: "user_id",
            },
        )
        .select()
        .single();

    if (error) {
        throw new Error(
            `Karakter durumu kaydedilemedi: ${error.message}`,
        );
    }

    return data;
}

export async function karakterOlayiKaydet({
    olay,
    karakter = null,
    ruhHali = null,
    mesaj = null,
    veri = {},
}) {
    const user =
        await aktifKullaniciyiGetir();

    const { data, error } = await supabase
        .from("karakter_olaylari")
        .insert({
            user_id: user.id,
            olay,
            karakter,
            ruh_hali: ruhHali,
            mesaj,
            veri,
        })
        .select()
        .single();

    if (error) {
        throw new Error(
            `Karakter olayı kaydedilemedi: ${error.message}`,
        );
    }

    return data;
}

export async function bugununHafizasiniGetir() {
    const user =
        await aktifKullaniciyiGetir();

    const tarih = bugununAnahtari();

    const { data, error } = await supabase
        .from("karakter_gunluk_hafiza")
        .select("*")
        .eq("user_id", user.id)
        .eq("tarih", tarih)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Günlük hafıza alınamadı: ${error.message}`,
        );
    }

    if (data) {
        return data;
    }

    const {
        data: yeniHafiza,
        error: eklemeHatasi,
    } = await supabase
        .from("karakter_gunluk_hafiza")
        .insert({
            user_id: user.id,
            tarih,
            tamamlanan_ogunler: [],
            geciken_ogunler: [],
            su_miktari: 0,
            su_hedefi: 8,
            tum_ogunler_tamamlandi: false,
            olay_ozeti: {},
        })
        .select()
        .single();

    if (eklemeHatasi) {
        throw new Error(
            `Günlük hafıza oluşturulamadı: ${eklemeHatasi.message}`,
        );
    }

    return yeniHafiza;
}

export async function gunlukHafizayiKaydet(
    guncellemeler,
) {
    const user =
        await aktifKullaniciyiGetir();

    const tarih = bugununAnahtari();

    const { data, error } = await supabase
        .from("karakter_gunluk_hafiza")
        .upsert(
            {
                user_id: user.id,
                tarih,
                ...guncellemeler,
            },
            {
                onConflict: "user_id,tarih",
            },
        )
        .select()
        .single();

    if (error) {
        throw new Error(
            `Günlük hafıza kaydedilemedi: ${error.message}`,
        );
    }

    return data;
}

export async function sonKarakterOlaylariniGetir(
    limit = 25,
) {
    const user =
        await aktifKullaniciyiGetir();

    const guvenliLimit = Math.min(
        Math.max(Number(limit) || 25, 1),
        100,
    );

    const { data, error } = await supabase
        .from("karakter_olaylari")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false,
        })
        .limit(guvenliLimit);

    if (error) {
        throw new Error(
            `Karakter olayları alınamadı: ${error.message}`,
        );
    }

    return data || [];
}