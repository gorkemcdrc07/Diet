import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase bağlantısı hazır değil.",
        );
    }
}

async function aktifKullaniciyiGetir() {
    supabaseKontrolEt();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        console.error(
            "İlaç kullanıcısı alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    if (!user) {
        throw new Error(
            "İlaç hatırlatmasını kullanmak için giriş yapmalısın.",
        );
    }

    return user;
}

export function bugununTarihiniGetir() {
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

export function istanbulSaatiniGetir() {
    return new Date(
        new Date().toLocaleString(
            "en-US",
            {
                timeZone:
                    "Europe/Istanbul",
            },
        ),
    );
}

export async function ilacAyariniGetir() {
    const user =
        await aktifKullaniciyiGetir();

    const { data, error } = await supabase
        .from("ilac_hatirlatma_ayarlari")
        .select(`
            id,
            user_id,
            ilac_adi,
            aksam_yemegi_saati,
            yemekten_sonra_dakika,
            tekrar_dakika,
            aktif,
            olusturulma_tarihi,
            guncellenme_tarihi
        `)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error(
            "İlaç ayarı alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "İlaç ayarı alınamadı.",
        );
    }

    return data;
}

export async function ilacAyariniKaydet({
    ilacAdi,
    aksamYemegiSaati,
    yemektenSonraDakika = 0,
    tekrarDakika = 10,
    aktif = true,
}) {
    const user =
        await aktifKullaniciyiGetir();

    const temizIlacAdi =
        String(ilacAdi || "").trim();

    if (!temizIlacAdi) {
        throw new Error(
            "İlaç adı zorunludur.",
        );
    }

    if (!aksamYemegiSaati) {
        throw new Error(
            "Akşam yemeği saati zorunludur.",
        );
    }

    const guvenliYemekSonrasi =
        Math.max(
            0,
            Math.floor(
                Number(
                    yemektenSonraDakika,
                ) || 0,
            ),
        );

    const guvenliTekrar =
        Math.max(
            5,
            Math.floor(
                Number(tekrarDakika) ||
                10,
            ),
        );

    const { data, error } = await supabase
        .from("ilac_hatirlatma_ayarlari")
        .upsert(
            {
                user_id: user.id,
                ilac_adi: temizIlacAdi,
                aksam_yemegi_saati:
                    aksamYemegiSaati,
                yemekten_sonra_dakika:
                    guvenliYemekSonrasi,
                tekrar_dakika:
                    guvenliTekrar,
                aktif: Boolean(aktif),
                guncellenme_tarihi:
                    new Date().toISOString(),
            },
            {
                onConflict: "user_id",
            },
        )
        .select()
        .single();

    if (error) {
        console.error(
            "İlaç ayarı kaydedilemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "İlaç ayarı kaydedilemedi.",
        );
    }

    return data;
}

export async function bugunkuIlacDurumunuGetir(
    ayarId,
) {
    if (!ayarId) {
        return null;
    }

    const user =
        await aktifKullaniciyiGetir();

    const tarih =
        bugununTarihiniGetir();

    const { data, error } = await supabase
        .from("ilac_gunluk_durumlari")
        .select(`
            id,
            user_id,
            ayar_id,
            tarih,
            durum,
            ilk_hatirlatma_zamani,
            son_hatirlatma_zamani,
            sonraki_hatirlatma_zamani,
            hatirlatma_sayisi,
            icilme_zamani,
            olusturulma_tarihi,
            guncellenme_tarihi
        `)
        .eq("user_id", user.id)
        .eq("ayar_id", ayarId)
        .eq("tarih", tarih)
        .maybeSingle();

    if (error) {
        console.error(
            "Günlük ilaç durumu alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Günlük ilaç durumu alınamadı.",
        );
    }

    return data;
}

export async function bugunkuIlacDurumunuOlustur({
    ayarId,
    ilkHatirlatmaZamani,
}) {
    const user =
        await aktifKullaniciyiGetir();

    const tarih =
        bugununTarihiniGetir();

    const { data, error } = await supabase
        .from("ilac_gunluk_durumlari")
        .upsert(
            {
                user_id: user.id,
                ayar_id: ayarId,
                tarih,
                durum: "bekliyor",
                ilk_hatirlatma_zamani:
                    ilkHatirlatmaZamani,
                sonraki_hatirlatma_zamani:
                    ilkHatirlatmaZamani,
                guncellenme_tarihi:
                    new Date().toISOString(),
            },
            {
                onConflict:
                    "user_id,ayar_id,tarih",
                ignoreDuplicates: false,
            },
        )
        .select()
        .single();

    if (error) {
        console.error(
            "Günlük ilaç durumu oluşturulamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Günlük ilaç durumu oluşturulamadı.",
        );
    }

    return data;
}

export async function ilacHatirlatmasiniIsle({
    durumId,
    tekrarDakika = 10,
}) {
    if (!durumId) {
        throw new Error(
            "İlaç durum kaydı bulunamadı.",
        );
    }

    const sonrakiZaman =
        new Date(
            Date.now() +
            Number(tekrarDakika) *
            60 *
            1000,
        ).toISOString();

    const { data, error } = await supabase
        .from("ilac_gunluk_durumlari")
        .update({
            durum:
                "hatirlatiliyor",

            son_hatirlatma_zamani:
                new Date().toISOString(),

            sonraki_hatirlatma_zamani:
                sonrakiZaman,

            guncellenme_tarihi:
                new Date().toISOString(),
        })
        .eq("id", durumId)
        .neq("durum", "icildi")
        .select()
        .maybeSingle();

    if (error) {
        console.error(
            "İlaç hatırlatması güncellenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "İlaç hatırlatması güncellenemedi.",
        );
    }

    if (!data) {
        return null;
    }

    const yeniSayac =
        Number(
            data.hatirlatma_sayisi,
        ) + 1;

    const {
        data: sayacliData,
        error: sayacError,
    } = await supabase
        .from("ilac_gunluk_durumlari")
        .update({
            hatirlatma_sayisi:
                yeniSayac,
        })
        .eq("id", durumId)
        .select()
        .single();

    if (sayacError) {
        console.error(
            "Hatırlatma sayacı güncellenemedi:",
            sayacError,
        );

        return data;
    }

    return sayacliData;
}

export async function ilaciIctim({
    durumId,
}) {
    if (!durumId) {
        throw new Error(
            "İlaç durum kaydı bulunamadı.",
        );
    }

    const { data, error } = await supabase
        .from("ilac_gunluk_durumlari")
        .update({
            durum: "icildi",
            icilme_zamani:
                new Date().toISOString(),
            sonraki_hatirlatma_zamani:
                null,
            guncellenme_tarihi:
                new Date().toISOString(),
        })
        .eq("id", durumId)
        .select()
        .single();

    if (error) {
        console.error(
            "İlaç içildi olarak işaretlenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "İlaç durumu güncellenemedi.",
        );
    }

    return data;
}