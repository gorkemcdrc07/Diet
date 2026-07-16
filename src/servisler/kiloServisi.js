import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase bağlantısı hazır değil.",
        );
    }
}

async function aktifKullaniciyiGetir() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error(
            error.message ||
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    if (!user) {
        throw new Error(
            "Kilo işlemi için giriş yapılmalıdır.",
        );
    }

    return user;
}

export function bugununKiloTarihiniGetir() {
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

export async function kiloHedefiniGetir() {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const { data, error } =
        await supabase
            .from("kilo_hedefleri")
            .select(`
                user_id,
                baslangic_kilosu,
                hedef_kilo,
                hedef_turu,
                olusturulma_tarihi,
                guncellenme_tarihi
            `)
            .eq("user_id", user.id)
            .maybeSingle();

    if (error) {
        throw new Error(
            error.message ||
            "Kilo hedefi alınamadı.",
        );
    }

    return data;
}

export async function kiloHedefiniKaydet({
    baslangicKilosu,
    hedefKilo,
    hedefTuru,
}) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const guvenliBaslangic =
        Number(baslangicKilosu);

    const guvenliHedef =
        Number(hedefKilo);

    if (
        !Number.isFinite(guvenliBaslangic) ||
        guvenliBaslangic < 20 ||
        guvenliBaslangic > 300
    ) {
        throw new Error(
            "Başlangıç kilosu geçersiz.",
        );
    }

    if (
        !Number.isFinite(guvenliHedef) ||
        guvenliHedef < 20 ||
        guvenliHedef > 300
    ) {
        throw new Error(
            "Hedef kilo geçersiz.",
        );
    }

    const { data, error } =
        await supabase
            .from("kilo_hedefleri")
            .upsert(
                {
                    user_id: user.id,

                    baslangic_kilosu:
                        guvenliBaslangic,

                    hedef_kilo:
                        guvenliHedef,

                    hedef_turu:
                        hedefTuru ||
                        "kilo-al",

                    guncellenme_tarihi:
                        new Date()
                            .toISOString(),
                },
                {
                    onConflict:
                        "user_id",
                },
            )
            .select()
            .single();

    if (error) {
        throw new Error(
            error.message ||
            "Kilo hedefi kaydedilemedi.",
        );
    }

    return data;
}

export async function gunlukKiloKaydet({
    kilo,
    tarih,
    notMetni = null,
}) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const guvenliKilo =
        Number(kilo);

    if (
        !Number.isFinite(guvenliKilo) ||
        guvenliKilo < 20 ||
        guvenliKilo > 300
    ) {
        throw new Error(
            "20 ile 300 kilogram arasında geçerli bir kilo gir.",
        );
    }

    const kayitTarihi =
        tarih ||
        bugununKiloTarihiniGetir();

    const { data, error } =
        await supabase
            .from("kilo_kayitlari")
            .upsert(
                {
                    user_id: user.id,
                    tarih: kayitTarihi,
                    kilo: guvenliKilo,
                    not_metni:
                        notMetni || null,

                    guncellenme_tarihi:
                        new Date()
                            .toISOString(),
                },
                {
                    onConflict:
                        "user_id,tarih",
                },
            )
            .select()
            .single();

    if (error) {
        throw new Error(
            error.message ||
            "Kilo kaydı oluşturulamadı.",
        );
    }

    return data;
}

export async function kiloKayitlariniGetir(
    limit = 90,
) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const guvenliLimit =
        Math.min(
            Math.max(
                Number(limit) || 90,
                1,
            ),
            365,
        );

    const { data, error } =
        await supabase
            .from("kilo_kayitlari")
            .select(`
                id,
                tarih,
                kilo,
                not_metni,
                olusturulma_tarihi,
                guncellenme_tarihi
            `)
            .eq("user_id", user.id)
            .order("tarih", {
                ascending: false,
            })
            .limit(guvenliLimit);

    if (error) {
        throw new Error(
            error.message ||
            "Kilo kayıtları alınamadı.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function kiloOzetiniGetir() {
    const [
        hedef,
        kayitlar,
    ] = await Promise.all([
        kiloHedefiniGetir(),
        kiloKayitlariniGetir(90),
    ]);

    const bugun =
        bugununKiloTarihiniGetir();

    const bugunKaydi =
        kayitlar.find(
            (kayit) =>
                kayit.tarih === bugun,
        ) || null;

    const sonKayit =
        kayitlar[0] || null;

    const oncekiKayit =
        kayitlar[1] || null;

    const yediGunOnce =
        new Date();

    yediGunOnce.setDate(
        yediGunOnce.getDate() - 7,
    );

    const haftalikReferans =
        [...kayitlar]
            .reverse()
            .find(
                (kayit) =>
                    new Date(
                        `${kayit.tarih}T12:00:00`,
                    ) >= yediGunOnce,
            ) || null;

    const mevcutKilo =
        Number(
            sonKayit?.kilo,
        ) || null;

    const oncekiKilo =
        Number(
            oncekiKayit?.kilo,
        ) || null;

    const hedefKilo =
        Number(
            hedef?.hedef_kilo,
        ) || null;

    const baslangicKilosu =
        Number(
            hedef?.baslangic_kilosu,
        ) || null;

    return {
        hedef,
        kayitlar,
        bugunKaydi,
        sonKayit,
        mevcutKilo,
        oncekiKilo,
        hedefKilo,
        baslangicKilosu,

        gunlukDegisim:
            mevcutKilo !== null &&
                oncekiKilo !== null
                ? Number(
                    (
                        mevcutKilo -
                        oncekiKilo
                    ).toFixed(2),
                )
                : null,

        haftalikDegisim:
            mevcutKilo !== null &&
                haftalikReferans
                ? Number(
                    (
                        mevcutKilo -
                        Number(
                            haftalikReferans.kilo,
                        )
                    ).toFixed(2),
                )
                : null,

        hedefeKalan:
            mevcutKilo !== null &&
                hedefKilo !== null
                ? Number(
                    Math.abs(
                        hedefKilo -
                        mevcutKilo,
                    ).toFixed(2),
                )
                : null,
    };
}