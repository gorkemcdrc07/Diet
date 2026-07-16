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
            "Kalori işlemleri için giriş yapmalısın.",
        );
    }

    return user;
}

export function bugununKaloriTarihiniGetir() {
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

export function suAnkiSaatiGetir() {
    return new Intl.DateTimeFormat(
        "tr-TR",
        {
            timeZone: "Europe/Istanbul",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
        },
    ).format(new Date());
}

function guvenliSayiyaCevir(
    deger,
    varsayilan = 0,
) {
    const sayi = Number(
        String(
            deger ?? "",
        ).replace(",", "."),
    );

    return Number.isFinite(sayi)
        ? sayi
        : varsayilan;
}

function ogunTurunuDogrula(ogunTuru) {
    const gecerliTurler = [
        "kahvalti",
        "ara-ogun",
        "ogle",
        "aksam",
        "gece",
        "diger",
    ];

    return gecerliTurler.includes(
        ogunTuru,
    )
        ? ogunTuru
        : "diger";
}

export async function kaloriHedefiniGetir() {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const { data, error } =
        await supabase
            .from("kalori_hedefleri")
            .select(`
                user_id,
                gunluk_kalori_hedefi,
                protein_hedefi,
                karbonhidrat_hedefi,
                yag_hedefi,
                olusturulma_tarihi,
                guncellenme_tarihi
            `)
            .eq("user_id", user.id)
            .maybeSingle();

    if (error) {
        throw new Error(
            error.message ||
            "Kalori hedefleri alınamadı.",
        );
    }

    return data;
}

export async function kaloriHedefiniKaydet({
    gunlukKaloriHedefi,
    proteinHedefi,
    karbonhidratHedefi,
    yagHedefi,
}) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const kalori =
        Math.round(
            guvenliSayiyaCevir(
                gunlukKaloriHedefi,
            ),
        );

    const protein =
        guvenliSayiyaCevir(
            proteinHedefi,
        );

    const karbonhidrat =
        guvenliSayiyaCevir(
            karbonhidratHedefi,
        );

    const yag =
        guvenliSayiyaCevir(
            yagHedefi,
        );

    if (
        kalori < 500 ||
        kalori > 10000
    ) {
        throw new Error(
            "Günlük kalori hedefi 500 ile 10000 arasında olmalıdır.",
        );
    }

    if (
        protein < 0 ||
        karbonhidrat < 0 ||
        yag < 0
    ) {
        throw new Error(
            "Makro hedefleri negatif olamaz.",
        );
    }

    const { data, error } =
        await supabase
            .from("kalori_hedefleri")
            .upsert(
                {
                    user_id:
                        user.id,

                    gunluk_kalori_hedefi:
                        kalori,

                    protein_hedefi:
                        protein,

                    karbonhidrat_hedefi:
                        karbonhidrat,

                    yag_hedefi:
                        yag,

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
            "Kalori hedefleri kaydedilemedi.",
        );
    }

    return data;
}

export async function yemekKaydiEkle({
    ogunTuru,
    yemekAdi,
    porsiyonAciklamasi = "",
    kalori = 0,
    protein = 0,
    karbonhidrat = 0,
    yag = 0,
    fotografUrl = null,
    fotografDosyaYolu = null,
    kayitTuru = "manuel",
    aiTahmini = false,
    aiGuvenOrani = null,
    kullaniciOnayladi = true,
    notMetni = null,
    tarih = null,
    saat = null,
}) {

    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const temizYemekAdi =
        String(
            yemekAdi || "",
        ).trim();

    if (!temizYemekAdi) {
        throw new Error(
            "Yemek adı boş bırakılamaz.",
        );
    }

    const guvenliKalori =
        guvenliSayiyaCevir(
            kalori,
        );

    const guvenliProtein =
        guvenliSayiyaCevir(
            protein,
        );

    const guvenliKarbonhidrat =
        guvenliSayiyaCevir(
            karbonhidrat,
        );

    const guvenliYag =
        guvenliSayiyaCevir(
            yag,
        );

    if (
        guvenliKalori < 0 ||
        guvenliProtein < 0 ||
        guvenliKarbonhidrat < 0 ||
        guvenliYag < 0
    ) {
        throw new Error(
            "Kalori ve makro değerleri negatif olamaz.",
        );
    }

    const gecerliKayitTurleri = [
        "manuel",
        "fotograf",
        "program",
    ];

    const guvenliKayitTuru =
        gecerliKayitTurleri.includes(
            kayitTuru,
        )
            ? kayitTuru
            : "manuel";

    const { data, error } =
        await supabase
            .from("yemek_kayitlari")
            .insert({
                user_id:
                    user.id,

                tarih:
                    tarih ||
                    bugununKaloriTarihiniGetir(),

                saat:
                    saat ||
                    suAnkiSaatiGetir(),

                ogun_turu:
                    ogunTurunuDogrula(
                        ogunTuru,
                    ),

                yemek_adi:
                    temizYemekAdi,

                porsiyon_aciklamasi:
                    String(
                        porsiyonAciklamasi ||
                        "",
                    ).trim() || null,

                kalori:
                    guvenliKalori,

                protein:
                    guvenliProtein,

                karbonhidrat:
                    guvenliKarbonhidrat,

                yag:
                    guvenliYag,

                fotograf_url:
                    fotografUrl ||
                    null,

                fotograf_dosya_yolu:
                    fotografDosyaYolu ||
                    null,

                kayit_turu:
                    guvenliKayitTuru,

                ai_tahmini:
                    Boolean(
                        aiTahmini,
                    ),

                ai_guven_orani:
                    aiGuvenOrani === null ||
                        aiGuvenOrani === undefined
                        ? null
                        : guvenliSayiyaCevir(
                            aiGuvenOrani,
                        ),

                kullanici_onayladi:
                    Boolean(
                        kullaniciOnayladi,
                    ),

                not_metni:
                    notMetni
                        ? String(
                            notMetni,
                        ).trim()
                        : null,

                guncellenme_tarihi:
                    new Date()
                        .toISOString(),
            })
            .select()
            .single();

    if (error) {
        throw new Error(
            error.message ||
            "Yemek kaydı oluşturulamadı.",
        );
    }

    return data;
}

