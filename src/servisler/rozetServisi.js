import { supabase } from "./supabase";

export async function rozetleriKontrolEt() {
    const { data, error } = await supabase.rpc(
        "rozetleri_kontrol_et",
    );

    if (error) {
        console.error(
            "Rozet kontrolü baþarýsýz:",
            error,
        );

        throw new Error(
            error.message ||
            "Rozetler kontrol edilemedi.",
        );
    }

    return data;
}

export async function tumRozetleriGetir() {
    const { data, error } = await supabase
        .from("rozetler")
        .select(
            `
            id,
            kod,
            ad,
            aciklama,
            ikon,
            kosul_turu,
            kosul_degeri,
            xp_odulu,
            sira
            `,
        )
        .eq("aktif", true)
        .order("sira", {
            ascending: true,
        });

    if (error) {
        throw new Error(
            error.message ||
            "Rozetler alýnamadý.",
        );
    }

    return data || [];
}

export async function kazanilanRozetleriGetir() {
    const { data, error } = await supabase
        .from("kullanici_rozetleri")
        .select(
            `
            id,
            kazanilma_tarihi,
            rozet:rozetler (
                id,
                kod,
                ad,
                aciklama,
                ikon,
                xp_odulu
            )
            `,
        )
        .order("kazanilma_tarihi", {
            ascending: false,
        });

    if (error) {
        throw new Error(
            error.message ||
            "Kazanýlan rozetler alýnamadý.",
        );
    }

    return data || [];
}