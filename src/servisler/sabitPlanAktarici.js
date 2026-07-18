import aktifBeslenmePlani from "../veriler/aktifBeslenmePlani";

import {
    aktifBeslenmePlaniniGetir,
    beslenmePlaniOlustur,
    beslenmePlaniniAktifYap,
    beslenmePlaniniSil,
    beslenmePlanlariniGetir,
    ogunDetayiEkle,
    ogunEkle,
} from "./beslenmePlaniServisi";

/**
 * Sabit plandaki bir öğünün kullanıcıya gösterilecek adını getirir.
 */
function ogunAdiniGetir(ogun) {
    return String(
        ogun?.ogunAdi ||
        ogun?.ogun_adi ||
        ogun?.baslik ||
        "Öğün",
    ).trim();
}

/**
 * Aynı planın daha önce aktarılıp aktarılmadığını kontrol eder.
 */
function ayniPlanMi(plan) {
    const sabitPlanAdi = String(
        aktifBeslenmePlani?.planAdi ||
        aktifBeslenmePlani?.plan_adi ||
        "",
    )
        .trim()
        .toLocaleLowerCase("tr-TR");

    const sabitPlanTarihi =
        aktifBeslenmePlani?.planTarihi ||
        aktifBeslenmePlani?.plan_tarihi ||
        null;

    const kayitliPlanAdi = String(
        plan?.plan_adi || "",
    )
        .trim()
        .toLocaleLowerCase("tr-TR");

    return (
        kayitliPlanAdi === sabitPlanAdi &&
        String(plan?.plan_tarihi || "") ===
        String(sabitPlanTarihi || "")
    );
}

/**
 * Kod içerisindeki aktifBeslenmePlani.js verisini Supabase'e aktarır.
 *
 * Aynı plan daha önce aktarılmışsa tekrar oluşturmaz;
 * mevcut planı aktif hâle getirir.
 */
export async function sabitBeslenmePlaniniSupabaseAktar() {
    const planlar =
        await beslenmePlanlariniGetir();

    const mevcutPlan = (
        Array.isArray(planlar) ? planlar : []
    ).find(ayniPlanMi);

    if (mevcutPlan?.id) {
        const detayliPlan =
            await aktifBeslenmePlaniniGetir();

        const detaylarEksik =
            !Array.isArray(detayliPlan?.ogunler) ||
            detayliPlan.ogunler.length === 0 ||
            detayliPlan.ogunler.every(
                (ogun) =>
                    !Array.isArray(ogun?.detaylar) ||
                    ogun.detaylar.length === 0,
            );

        if (!detaylarEksik) {
            if (!mevcutPlan.aktif) {
                await beslenmePlaniniAktifYap(
                    mevcutPlan.id,
                );
            }

            return detayliPlan;
        }

        await beslenmePlaniniSil(
            mevcutPlan.id,
        );
    }
    const planAdi = String(
        aktifBeslenmePlani?.planAdi ||
        aktifBeslenmePlani?.plan_adi ||
        "Beslenme Programı",
    ).trim();

    const diyetisyenAdi =
        aktifBeslenmePlani?.diyetisyenAdi ||
        aktifBeslenmePlani?.diyetisyen_adi ||
        null;

    const planTarihi =
        aktifBeslenmePlani?.planTarihi ||
        aktifBeslenmePlani?.plan_tarihi ||
        null;

    let olusturulanPlan = null;

    try {
        olusturulanPlan =
            await beslenmePlaniOlustur({
                planAdi,
                diyetisyenAdi,
                planTarihi,
                aktif: true,
            });

        const ogunler = Array.isArray(
            aktifBeslenmePlani?.ogunler,
        )
            ? [...aktifBeslenmePlani.ogunler].sort(
                (a, b) =>
                    Number(a?.sira || 0) -
                    Number(b?.sira || 0),
            )
            : [];

        for (
            let ogunIndex = 0;
            ogunIndex < ogunler.length;
            ogunIndex += 1
        ) {
            const ogun = ogunler[ogunIndex];
            const ogunAdi = ogunAdiniGetir(ogun);

            const eklenenOgun = await ogunEkle({
                planId: olusturulanPlan.id,
                ogunAdi,
                saat: String(
                    ogun?.saat || "12:00",
                ).slice(0, 5),
                ikon: ogun?.ikon || "🍽️",
                aciklama:
                    ogun?.aciklama || null,
                sira:
                    Number.isFinite(
                        Number(ogun?.sira),
                    )
                        ? Number(ogun.sira)
                        : ogunIndex,
                ogunKodu:
                    ogun?.id ||
                    ogun?.ogun_kodu ||
                    null,
            });

            const detaylar = Array.isArray(
                ogun?.detaylar,
            )
                ? [...ogun.detaylar].sort(
                    (a, b) =>
                        Number(a?.sira || 0) -
                        Number(b?.sira || 0),
                )
                : [];

            for (
                let detayIndex = 0;
                detayIndex < detaylar.length;
                detayIndex += 1
            ) {
                const detay =
                    detaylar[detayIndex];

                await ogunDetayiEkle({
                    ogunId: eklenenOgun.id,
                    baslik:
                        detay?.baslik ||
                        "Besin",
                    miktar:
                        detay?.miktar || null,
                    aciklama:
                        detay?.aciklama || null,
                    alternatifler:
                        Array.isArray(
                            detay?.alternatifler,
                        )
                            ? detay.alternatifler
                            : [],
                    sira:
                        Number.isFinite(
                            Number(detay?.sira),
                        )
                            ? Number(detay.sira)
                            : detayIndex,
                });
            }
        }

        return await aktifBeslenmePlaniniGetir();
    } catch (error) {
        /*
         * Aktarım yarıda kalırsa eksik planı temizleriz.
         * Böylece sonraki denemede bozuk/yarım kayıt kalmaz.
         */
        if (olusturulanPlan?.id) {
            try {
                await beslenmePlaniniSil(
                    olusturulanPlan.id,
                );
            } catch (silmeHatasi) {
                console.error(
                    "Yarım kalan plan temizlenemedi:",
                    silmeHatasi,
                );
            }
        }

        console.error(
            "Sabit beslenme planı aktarılamadı:",
            error,
        );

        throw new Error(
            error?.message ||
            "Beslenme planı Supabase'e aktarılamadı.",
        );
    }
}

/**
 * Aktif plan varsa onu getirir.
 * Aktif plan yoksa sabit planı Supabase'e aktarır.
 */
export async function aktifPlaniGetirVeyaOlustur() {
    const aktifPlan =
        await aktifBeslenmePlaniniGetir();

    if (aktifPlan) {
        return aktifPlan;
    }

    return await sabitBeslenmePlaniniSupabaseAktar();
}