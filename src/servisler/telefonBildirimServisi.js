// JavaScript source code
import {
    supabase,
    supabaseHazir,
} from "./supabase";

function supabaseKontrolEt() {
    if (!supabaseHazir || !supabase) {
        throw new Error(
            "Supabase baÄŸlantÄ± bilgileri .env dosyasÄ±nda bulunamadÄ±.",
        );
    }
}

function abonelikBilgisiniHazirla(pushAboneligi) {
    if (!pushAboneligi) {
        throw new Error(
            "Telefonun bildirim bilgisi oluÅŸturulamadÄ±.",
        );
    }

    const abonelikJson = pushAboneligi.toJSON();

    const endpoint = abonelikJson.endpoint;
    const p256dh = abonelikJson.keys?.p256dh;
    const auth = abonelikJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
        throw new Error(
            "Telefonun bildirim bilgileri eksik oluÅŸturuldu.",
        );
    }

    return {
        id: 1,
        endpoint,
        p256dh,
        auth,
        aktif: true,
        guncellenme_tarihi: new Date().toISOString(),
    };
}

export async function telefonuKaydet(pushAboneligi) {
    supabaseKontrolEt();

    const telefonBilgisi =
        abonelikBilgisiniHazirla(pushAboneligi);

    const { data, error } = await supabase
        .from("sevgilim_telefonu")
        .upsert(telefonBilgisi, {
            onConflict: "id",
        })
        .select()
        .single();

    if (error) {
        console.error(
            "Telefon kaydedilemedi:",
            error,
        );

        throw new Error(
            `Telefon sisteme kaydedilemedi: ${error.message}`,
        );
    }

    return data;
}

export async function telefonuPasifYap() {
    supabaseKontrolEt();

    const { error } = await supabase
        .from("sevgilim_telefonu")
        .update({
            aktif: false,
            guncellenme_tarihi:
                new Date().toISOString(),
        })
        .eq("id", 1);

    if (error) {
        console.error(
            "Telefon bildirimleri kapatÄ±lamadÄ±:",
            error,
        );

        throw new Error(
            `Bildirim durumu gÃ¼ncellenemedi: ${error.message}`,
        );
    }
}

export async function telefonKayitliMi() {
    supabaseKontrolEt();

    const { data, error } = await supabase
        .from("sevgilim_telefonu")
        .select("id, aktif")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Telefon durumu kontrol edilemedi: ${error.message}`,
        );
    }

    return Boolean(data?.aktif);
}