export async function yemekKaydiniGuncelle(
    kayitId,
    guncellemeler,
) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    if (!kayitId) {
        throw new Error(
            "Güncellenecek yemek kaydı bulunamadı.",
        );
    }

    const payload = {
        guncellenme_tarihi:
            new Date()
                .toISOString(),
    };

    if (
        guncellemeler?.yemekAdi !==
        undefined
    ) {
        const yemekAdi =
            String(
                guncellemeler.yemekAdi ||
                "",
            ).trim();

        if (!yemekAdi) {
            throw new Error(
                "Yemek adı boş bırakılamaz.",
            );
        }

        payload.yemek_adi =
            yemekAdi;
    }

    if (
        guncellemeler?.ogunTuru !==
        undefined
    ) {
        payload.ogun_turu =
            ogunTurunuDogrula(
                guncellemeler.ogunTuru,
            );
    }

    if (
        guncellemeler?.porsiyonAciklamasi !==
        undefined
    ) {
        payload.porsiyon_aciklamasi =
            String(
                guncellemeler
                    .porsiyonAciklamasi ||
                "",
            ).trim() || null;
    }

    const sayisalAlanlar = {
        kalori:
            "kalori",

        protein:
            "protein",

        karbonhidrat:
            "karbonhidrat",

        yag:
            "yag",
    };

    Object.entries(
        sayisalAlanlar,
    ).forEach(
        ([
            girisAlani,
            tabloAlani,
        ]) => {
            if (
                guncellemeler?.[
                girisAlani
                ] !== undefined
            ) {
                const deger =
                    guvenliSayiyaCevir(
                        guncellemeler[
                        girisAlani
                        ],
                    );

                if (deger < 0) {
                    throw new Error(
                        "Kalori ve makro değerleri negatif olamaz.",
                    );
                }

                payload[tabloAlani] =
                    deger;
            }
        },
    );

    const { data, error } =
        await supabase
            .from("yemek_kayitlari")
            .update(payload)
            .eq("id", kayitId)
            .eq("user_id", user.id)
            .select()
            .single();

    if (error) {
        throw new Error(
            error.message ||
            "Yemek kaydı güncellenemedi.",
        );
    }

    return data;
}



export async function fotografiKullananKayitSayisiniGetir(
    fotografDosyaYolu,
    haricKayitId = null,
) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    if (!fotografDosyaYolu) {
        return 0;
    }

    let sorgu =
        supabase
            .from("yemek_kayitlari")
            .select(
                "id",
                {
                    count: "exact",
                    head: true,
                },
            )
            .eq(
                "user_id",
                user.id,
            )
            .eq(
                "fotograf_dosya_yolu",
                fotografDosyaYolu,
            );

    if (
        haricKayitId !== null &&
        haricKayitId !== undefined
    ) {
        sorgu =
            sorgu.neq(
                "id",
                haricKayitId,
            );
    }

    const {
        count,
        error,
    } = await sorgu;

    if (error) {
        throw new Error(
            error.message ||
            "Fotoğraf kullanım bilgisi alınamadı.",
        );
    }

    return Number(count) || 0;
}

