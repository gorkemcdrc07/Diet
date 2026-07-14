import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase bağlantısı hazır değil.",
        );
    }
}

export async function coinKazandir({
    islemTuru,
    aciklama = null,
    kaynakId = null,
    benzersizAnahtar = null,
    ekVeri = {},
}) {
    supabaseKontrolEt();

    if (!islemTuru) {
        throw new Error(
            "Coin işlemi için islemTuru zorunludur.",
        );
    }

    const { data, error } =
        await supabase.rpc(
            "coin_kazandir",
            {
                p_islem_turu:
                    islemTuru,

                p_aciklama:
                    aciklama,

                p_kaynak_id:
                    kaynakId === null ||
                        kaynakId === undefined
                        ? null
                        : String(
                            kaynakId,
                        ),

                p_benzersiz_anahtar:
                    benzersizAnahtar,

                p_ek_veri:
                    ekVeri || {},
            },
        );

    if (error) {
        console.error(
            "Coin kazandırma hatası:",
            error,
        );

        throw new Error(
            error.message ||
            "Coin kazandırılamadı.",
        );
    }

    return data;
}

export async function coinHarca({
    miktar,
    islemTuru,
    aciklama = null,
    kaynakId = null,
    benzersizAnahtar = null,
    ekVeri = {},
}) {
    supabaseKontrolEt();

    const guvenliMiktar =
        Number(miktar);

    if (
        !Number.isFinite(
            guvenliMiktar,
        ) ||
        guvenliMiktar <= 0
    ) {
        throw new Error(
            "Harcanacak coin miktarı geçersiz.",
        );
    }

    if (!islemTuru) {
        throw new Error(
            "Coin harcama işlem türü zorunludur.",
        );
    }

    const { data, error } =
        await supabase.rpc(
            "coin_harca",
            {
                p_miktar:
                    Math.floor(
                        guvenliMiktar,
                    ),

                p_islem_turu:
                    islemTuru,

                p_aciklama:
                    aciklama,

                p_kaynak_id:
                    kaynakId === null ||
                        kaynakId === undefined
                        ? null
                        : String(
                            kaynakId,
                        ),

                p_benzersiz_anahtar:
                    benzersizAnahtar,

                p_ek_veri:
                    ekVeri || {},
            },
        );

    if (error) {
        console.error(
            "Coin harcama hatası:",
            error,
        );

        throw new Error(
            error.message ||
            "Coin harcanamadı.",
        );
    }

    return data;
}

export async function coinOzetiniGetir() {
    supabaseKontrolEt();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.error(
            "Coin kullanıcısı alınamadı:",
            userError,
        );

        throw new Error(
            userError.message ||
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    if (!user) {
        return null;
    }

    const { data, error } =
        await supabase
            .from("kullanici_coin")
            .select(
                `
                user_id,
                toplam_coin,
                harcanan_coin,
                mevcut_coin,
                bugunku_coin,
                coin_tarihi,
                guncellenme_tarihi
                `,
            )
            .eq("user_id", user.id)
            .maybeSingle();

    if (error) {
        console.error(
            "Coin özeti alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Coin özeti alınamadı.",
        );
    }

    return data;
}

export async function coinHareketleriniGetir(
    limit = 20,
) {
    supabaseKontrolEt();

    const guvenliLimit =
        Math.min(
            Math.max(
                Number(limit) || 20,
                1,
            ),
            100,
        );

    const { data, error } =
        await supabase
            .from("coin_hareketleri")
            .select(
                `
                id,
                islem_turu,
                aciklama,
                kazanilan_coin,
                kaynak_id,
                ek_veri,
                olusturulma_tarihi
                `,
            )
            .order(
                "olusturulma_tarihi",
                {
                    ascending: false,
                },
            )
            .limit(
                guvenliLimit,
            );

    if (error) {
        console.error(
            "Coin hareketleri alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Coin hareketleri alınamadı.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function ogunCoinKazandir({
    ogunId,
    ogunAdi,
    tarih,
}) {
    if (!ogunId) {
        throw new Error(
            "Öğün coin işlemi için ogunId zorunludur.",
        );
    }

    const gun =
        tarih ||
        bugununTarihiniGetir();

    return coinKazandir({
        islemTuru:
            "ogun-tamamlandi",

        aciklama:
            `${ogunAdi || "Öğün"} tamamlandı`,

        kaynakId:
            ogunId,

        benzersizAnahtar:
            `coin-ogun-${gun}-${ogunId}`,

        ekVeri: {
            ogun_id:
                ogunId,

            ogun_adi:
                ogunAdi || null,

            tarih:
                gun,
        },
    });
}

export async function suCoinKazandir({
    bardakSayisi,
    hedef,
    tarih,
}) {
    const gun =
        tarih ||
        bugununTarihiniGetir();

    const yeniBardakSayisi =
        Number(
            bardakSayisi,
        );

    if (
        !Number.isFinite(
            yeniBardakSayisi,
        ) ||
        yeniBardakSayisi <= 0
    ) {
        throw new Error(
            "Geçerli bir bardak sayısı gönderilmelidir.",
        );
    }

    return coinKazandir({
        islemTuru:
            "su-icildi",

        aciklama:
            `${yeniBardakSayisi}. bardak su içildi`,

        kaynakId:
            `${gun}-${yeniBardakSayisi}`,

        benzersizAnahtar:
            `coin-su-${gun}-${yeniBardakSayisi}`,

        ekVeri: {
            bardak_sayisi:
                yeniBardakSayisi,

            hedef:
                Number(hedef) || null,

            tarih:
                gun,
        },
    });
}

export async function suHedefiCoinKazandir({
    bardakSayisi,
    hedef,
    tarih,
}) {
    const gun =
        tarih ||
        bugununTarihiniGetir();

    return coinKazandir({
        islemTuru:
            "su-hedefi-tamamlandi",

        aciklama:
            "Günlük su hedefi tamamlandı",

        kaynakId:
            gun,

        benzersizAnahtar:
            `coin-su-hedefi-${gun}`,

        ekVeri: {
            bardak_sayisi:
                Number(
                    bardakSayisi,
                ) || 0,

            hedef:
                Number(hedef) || 0,

            tarih:
                gun,
        },
    });
}

export async function tumOgunlerCoinKazandir({
    tamamlananOgunSayisi,
    toplamOgunSayisi,
    tarih,
}) {
    const gun =
        tarih ||
        bugununTarihiniGetir();

    return coinKazandir({
        islemTuru:
            "tum-ogunler-tamamlandi",

        aciklama:
            "Bugünkü bütün öğünler tamamlandı",

        kaynakId:
            gun,

        benzersizAnahtar:
            `coin-tum-ogunler-${gun}`,

        ekVeri: {
            tamamlanan_ogun_sayisi:
                Number(
                    tamamlananOgunSayisi,
                ) || 0,

            toplam_ogun_sayisi:
                Number(
                    toplamOgunSayisi,
                ) || 0,

            tarih:
                gun,
        },
    });
}

export function bugununTarihiniGetir() {
    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "Europe/Istanbul",

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",
        },
    ).format(
        new Date(),
    );
}