import { supabase } from "../servisler/supabase";

/**
 * XP sistemi kullanılmadan önce aktif Supabase kullanıcısını hazırlar.
 *
 * Mevcut bir oturum varsa onu kullanır.
 * Oturum yoksa anonim kullanıcı oluşturur.
 */
async function xpKullanicisiniHazirla() {
    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error(
            "XP oturumu okunamadı:",
            sessionError,
        );

        throw new Error(
            sessionError.message ||
            "XP oturumu okunamadı.",
        );
    }

    if (session?.user) {
        return session.user;
    }

    const {
        data,
        error,
    } = await supabase.auth.signInAnonymously();

    if (error) {
        console.error(
            "Anonim oturum açılamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Anonim kullanıcı oturumu açılamadı.",
        );
    }

    if (!data?.user) {
        throw new Error(
            "Anonim kullanıcı oluşturulamadı.",
        );
    }

    return data.user;
}

/**
 * Supabase RPC üzerinden kullanıcıya XP kazandırır.
 *
 * XP miktarı frontend tarafından belirlenmez.
 * İşlem türüne göre Supabase fonksiyonu XP miktarını hesaplar.
 */
export async function xpKazandir({
    islemTuru,
    aciklama = null,
    karakter = "ikisi",
    kaynakId = null,
    benzersizAnahtar = null,
    ekVeri = {},
}) {
    if (!islemTuru) {
        throw new Error(
            "XP işlemi için islemTuru zorunludur.",
        );
    }

    await xpKullanicisiniHazirla();

    const { data, error } =
        await supabase.rpc("xp_kazandir", {
            p_islem_turu: islemTuru,
            p_aciklama: aciklama,
            p_karakter: karakter,
            p_kaynak_id:
                kaynakId === null ||
                    kaynakId === undefined
                    ? null
                    : String(kaynakId),
            p_benzersiz_anahtar:
                benzersizAnahtar,
            p_ek_veri: ekVeri,
        });

    if (error) {
        console.error(
            "XP kazandırma hatası:",
            error,
        );

        throw new Error(
            error.message ||
            "XP kazandırılamadı.",
        );
    }

    return data;
}

/**
 * Kullanıcının güncel XP ve seviye bilgilerini getirir.
 */
export async function xpOzetiGetir() {
    const user =
        await xpKullanicisiniHazirla();

    const { data, error } = await supabase
        .from("kullanici_xp_ozeti")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error(
            "XP özeti alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "XP özeti alınamadı.",
        );
    }

    /*
     * Kullanıcı henüz hiç XP kazanmadıysa
     * kullanici_xp tablosunda kayıt bulunmayabilir.
     * Kartın yine de görünmesi için başlangıç verisi döneriz.
     */
    if (!data) {
        return {
            user_id: user.id,
            toplam_xp: 0,
            bugunku_xp: 0,
            seviye: 1,

            mevcut_seviye_baslangic_xp: 0,
            sonraki_seviye_xp: 250,
            sonraki_seviyeye_kalan_xp: 250,
            seviye_ilerleme_yuzdesi: 0,

            mico_xp: 0,
            mico_seviye: 1,

            viki_xp: 0,
            viki_seviye: 1,

            pati_puani: 0,
        };
    }

    return data;
}

/**
 * Kullanıcının son XP hareketlerini getirir.
 */
export async function xpHareketleriniGetir(
    limit = 10,
) {
    await xpKullanicisiniHazirla();

    const guvenliLimit = Math.min(
        Math.max(
            Number(limit) || 10,
            1,
        ),
        100,
    );

    const { data, error } = await supabase
        .from("xp_hareketleri")
        .select(
            `
            id,
            islem_turu,
            aciklama,
            kazanilan_xp,
            karakter,
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
        .limit(guvenliLimit);

    if (error) {
        console.error(
            "XP hareketleri alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "XP hareketleri alınamadı.",
        );
    }

    return data || [];
}

/**
 * Bir öğün tamamlandığında çağrılır.
 */
export async function ogunXpKazandir({
    ogunId,
    ogunAdi,
    ogunSaati,
    tarih,
}) {
    if (
        ogunId === null ||
        ogunId === undefined ||
        ogunId === ""
    ) {
        throw new Error(
            "Öğün XP işlemi için ogunId zorunludur.",
        );
    }

    const gun =
        tarih ||
        bugununTarihiniGetir();

    return xpKazandir({
        islemTuru: "ogun-tamamlandi",
        aciklama:
            `${ogunAdi || "Öğün"} tamamlandı`,
        karakter: "ikisi",
        kaynakId: ogunId,
        benzersizAnahtar:
            `ogun-${gun}-${ogunId}`,

        ekVeri: {
            ogun_id: ogunId,
            ogun_adi:
                ogunAdi || null,
            ogun_saati:
                ogunSaati || null,
            tarih: gun,
        },
    });
}

/**
 * Kullanıcı su eklediğinde çağrılır.
 *
 * Her bardak için farklı benzersiz anahtar üretmek amacıyla
 * gün içindeki yeni bardak sayısı kullanılır.
 */
export async function suXpKazandir({
    bardakSayisi,
    hedef,
    tarih,
}) {
    const gun =
        tarih ||
        bugununTarihiniGetir();

    const yeniBardakSayisi =
        Number(bardakSayisi);

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

    return xpKazandir({
        islemTuru: "su-icildi",
        aciklama:
            `${yeniBardakSayisi}. bardak su içildi`,
        karakter: "viki",

        kaynakId:
            `${gun}-${yeniBardakSayisi}`,

        benzersizAnahtar:
            `su-${gun}-${yeniBardakSayisi}`,

        ekVeri: {
            bardak_sayisi:
                yeniBardakSayisi,

            hedef:
                Number(hedef) || null,

            tarih: gun,
        },
    });
}

/**
 * Günlük su hedefi ilk kez tamamlandığında çağrılır.
 */
export async function suHedefiXpKazandir({
    bardakSayisi,
    hedef,
    tarih,
}) {
    const gun =
        tarih ||
        bugununTarihiniGetir();

    return xpKazandir({
        islemTuru:
            "su-hedefi-tamamlandi",

        aciklama:
            "Günlük su hedefi tamamlandı",

        karakter: "viki",
        kaynakId: gun,

        benzersizAnahtar:
            `su-hedefi-${gun}`,

        ekVeri: {
            bardak_sayisi:
                Number(bardakSayisi) || 0,

            hedef:
                Number(hedef) || 0,

            tarih: gun,
        },
    });
}

/**
 * Günün bütün öğünleri tamamlandığında çağrılır.
 */
export async function tumOgunlerXpKazandir({
    tamamlananOgunSayisi,
    toplamOgunSayisi,
    tarih,
}) {
    const gun =
        tarih ||
        bugununTarihiniGetir();

    return xpKazandir({
        islemTuru:
            "tum-ogunler-tamamlandi",

        aciklama:
            "Bugünkü bütün öğünler tamamlandı",

        karakter: "ikisi",
        kaynakId: gun,

        benzersizAnahtar:
            `tum-ogunler-${gun}`,

        ekVeri: {
            tamamlanan_ogun_sayisi:
                Number(
                    tamamlananOgunSayisi,
                ) || 0,

            toplam_ogun_sayisi:
                Number(
                    toplamOgunSayisi,
                ) || 0,

            tarih: gun,
        },
    });
}

/**
 * Yerel tarihe göre YYYY-MM-DD üretir.
 *
 * UTC dönüşümünden kaynaklanan gün kayması yaşanmaması için
 * Europe/Istanbul saat dilimi kullanılır.
 */
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