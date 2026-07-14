import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase baðlantýsý hazýr deðil.",
        );
    }
}

export async function magazaUrunleriniGetir({
    kategori = null,
    karakter = null,
} = {}) {
    supabaseKontrolEt();

    let sorgu = supabase
        .from("magaza_urunleri")
        .select(
            `
            id,
            kod,
            ad,
            aciklama,
            kategori,
            karakter,
            fiyat,
            ikon,
            gorsel_url,
            nadirlik,
            sira
            `,
        )
        .eq("aktif", true)
        .order("sira", {
            ascending: true,
        });

    if (kategori) {
        sorgu = sorgu.eq(
            "kategori",
            kategori,
        );
    }

    if (karakter) {
        sorgu = sorgu.in(
            "karakter",
            [
                karakter,
                "ikisi",
            ],
        );
    }

    const { data, error } =
        await sorgu;

    if (error) {
        console.error(
            "Maðaza ürünleri alýnamadý:",
            error,
        );

        throw new Error(
            error.message ||
            "Maðaza ürünleri alýnamadý.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function envanteriGetir() {
    supabaseKontrolEt();

    const { data, error } =
        await supabase
            .from("kullanici_envanteri")
            .select(
                `
                id,
                satin_alinma_tarihi,
                aktif_kullaniliyor,
                kullanildi,
                kullanilma_tarihi,
                kullanim_notu,
                urun:magaza_urunleri (
                    id,
                    kod,
                    ad,
                    aciklama,
                    kategori,
                    karakter,
                    fiyat,
                    ikon,
                    gorsel_url,
                    nadirlik
                )
                `,
            )
            .order(
                "satin_alinma_tarihi",
                {
                    ascending: false,
                },
            );

    if (error) {
        console.error(
            "Envanter alýnamadý:",
            error,
        );

        throw new Error(
            error.message ||
            "Envanter alýnamadý.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function magazaUrunuSatinAl(
    urunId,
) {
    supabaseKontrolEt();

    if (!urunId) {
        throw new Error(
            "Satýn alýnacak ürün seçilmedi.",
        );
    }

    const { data, error } =
        await supabase.rpc(
            "magaza_urunu_satin_al",
            {
                p_urun_id:
                    urunId,
            },
        );

    if (error) {
        console.error(
            "Ürün satýn alýnamadý:",
            error,
        );

        throw new Error(
            error.message ||
            "Ürün satýn alýnamadý.",
        );
    }

    return data;
}

export async function envanterUrununuKullan({
    envanterId,
    kullanimNotu = null,
}) {
    supabaseKontrolEt();

    if (!envanterId) {
        throw new Error(
            "Kullanýlacak envanter ürünü seçilmedi.",
        );
    }

    const { data, error } =
        await supabase.rpc(
            "envanter_urununu_kullan",
            {
                p_envanter_id:
                    envanterId,

                p_kullanim_notu:
                    kullanimNotu,
            },
        );

    if (error) {
        console.error(
            "Envanter ürünü kullanýlamadý:",
            error,
        );

        throw new Error(
            error.message ||
            "Envanter ürünü kullanýlamadý.",
        );
    }

    return data;
}