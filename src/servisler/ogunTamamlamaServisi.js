import {
    supabase,
    supabaseHazir,
} from "./supabase";

import {
    yemekFotografiniSil,
    yemekFotografiniYukle,
} from "./yemekFotografiYuklemeServisi";

const TABLO_ADI =
    "ogun_tamamlama_kayitlari";

function supabaseKontrolEt() {
    if (
        !supabaseHazir ||
        !supabase
    ) {
        throw new Error(
            "Supabase bağlantısı hazır değil.",
        );
    }
}

async function aktifKullaniciyiGetir() {
    supabaseKontrolEt();

    const {
        data: {
            user,
        },
        error,
    } =
        await supabase.auth.getUser();

    if (error) {
        throw new Error(
            error.message ||
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    if (!user) {
        throw new Error(
            "Bu işlem için giriş yapmalısın.",
        );
    }

    return user;
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
    ).format(new Date());
}

export async function gunlukOgunTamamlamaKayitlariniGetir(
    tarih = null,
) {
    const user =
        await aktifKullaniciyiGetir();

    const sorguTarihi =
        tarih ||
        bugununTarihiniGetir();

    const {
        data,
        error,
    } =
        await supabase
            .from(TABLO_ADI)
            .select(`
                id,
                user_id,
                ogun_id,
                tarih,
                fotograf_url,
                fotograf_dosya_yolu,
                not_metni,
                kalori_analizine_gonderildi,
                olusturulma_tarihi,
                guncellenme_tarihi
            `)
            .eq(
                "user_id",
                user.id,
            )
            .eq(
                "tarih",
                sorguTarihi,
            )
            .order(
                "olusturulma_tarihi",
                {
                    ascending:
                        true,
                },
            );

    if (error) {
        throw new Error(
            error.message ||
            "Öğün tamamlama kayıtları alınamadı.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function ogunTamamlamaKaydiniKaydet({
    ogunId,
    fotograf = null,
    notMetni = "",
    kaloriAnalizineGonderildi = false,
    tarih = null,
}) {
    const user =
        await aktifKullaniciyiGetir();

    if (
        ogunId === null ||
        ogunId === undefined
    ) {
        throw new Error(
            "Öğün bilgisi bulunamadı.",
        );
    }

    const kayitTarihi =
        tarih ||
        bugununTarihiniGetir();

    const {
        data:
        mevcutKayit,
        error:
        mevcutKayitHatasi,
    } =
        await supabase
            .from(TABLO_ADI)
            .select(`
                id,
                fotograf_url,
                fotograf_dosya_yolu
            `)
            .eq(
                "user_id",
                user.id,
            )
            .eq(
                "ogun_id",
                String(ogunId),
            )
            .eq(
                "tarih",
                kayitTarihi,
            )
            .maybeSingle();

    if (mevcutKayitHatasi) {
        throw new Error(
            mevcutKayitHatasi.message ||
            "Mevcut öğün kaydı kontrol edilemedi.",
        );
    }

    let fotografUrl =
        mevcutKayit?.fotograf_url ||
        null;

    let fotografDosyaYolu =
        mevcutKayit
            ?.fotograf_dosya_yolu ||
        null;

    let yeniFotografYuklendi =
        false;

    try {
        if (fotograf) {
            const yuklemeSonucu =
                await yemekFotografiniYukle(
                    fotograf,
                );

            fotografUrl =
                yuklemeSonucu.publicUrl;

            fotografDosyaYolu =
                yuklemeSonucu.dosyaYolu;

            yeniFotografYuklendi =
                true;
        }

        const payload = {
            user_id:
                user.id,

            ogun_id:
                String(ogunId),

            tarih:
                kayitTarihi,

            fotograf_url:
                fotografUrl,

            fotograf_dosya_yolu:
                fotografDosyaYolu,

            not_metni:
                String(
                    notMetni || "",
                ).trim() ||
                null,

            kalori_analizine_gonderildi:
                Boolean(
                    kaloriAnalizineGonderildi,
                ),

            guncellenme_tarihi:
                new Date()
                    .toISOString(),
        };

        const {
            data,
            error,
        } =
            await supabase
                .from(TABLO_ADI)
                .upsert(
                    payload,
                    {
                        onConflict:
                            "user_id,ogun_id,tarih",
                    },
                )
                .select()
                .single();

        if (error) {
            throw error;
        }

        if (
            yeniFotografYuklendi &&
            mevcutKayit
                ?.fotograf_dosya_yolu &&
            mevcutKayit
                .fotograf_dosya_yolu !==
            fotografDosyaYolu
        ) {
            try {
                await yemekFotografiniSil(
                    mevcutKayit
                        .fotograf_dosya_yolu,
                );
            } catch (
            eskiFotografSilmeHatasi
            ) {
                console.warn(
                    "Eski öğün fotoğrafı silinemedi:",
                    eskiFotografSilmeHatasi,
                );
            }
        }

        return data;
    } catch (error) {
        if (
            yeniFotografYuklendi &&
            fotografDosyaYolu
        ) {
            try {
                await yemekFotografiniSil(
                    fotografDosyaYolu,
                );
            } catch (
            rollbackHatasi
            ) {
                console.warn(
                    "Başarısız öğün kaydı sonrası fotoğraf silinemedi:",
                    rollbackHatasi,
                );
            }
        }

        throw new Error(
            error?.message ||
            "Öğün tamamlama kaydı oluşturulamadı.",
        );
    }
}

export async function ogunTamamlamaKaydiniSil({
    ogunId,
    tarih = null,
}) {
    const user =
        await aktifKullaniciyiGetir();

    const kayitTarihi =
        tarih ||
        bugununTarihiniGetir();

    const {
        data:
        mevcutKayit,
        error:
        kayitHatasi,
    } =
        await supabase
            .from(TABLO_ADI)
            .select(`
                id,
                fotograf_dosya_yolu
            `)
            .eq(
                "user_id",
                user.id,
            )
            .eq(
                "ogun_id",
                String(ogunId),
            )
            .eq(
                "tarih",
                kayitTarihi,
            )
            .maybeSingle();

    if (kayitHatasi) {
        throw new Error(
            kayitHatasi.message ||
            "Öğün kaydı bulunamadı.",
        );
    }

    const {
        error:
        silmeHatasi,
    } =
        await supabase
            .from(TABLO_ADI)
            .delete()
            .eq(
                "user_id",
                user.id,
            )
            .eq(
                "ogun_id",
                String(ogunId),
            )
            .eq(
                "tarih",
                kayitTarihi,
            );

    if (silmeHatasi) {
        throw new Error(
            silmeHatasi.message ||
            "Öğün kaydı silinemedi.",
        );
    }

    if (
        mevcutKayit
            ?.fotograf_dosya_yolu
    ) {
        try {
            await yemekFotografiniSil(
                mevcutKayit
                    .fotograf_dosya_yolu,
            );
        } catch (
        storageHatasi
        ) {
            console.warn(
                "Öğün kaydı silindi ancak fotoğraf silinemedi:",
                storageHatasi,
            );
        }
    }

    return true;
}