export async function yemekKaydiniSil(
    kayitId,
) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    if (!kayitId) {
        throw new Error(
            "Silinecek yemek kaydı bulunamadı.",
        );
    }

    const { error } =
        await supabase
            .from("yemek_kayitlari")
            .delete()
            .eq("id", kayitId)
            .eq("user_id", user.id);

    if (error) {
        throw new Error(
            error.message ||
            "Yemek kaydı silinemedi.",
        );
    }

    return true;
}

export async function gunlukYemekKayitlariniGetir(
    tarih = null,
) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    const seciliTarih =
        tarih ||
        bugununKaloriTarihiniGetir();

    const { data, error } =
        await supabase
            .from("yemek_kayitlari")
            .select(`
    id,
    tarih,
    saat,
    ogun_turu,
    yemek_adi,
    porsiyon_aciklamasi,
    kalori,
    protein,
    karbonhidrat,
    yag,
    fotograf_url,
    fotograf_dosya_yolu,
    kayit_turu,
    ai_tahmini,
    ai_guven_orani
`)

            .eq("user_id", user.id)
            .eq("tarih", seciliTarih)
            .order("saat", {
                ascending: false,
            });

    if (error) {
        throw new Error(
            error.message ||
            "Günlük yemek kayıtları alınamadı.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export async function tarihAraligindakiKayitlariGetir({
    baslangicTarihi,
    bitisTarihi,
}) {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    if (
        !baslangicTarihi ||
        !bitisTarihi
    ) {
        throw new Error(
            "Başlangıç ve bitiş tarihi gereklidir.",
        );
    }

    const { data, error } =
        await supabase
            .from("yemek_kayitlari")
            .select(`
                id,
                tarih,
                saat,
                ogun_turu,
                yemek_adi,
                porsiyon_aciklamasi,
                kalori,
                protein,
                karbonhidrat,
                yag,
                fotograf_url,
                kayit_turu,
                ai_tahmini,
                ai_guven_orani
            `)
            .eq("user_id", user.id)
            .gte(
                "tarih",
                baslangicTarihi,
            )
            .lte(
                "tarih",
                bitisTarihi,
            )
            .order("tarih", {
                ascending: true,
            })
            .order("saat", {
                ascending: true,
            });

    if (error) {
        throw new Error(
            error.message ||
            "Yemek geçmişi alınamadı.",
        );
    }

    return Array.isArray(data)
        ? data
        : [];
}

export function yemekKayitlariniTopla(
    kayitlar,
) {
    const guvenliKayitlar =
        Array.isArray(kayitlar)
            ? kayitlar
            : [];

    return guvenliKayitlar.reduce(
        (toplam, kayit) => {
            toplam.kalori +=
                guvenliSayiyaCevir(
                    kayit?.kalori,
                );

            toplam.protein +=
                guvenliSayiyaCevir(
                    kayit?.protein,
                );

            toplam.karbonhidrat +=
                guvenliSayiyaCevir(
                    kayit?.karbonhidrat,
                );

            toplam.yag +=
                guvenliSayiyaCevir(
                    kayit?.yag,
                );

            toplam.kayitSayisi += 1;

            return toplam;
        },
        {
            kalori: 0,
            protein: 0,
            karbonhidrat: 0,
            yag: 0,
            kayitSayisi: 0,
        },
    );
}

function tarihMetniniGetir(
    tarih,
) {
    const [yil, ay, gun] =
        String(tarih)
            .split("-")
            .map(Number);

    return new Date(
        yil,
        ay - 1,
        gun,
        12,
        0,
        0,
    );
}

