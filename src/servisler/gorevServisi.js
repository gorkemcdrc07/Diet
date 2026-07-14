import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase bağlantısı hazır değil.",
        );
    }
}

export async function gunlukGorevleriHazirla() {
    supabaseKontrolEt();

    const { data, error } =
        await supabase.rpc(
            "gunluk_gorevleri_hazirla",
        );

    if (error) {
        console.error(
            "Günlük görevler hazırlanamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Günlük görevler hazırlanamadı.",
        );
    }

    return {
        ...data,
        gorevler: Array.isArray(
            data?.gorevler,
        )
            ? data.gorevler
            : [],
    };
}

export async function gunlukGorevOdulleriniVer() {
    supabaseKontrolEt();

    const { data, error } =
        await supabase.rpc(
            "gunluk_gorev_odullerini_ver",
        );

    if (error) {
        console.error(
            "Günlük görev ödülleri verilemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Günlük görev ödülleri verilemedi.",
        );
    }

    return {
        ...data,

        toplam_odul_xp:
            Number(
                data?.toplam_odul_xp,
            ) || 0,

        oduller: Array.isArray(
            data?.oduller,
        )
            ? data.oduller
            : [],
    };
}

export async function bugununGorevleriniGetir() {
    supabaseKontrolEt();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.error(
            "Görev kullanıcısı alınamadı:",
            userError,
        );

        throw new Error(
            userError.message ||
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    if (!user) {
        return [];
    }

    const bugun =
        bugununTarihiniGetir();

    const { data, error } = await supabase
        .from(
            "kullanici_gunluk_gorevleri",
        )
        .select(
            `
            id,
            tarih,
            mevcut_deger,
            tamamlandi,
            odul_alindi,
            tamamlanma_tarihi,
            odul_alinma_tarihi,
            gorev:gorevler (
                id,
                kod,
                ad,
                aciklama,
                ikon,
                gorev_turu,
                hedef_degeri,
                xp_odulu,
                karakter,
                sira
            )
            `,
        )
        .eq("user_id", user.id)
        .eq("tarih", bugun)
        .order("sira", {
            ascending: true,
            referencedTable: "gorevler",
        });

    if (error) {
        console.error(
            "Günlük görevler alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Günlük görevler alınamadı.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function gorevOzetiniGetir() {
    const sonuc =
        await gunlukGorevleriHazirla();

    const gorevler =
        sonuc.gorevler;

    const tamamlananSayisi =
        gorevler.filter(
            (gorev) =>
                gorev?.tamamlandi,
        ).length;

    const toplamGorevSayisi =
        gorevler.length;

    const tamamlanmaYuzdesi =
        toplamGorevSayisi > 0
            ? Math.round(
                (tamamlananSayisi /
                    toplamGorevSayisi) *
                100,
            )
            : 0;

    const kazanilabilirXp =
        gorevler.reduce(
            (toplam, gorev) =>
                toplam +
                (Number(
                    gorev?.xp_odulu,
                ) || 0),
            0,
        );

    return {
        ...sonuc,
        tamamlananSayisi,
        toplamGorevSayisi,
        tamamlanmaYuzdesi,
        kazanilabilirXp,
    };
}

export function bugununTarihiniGetir() {
    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "Europe/Istanbul",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        },
    ).format(new Date());
}