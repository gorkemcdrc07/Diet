import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase bağlantısı hazır değil.",
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
            "Mağaza ürünleri alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Mağaza ürünleri alınamadı.",
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
            "Envanter alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Envanter alınamadı.",
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
            "Satın alınacak ürün seçilmedi.",
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
            "Ürün satın alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Ürün satın alınamadı.",
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
            "Kullanılacak envanter ürünü seçilmedi.",
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
            "Envanter ürünü kullanılamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Envanter ürünü kullanılamadı.",
        );
    }

    return data;
}