export async function sonGunlerinOzetiniGetir(
    gunSayisi = 7,
) {
    const guvenliGunSayisi =
        Math.min(
            Math.max(
                Number(gunSayisi) || 7,
                1,
            ),
            90,
        );

    const bitis =
        tarihMetniniGetir(
            bugununKaloriTarihiniGetir(),
        );

    const baslangic =
        new Date(bitis);

    baslangic.setDate(
        baslangic.getDate() -
        (
            guvenliGunSayisi - 1
        ),
    );

    const formatlayici =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            },
        );

    const baslangicTarihi =
        formatlayici.format(
            baslangic,
        );

    const bitisTarihi =
        formatlayici.format(
            bitis,
        );

    const kayitlar =
        await tarihAraligindakiKayitlariGetir({
            baslangicTarihi,
            bitisTarihi,
        });

    const gunler = [];

    for (
        let index = 0;
        index < guvenliGunSayisi;
        index += 1
    ) {
        const tarih =
            new Date(
                baslangic,
            );

        tarih.setDate(
            baslangic.getDate() +
            index,
        );

        const tarihAnahtari =
            formatlayici.format(
                tarih,
            );

        const gununKayitlari =
            kayitlar.filter(
                (kayit) =>
                    kayit.tarih ===
                    tarihAnahtari,
            );

        gunler.push({
            tarih:
                tarihAnahtari,

            ...yemekKayitlariniTopla(
                gununKayitlari,
            ),
        });
    }

    const genelToplam =
        gunler.reduce(
            (toplam, gun) => {
                toplam.kalori +=
                    gun.kalori;

                toplam.protein +=
                    gun.protein;

                toplam.karbonhidrat +=
                    gun.karbonhidrat;

                toplam.yag +=
                    gun.yag;

                return toplam;
            },
            {
                kalori: 0,
                protein: 0,
                karbonhidrat: 0,
                yag: 0,
            },
        );

    const kayitliGunSayisi =
        gunler.filter(
            (gun) =>
                gun.kayitSayisi > 0,
        ).length;

    return {
        baslangicTarihi,
        bitisTarihi,
        gunSayisi:
            guvenliGunSayisi,

        kayitliGunSayisi,

        ortalamaKalori:
            kayitliGunSayisi > 0
                ? genelToplam.kalori /
                kayitliGunSayisi
                : 0,

        ortalamaProtein:
            kayitliGunSayisi > 0
                ? genelToplam.protein /
                kayitliGunSayisi
                : 0,

        ortalamaKarbonhidrat:
            kayitliGunSayisi > 0
                ? genelToplam.karbonhidrat /
                kayitliGunSayisi
                : 0,

        ortalamaYag:
            kayitliGunSayisi > 0
                ? genelToplam.yag /
                kayitliGunSayisi
                : 0,

        gunler,
    };
}

export async function gunlukKaloriOzetiniGetir(
    tarih = null,
) {
    const [
        hedef,
        kayitlar,
    ] = await Promise.all([
        kaloriHedefiniGetir(),
        gunlukYemekKayitlariniGetir(
            tarih,
        ),
    ]);

    const toplam =
        yemekKayitlariniTopla(
            kayitlar,
        );

    const gunlukKaloriHedefi =
        guvenliSayiyaCevir(
            hedef?.gunluk_kalori_hedefi,
            2000,
        );

    const proteinHedefi =
        guvenliSayiyaCevir(
            hedef?.protein_hedefi,
            100,
        );

    const karbonhidratHedefi =
        guvenliSayiyaCevir(
            hedef?.karbonhidrat_hedefi,
            250,
        );

    const yagHedefi =
        guvenliSayiyaCevir(
            hedef?.yag_hedefi,
            70,
        );

    return {
        tarih:
            tarih ||
            bugununKaloriTarihiniGetir(),

        hedef: {
            gunlukKaloriHedefi,
            proteinHedefi,
            karbonhidratHedefi,
            yagHedefi,
        },

        toplam,

        kalan: {
            kalori:
                Math.max(
                    gunlukKaloriHedefi -
                    toplam.kalori,
                    0,
                ),

            protein:
                Math.max(
                    proteinHedefi -
                    toplam.protein,
                    0,
                ),

            karbonhidrat:
                Math.max(
                    karbonhidratHedefi -
                    toplam.karbonhidrat,
                    0,
                ),

            yag:
                Math.max(
                    yagHedefi -
                    toplam.yag,
                    0,
                ),
        },

        yuzdeler: {
            kalori:
                gunlukKaloriHedefi > 0
                    ? Math.min(
                        Math.round(
                            (
                                toplam.kalori /
                                gunlukKaloriHedefi
                            ) * 100,
                        ),
                        100,
                    )
                    : 0,

            protein:
                proteinHedefi > 0
                    ? Math.min(
                        Math.round(
                            (
                                toplam.protein /
                                proteinHedefi
                            ) * 100,
                        ),
                        100,
                    )
                    : 0,

            karbonhidrat:
                karbonhidratHedefi > 0
                    ? Math.min(
                        Math.round(
                            (
                                toplam.karbonhidrat /
                                karbonhidratHedefi
                            ) * 100,
                        ),
                        100,
                    )
                    : 0,

            yag:
                yagHedefi > 0
                    ? Math.min(
                        Math.round(
                            (
                                toplam.yag /
                                yagHedefi
                            ) * 100,
                        ),
                        100,
                    )
                    : 0,
        },

        kayitlar,
    };
}