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
            "Kullanıcı bilgisi alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    if (!user) {
        throw new Error(
            "Oturum açmış kullanıcı bulunamadı.",
        );
    }

    return user;
}

function saatDegeriniTemizle(saat) {
    if (!saat) {
        return "12:00:00";
    }

    const metin =
        String(saat).trim();

    if (/^\d{2}:\d{2}$/.test(metin)) {
        return `${metin}:00`;
    }

    if (
        /^\d{2}:\d{2}:\d{2}$/.test(
            metin,
        )
    ) {
        return metin;
    }

    throw new Error(
        "Öğün saati HH:mm formatında olmalıdır.",
    );
}

function ogunKodunuOlustur(
    ogunAdi,
    sira = 0,
) {
    const temizAd =
        String(
            ogunAdi || "ogun",
        )
            .toLocaleLowerCase("tr-TR")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                "",
            )
            .replace(/ı/g, "i")
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    return `${temizAd || "ogun"}-${Number(sira) || 0}`;
}

export async function beslenmePlanlariniGetir() {
    const user =
        await aktifKullaniciyiGetir();

    const { data, error } =
        await supabase
            .from("beslenme_planlari")
            .select(
                `
                id,
                user_id,
                plan_adi,
                kaynak_dosya_adi,
                kaynak_dosya_yolu,
                diyetisyen_adi,
                plan_tarihi,
                aktif,
                pdf_islenme_durumu,
                olusturulma_tarihi,
                guncellenme_tarihi
                `,
            )
            .eq("user_id", user.id)
            .order("aktif", {
                ascending: false,
            })
            .order(
                "olusturulma_tarihi",
                {
                    ascending: false,
                },
            );

    if (error) {
        console.error(
            "Beslenme planları alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Beslenme planları alınamadı.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function aktifBeslenmePlaniniGetir() {
    const user =
        await aktifKullaniciyiGetir();

    const { data, error } =
        await supabase
            .from("beslenme_planlari")
            .select(
                `
                id,
                user_id,
                plan_adi,
                kaynak_dosya_adi,
                kaynak_dosya_yolu,
                diyetisyen_adi,
                plan_tarihi,
                aktif,
                pdf_islenme_durumu,
                olusturulma_tarihi,
                guncellenme_tarihi,
                ogunler:beslenme_plani_ogunleri (
                    id,
                    plan_id,
                    ogun_kodu,
                    ogun_adi,
                    saat,
                    ikon,
                    aciklama,
                    sira,
                    aktif,
                    detaylar:beslenme_plani_ogun_detaylari (
                        id,
                        ogun_id,
                        baslik,
                        miktar,
                        aciklama,
                        alternatifler,
                        sira,
                        aktif
                    )
                )
                `,
            )
            .eq("user_id", user.id)
            .eq("aktif", true)
            .maybeSingle();

    if (error) {
        console.error(
            "Aktif beslenme planı alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Aktif beslenme planı alınamadı.",
        );
    }

    if (!data) {
        return null;
    }

    const siraliOgunler =
        Array.isArray(data.ogunler)
            ? [...data.ogunler]
                .filter(
                    (ogun) =>
                        ogun.aktif !== false,
                )
                .sort(
                    (a, b) =>
                        Number(a.sira) -
                        Number(b.sira),
                )
                .map((ogun) => ({
                    ...ogun,
                    saat:
                        String(
                            ogun.saat ||
                            "",
                        ).slice(0, 5),

                    detaylar:
                        Array.isArray(
                            ogun.detaylar,
                        )
                            ? [
                                ...ogun.detaylar,
                            ]
                                .filter(
                                    (
                                        detay,
                                    ) =>
                                        detay.aktif !==
                                        false,
                                )
                                .sort(
                                    (
                                        a,
                                        b,
                                    ) =>
                                        Number(
                                            a.sira,
                                        ) -
                                        Number(
                                            b.sira,
                                        ),
                                )
                            : [],
                }))
            : [];

    return {
        ...data,
        ogunler: siraliOgunler,
    };
}

export async function beslenmePlaniDetayiniGetir(
    planId,
) {
    if (!planId) {
        throw new Error(
            "Plan seçilmedi.",
        );
    }

    const user =
        await aktifKullaniciyiGetir();

    const { data, error } =
        await supabase
            .from("beslenme_planlari")
            .select(
                `
                id,
                user_id,
                plan_adi,
                kaynak_dosya_adi,
                kaynak_dosya_yolu,
                diyetisyen_adi,
                plan_tarihi,
                aktif,
                pdf_islenme_durumu,
                olusturulma_tarihi,
                guncellenme_tarihi,
                ogunler:beslenme_plani_ogunleri (
                    id,
                    plan_id,
                    ogun_kodu,
                    ogun_adi,
                    saat,
                    ikon,
                    aciklama,
                    sira,
                    aktif,
                    detaylar:beslenme_plani_ogun_detaylari (
                        id,
                        ogun_id,
                        baslik,
                        miktar,
                        aciklama,
                        alternatifler,
                        sira,
                        aktif
                    )
                )
                `,
            )
            .eq("id", planId)
            .eq("user_id", user.id)
            .single();

    if (error) {
        console.error(
            "Beslenme planı detayı alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Beslenme planı detayı alınamadı.",
        );
    }

    return {
        ...data,
        ogunler:
            Array.isArray(data.ogunler)
                ? [...data.ogunler]
                    .sort(
                        (a, b) =>
                            Number(a.sira) -
                            Number(b.sira),
                    )
                    .map((ogun) => ({
                        ...ogun,
                        saat:
                            String(
                                ogun.saat ||
                                "",
                            ).slice(0, 5),

                        detaylar:
                            Array.isArray(
                                ogun.detaylar,
                            )
                                ? [
                                    ...ogun.detaylar,
                                ].sort(
                                    (
                                        a,
                                        b,
                                    ) =>
                                        Number(
                                            a.sira,
                                        ) -
                                        Number(
                                            b.sira,
                                        ),
                                )
                                : [],
                    }))
                : [],
    };
}

export async function beslenmePlaniOlustur({
    planAdi,
    kaynakDosyaAdi = null,
    kaynakDosyaYolu = null,
    diyetisyenAdi = null,
    planTarihi = null,
    aktif = false,
}) {
    const user =
        await aktifKullaniciyiGetir();

    if (!String(planAdi || "").trim()) {
        throw new Error(
            "Plan adı zorunludur.",
        );
    }

    if (aktif) {
        const { error: kapatmaHatasi } =
            await supabase
                .from("beslenme_planlari")
                .update({
                    aktif: false,
                    guncellenme_tarihi:
                        new Date().toISOString(),
                })
                .eq("user_id", user.id)
                .eq("aktif", true);

        if (kapatmaHatasi) {
            throw new Error(
                kapatmaHatasi.message ||
                "Eski aktif plan kapatılamadı.",
            );
        }
    }

    const { data, error } =
        await supabase
            .from("beslenme_planlari")
            .insert({
                user_id: user.id,
                plan_adi:
                    String(planAdi).trim(),
                kaynak_dosya_adi:
                    kaynakDosyaAdi,
                kaynak_dosya_yolu:
                    kaynakDosyaYolu,
                diyetisyen_adi:
                    diyetisyenAdi,
                plan_tarihi:
                    planTarihi || null,
                aktif:
                    Boolean(aktif),
                pdf_islenme_durumu:
                    "hazir",
            })
            .select()
            .single();

    if (error) {
        console.error(
            "Beslenme planı oluşturulamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Beslenme planı oluşturulamadı.",
        );
    }

    return data;
}

export async function beslenmePlaniniGuncelle({
    planId,
    planAdi,
    diyetisyenAdi = null,
    planTarihi = null,
}) {
    if (!planId) {
        throw new Error(
            "Güncellenecek plan seçilmedi.",
        );
    }

    const user =
        await aktifKullaniciyiGetir();

    const guncelleme = {
        guncellenme_tarihi:
            new Date().toISOString(),
    };

    if (
        planAdi !== undefined
    ) {
        const temizPlanAdi =
            String(planAdi || "").trim();

        if (!temizPlanAdi) {
            throw new Error(
                "Plan adı boş bırakılamaz.",
            );
        }

        guncelleme.plan_adi =
            temizPlanAdi;
    }

    if (
        diyetisyenAdi !== undefined
    ) {
        guncelleme.diyetisyen_adi =
            diyetisyenAdi || null;
    }

    if (
        planTarihi !== undefined
    ) {
        guncelleme.plan_tarihi =
            planTarihi || null;
    }

    const { data, error } =
        await supabase
            .from("beslenme_planlari")
            .update(guncelleme)
            .eq("id", planId)
            .eq("user_id", user.id)
            .select()
            .single();

    if (error) {
        console.error(
            "Beslenme planı güncellenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Beslenme planı güncellenemedi.",
        );
    }

    return data;
}

export async function beslenmePlaniniAktifYap(
    planId,
) {
    if (!planId) {
        throw new Error(
            "Aktif yapılacak plan seçilmedi.",
        );
    }

    const user =
        await aktifKullaniciyiGetir();

    const { error: kapatmaHatasi } =
        await supabase
            .from("beslenme_planlari")
            .update({
                aktif: false,
                guncellenme_tarihi:
                    new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("aktif", true);

    if (kapatmaHatasi) {
        console.error(
            "Mevcut plan kapatılamadı:",
            kapatmaHatasi,
        );

        throw new Error(
            kapatmaHatasi.message ||
            "Mevcut aktif plan kapatılamadı.",
        );
    }

    const { data, error } =
        await supabase
            .from("beslenme_planlari")
            .update({
                aktif: true,
                guncellenme_tarihi:
                    new Date().toISOString(),
            })
            .eq("id", planId)
            .eq("user_id", user.id)
            .select()
            .single();

    if (error) {
        console.error(
            "Plan aktif yapılamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Plan aktif yapılamadı.",
        );
    }

    return data;
}

export async function beslenmePlaniniSil(
    planId,
) {
    if (!planId) {
        throw new Error(
            "Silinecek plan seçilmedi.",
        );
    }

    const user =
        await aktifKullaniciyiGetir();

    const { data: plan, error: planHatasi } =
        await supabase
            .from("beslenme_planlari")
            .select("id, aktif")
            .eq("id", planId)
            .eq("user_id", user.id)
            .single();

    if (planHatasi) {
        throw new Error(
            planHatasi.message ||
            "Plan bulunamadı.",
        );
    }

    const { error } =
        await supabase
            .from("beslenme_planlari")
            .delete()
            .eq("id", planId)
            .eq("user_id", user.id);

    if (error) {
        console.error(
            "Beslenme planı silinemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Beslenme planı silinemedi.",
        );
    }

    if (plan?.aktif) {
        const { data: sonrakiPlan } =
            await supabase
                .from("beslenme_planlari")
                .select("id")
                .eq("user_id", user.id)
                .order(
                    "olusturulma_tarihi",
                    {
                        ascending: false,
                    },
                )
                .limit(1)
                .maybeSingle();

        if (sonrakiPlan?.id) {
            await beslenmePlaniniAktifYap(
                sonrakiPlan.id,
            );
        }
    }

    return true;
}

export async function ogunEkle({
    planId,
    ogunAdi,
    saat,
    ikon = "🍽️",
    aciklama = null,
    sira = 0,
    ogunKodu = null,
}) {
    if (!planId) {
        throw new Error(
            "Öğünün ekleneceği plan seçilmedi.",
        );
    }

    if (!String(ogunAdi || "").trim()) {
        throw new Error(
            "Öğün adı zorunludur.",
        );
    }

    const { data, error } =
        await supabase
            .from(
                "beslenme_plani_ogunleri",
            )
            .insert({
                plan_id: planId,
                ogun_kodu:
                    ogunKodu ||
                    ogunKodunuOlustur(
                        ogunAdi,
                        sira,
                    ),
                ogun_adi:
                    String(ogunAdi).trim(),
                saat:
                    saatDegeriniTemizle(
                        saat,
                    ),
                ikon:
                    ikon || "🍽️",
                aciklama:
                    aciklama || null,
                sira:
                    Number(sira) || 0,
                aktif: true,
            })
            .select()
            .single();

    if (error) {
        console.error(
            "Öğün eklenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Öğün eklenemedi.",
        );
    }

    return {
        ...data,
        saat:
            String(data.saat).slice(
                0,
                5,
            ),
    };
}

export async function ogunGuncelle({
    ogunId,
    ogunAdi,
    saat,
    ikon,
    aciklama,
    sira,
    aktif,
}) {
    if (!ogunId) {
        throw new Error(
            "Güncellenecek öğün seçilmedi.",
        );
    }

    const guncelleme = {
        guncellenme_tarihi:
            new Date().toISOString(),
    };

    if (ogunAdi !== undefined) {
        const temizAd =
            String(ogunAdi || "").trim();

        if (!temizAd) {
            throw new Error(
                "Öğün adı boş bırakılamaz.",
            );
        }

        guncelleme.ogun_adi =
            temizAd;
    }

    if (saat !== undefined) {
        guncelleme.saat =
            saatDegeriniTemizle(
                saat,
            );
    }

    if (ikon !== undefined) {
        guncelleme.ikon =
            ikon || "🍽️";
    }

    if (aciklama !== undefined) {
        guncelleme.aciklama =
            aciklama || null;
    }

    if (sira !== undefined) {
        guncelleme.sira =
            Number(sira) || 0;
    }

    if (aktif !== undefined) {
        guncelleme.aktif =
            Boolean(aktif);
    }

    const { data, error } =
        await supabase
            .from(
                "beslenme_plani_ogunleri",
            )
            .update(guncelleme)
            .eq("id", ogunId)
            .select()
            .single();

    if (error) {
        console.error(
            "Öğün güncellenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Öğün güncellenemedi.",
        );
    }

    return {
        ...data,
        saat:
            String(data.saat).slice(
                0,
                5,
            ),
    };
}

export async function ogunSil(
    ogunId,
) {
    if (!ogunId) {
        throw new Error(
            "Silinecek öğün seçilmedi.",
        );
    }

    const { error } =
        await supabase
            .from(
                "beslenme_plani_ogunleri",
            )
            .delete()
            .eq("id", ogunId);

    if (error) {
        console.error(
            "Öğün silinemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Öğün silinemedi.",
        );
    }

    return true;
}

export async function ogunDetayiEkle({
    ogunId,
    baslik,
    miktar = null,
    aciklama = null,
    alternatifler = [],
    sira = 0,
}) {
    if (!ogunId) {
        throw new Error(
            "Detayın ekleneceği öğün seçilmedi.",
        );
    }

    if (!String(baslik || "").trim()) {
        throw new Error(
            "Besin başlığı zorunludur.",
        );
    }

    const { data, error } =
        await supabase
            .from(
                "beslenme_plani_ogun_detaylari",
            )
            .insert({
                ogun_id: ogunId,
                baslik:
                    String(baslik).trim(),
                miktar:
                    miktar || null,
                aciklama:
                    aciklama || null,
                alternatifler:
                    Array.isArray(
                        alternatifler,
                    )
                        ? alternatifler
                        : [],
                sira:
                    Number(sira) || 0,
                aktif: true,
            })
            .select()
            .single();

    if (error) {
        console.error(
            "Öğün detayı eklenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Öğün detayı eklenemedi.",
        );
    }

    return data;
}

export async function ogunDetayiGuncelle({
    detayId,
    baslik,
    miktar,
    aciklama,
    alternatifler,
    sira,
    aktif,
}) {
    if (!detayId) {
        throw new Error(
            "Güncellenecek detay seçilmedi.",
        );
    }

    const guncelleme = {
        guncellenme_tarihi:
            new Date().toISOString(),
    };

    if (baslik !== undefined) {
        guncelleme.baslik =
            baslik || null;
    }

    if (miktar !== undefined) {
        guncelleme.miktar =
            miktar || null;
    }

    if (aciklama !== undefined) {
        guncelleme.aciklama =
            aciklama || null;
    }

    if (
        alternatifler !== undefined
    ) {
        guncelleme.alternatifler =
            Array.isArray(
                alternatifler,
            )
                ? alternatifler
                : [];
    }

    if (sira !== undefined) {
        guncelleme.sira =
            Number(sira) || 0;
    }

    if (aktif !== undefined) {
        guncelleme.aktif =
            Boolean(aktif);
    }

    const { data, error } =
        await supabase
            .from(
                "beslenme_plani_ogun_detaylari",
            )
            .update(guncelleme)
            .eq("id", detayId)
            .select()
            .single();

    if (error) {
        console.error(
            "Öğün detayı güncellenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Öğün detayı güncellenemedi.",
        );
    }

    return data;
}

export async function ogunDetayiSil(
    detayId,
) {
    if (!detayId) {
        throw new Error(
            "Silinecek detay seçilmedi.",
        );
    }

    const { error } =
        await supabase
            .from(
                "beslenme_plani_ogun_detaylari",
            )
            .delete()
            .eq("id", detayId);

    if (error) {
        console.error(
            "Öğün detayı silinemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "Öğün detayı silinemedi.",
        );
    }

    return true;
}
export async function beslenmePdfiniYukle(
    dosya,
) {
    const user =
        await aktifKullaniciyiGetir();

    if (!dosya) {
        throw new Error(
            "Yüklenecek PDF seçilmedi.",
        );
    }

    if (
        dosya.type !==
        "application/pdf"
    ) {
        throw new Error(
            "Yalnızca PDF dosyası yüklenebilir.",
        );
    }

    const maksimumBoyut =
        10 * 1024 * 1024;

    if (
        dosya.size >
        maksimumBoyut
    ) {
        throw new Error(
            "PDF dosyası 10 MB'dan büyük olamaz.",
        );
    }

    const guvenliDosyaAdi =
        dosya.name
            .toLocaleLowerCase("tr-TR")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                "",
            )
            .replace(/ı/g, "i")
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(
                /[^a-z0-9._-]+/g,
                "-",
            );

    const dosyaYolu =
        `${user.id}/` +
        `${Date.now()}-` +
        guvenliDosyaAdi;

    const { data, error } =
        await supabase.storage
            .from(
                "beslenme-planlari",
            )
            .upload(
                dosyaYolu,
                dosya,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        "application/pdf",
                },
            );

    if (error) {
        console.error(
            "PDF yüklenemedi:",
            error,
        );

        throw new Error(
            error.message ||
            "PDF yüklenemedi.",
        );
    }

    return {
        dosyaAdi:
            dosya.name,

        dosyaYolu:
            data.path,
    };
}