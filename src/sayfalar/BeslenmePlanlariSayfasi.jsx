import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    Check,
    Clock3,
    FilePlus2,
    LoaderCircle,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Utensils,
    X,
} from "lucide-react";

import {
    beslenmePdfiniYukle,
    beslenmePlaniOlustur,
    beslenmePlaniniAktifYap,
    beslenmePlaniniSil,
    beslenmePlanlariniGetir,
    ogunDetayiEkle,
    ogunEkle,
} from "../servisler/beslenmePlaniServisi";

import "./BeslenmePlanlariSayfasi.css";
import {
    beslenmePdfiniYereldeAnalizEt,
} from "../servisler/pdfPlaniOkumaServisi";


function tarihiFormatla(tarih) {
    if (!tarih) {
        return "Tarih belirtilmedi";
    }

    try {
        return new Intl.DateTimeFormat(
            "tr-TR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            },
        ).format(
            new Date(`${tarih}T12:00:00`),
        );
    } catch {
        return tarih;
    }
}

export default function BeslenmePlanlariSayfasi({
    onPlanDuzenle,
}) {
    const [
        planlar,
        setPlanlar,
    ] = useState([]);

    const [
        yukleniyor,
        setYukleniyor,
    ] = useState(true);

    const [
        hata,
        setHata,
    ] = useState("");

    const [
        islemdekiPlanId,
        setIslemdekiPlanId,
    ] = useState(null);

    const [
        yeniPlanFormuAcik,
        setYeniPlanFormuAcik,
    ] = useState(false);

    const [
        yeniPlan,
        setYeniPlan,
    ] = useState({
        planAdi: "",
        diyetisyenAdi: "",
        planTarihi: "",
        hemenAktifEt: true,
    });

    const [
        yeniPlanKaydediliyor,
        setYeniPlanKaydediliyor,
    ] = useState(false);

    const [
        kayitAsamasi,
        setKayitAsamasi,
    ] = useState("");

    const [
        pdfDosyasi,
        setPdfDosyasi,
    ] = useState(null);

    const [
        pdfAnalizEdiliyor,
        setPdfAnalizEdiliyor,
    ] = useState(false);

    const [
        pdfOnizleme,
        setPdfOnizleme,
    ] = useState(null);

    async function planlariYukle() {
        setYukleniyor(true);
        setHata("");

        try {
            const veri =
                await beslenmePlanlariniGetir();

            setPlanlar(
                Array.isArray(veri)
                    ? veri
                    : [],
            );
        } catch (error) {
            console.error(
                "Beslenme planları yüklenemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Beslenme planları yüklenemedi.",
            );
        } finally {
            setYukleniyor(false);
        }
    }

    useEffect(() => {
        planlariYukle();
    }, []);

    const aktifPlan =
        useMemo(
            () =>
                planlar.find(
                    (plan) =>
                        plan.aktif,
                ) || null,
            [planlar],
        );

    const digerPlanlar =
        useMemo(
            () =>
                planlar.filter(
                    (plan) =>
                        !plan.aktif,
                ),
            [planlar],
        );

    async function planiAktifYap(
        planId,
    ) {
        if (
            !planId ||
            islemdekiPlanId
        ) {
            return;
        }

        setIslemdekiPlanId(planId);
        setHata("");

        try {
            await beslenmePlaniniAktifYap(
                planId,
            );

            await planlariYukle();
        } catch (error) {
            console.error(
                "Plan aktif yapılamadı:",
                error,
            );

            setHata(
                error?.message ||
                "Plan aktif yapılamadı.",
            );
        } finally {
            setIslemdekiPlanId(null);
        }
    }

    async function planiSil(
        plan,
    ) {
        if (
            !plan?.id ||
            islemdekiPlanId
        ) {
            return;
        }

        const onaylandi =
            window.confirm(
                `"${plan.plan_adi}" planını silmek istediğine emin misin?`,
            );

        if (!onaylandi) {
            return;
        }

        setIslemdekiPlanId(plan.id);
        setHata("");

        try {
            await beslenmePlaniniSil(
                plan.id,
            );

            await planlariYukle();
        } catch (error) {
            console.error(
                "Plan silinemedi:",
                error,
            );

            setHata(
                error?.message ||
                "Plan silinemedi.",
            );
        } finally {
            setIslemdekiPlanId(null);
        }
    }

    async function pdfyiAnalizEt() {
        if (!pdfDosyasi) {
            setHata(
                "Önce bir PDF dosyası seçmelisin.",
            );

            return;
        }

        setPdfAnalizEdiliyor(true);
        setHata("");

        try {
            const sonuc =
                await beslenmePdfiniYereldeAnalizEt(
                    pdfDosyasi,
                );

            setPdfOnizleme(
                sonuc.plan,
            );
        } catch (error) {
            console.error(
                "PDF analiz edilemedi:",
                error,
            );

            setHata(
                error?.message ||
                "PDF analiz edilemedi.",
            );
        } finally {
            setPdfAnalizEdiliyor(false);
        }
    }

    function onizlemeOgununuGuncelle(
        ogunIndex,
        alan,
        deger,
    ) {
        setPdfOnizleme((mevcut) => {
            if (!mevcut) {
                return mevcut;
            }

            const yeniOgunler = [
                ...(mevcut.ogunler || []),
            ];

            yeniOgunler[ogunIndex] = {
                ...yeniOgunler[ogunIndex],
                [alan]: deger,
            };

            return {
                ...mevcut,
                ogunler: yeniOgunler,
            };
        });
    }

    function onizlemeOgununuSil(
        ogunIndex,
    ) {
        setPdfOnizleme((mevcut) => {
            if (!mevcut) {
                return mevcut;
            }

            return {
                ...mevcut,
                ogunler:
                    (mevcut.ogunler || [])
                        .filter(
                            (_, index) =>
                                index !== ogunIndex,
                        )
                        .map(
                            (ogun, index) => ({
                                ...ogun,
                                sira: index,
                            }),
                        ),
            };
        });
    }

    function onizlemeOgunuEkle() {
        setPdfOnizleme((mevcut) => {
            if (!mevcut) {
                return mevcut;
            }

            const mevcutOgunler =
                mevcut.ogunler || [];

            return {
                ...mevcut,
                ogunler: [
                    ...mevcutOgunler,
                    {
                        ogunAdi:
                            "Yeni Öğün",
                        saat:
                            "12:00",
                        ikon:
                            "🍽️",
                        aciklama:
                            null,
                        sira:
                            mevcutOgunler.length,
                        detaylar:
                            [],
                    },
                ],
            };
        });
    }

    function onizlemeDetayiniGuncelle(
        ogunIndex,
        detayIndex,
        alan,
        deger,
    ) {
        setPdfOnizleme((mevcut) => {
            if (!mevcut) {
                return mevcut;
            }

            const yeniOgunler =
                [...(mevcut.ogunler || [])];

            const yeniDetaylar = [
                ...(
                    yeniOgunler[ogunIndex]
                        ?.detaylar || []
                ),
            ];

            yeniDetaylar[detayIndex] = {
                ...yeniDetaylar[detayIndex],
                [alan]: deger,
            };

            yeniOgunler[ogunIndex] = {
                ...yeniOgunler[ogunIndex],
                detaylar:
                    yeniDetaylar,
            };

            return {
                ...mevcut,
                ogunler:
                    yeniOgunler,
            };
        });
    }

    function onizlemeDetayiniSil(
        ogunIndex,
        detayIndex,
    ) {
        setPdfOnizleme((mevcut) => {
            if (!mevcut) {
                return mevcut;
            }

            const yeniOgunler =
                [...(mevcut.ogunler || [])];

            const yeniDetaylar =
                (
                    yeniOgunler[ogunIndex]
                        ?.detaylar || []
                )
                    .filter(
                        (_, index) =>
                            index !== detayIndex,
                    )
                    .map(
                        (detay, index) => ({
                            ...detay,
                            sira: index,
                        }),
                    );

            yeniOgunler[ogunIndex] = {
                ...yeniOgunler[ogunIndex],
                detaylar:
                    yeniDetaylar,
            };

            return {
                ...mevcut,
                ogunler:
                    yeniOgunler,
            };
        });
    }

    function onizlemeDetayiEkle(
        ogunIndex,
    ) {
        setPdfOnizleme((mevcut) => {
            if (!mevcut) {
                return mevcut;
            }

            const yeniOgunler =
                [...(mevcut.ogunler || [])];

            const mevcutDetaylar =
                yeniOgunler[ogunIndex]
                    ?.detaylar || [];

            yeniOgunler[ogunIndex] = {
                ...yeniOgunler[ogunIndex],
                detaylar: [
                    ...mevcutDetaylar,
                    {
                        baslik:
                            "Yeni besin",
                        miktar:
                            "",
                        aciklama:
                            "",
                        alternatifler:
                            [],
                        sira:
                            mevcutDetaylar.length,
                    },
                ],
            };

            return {
                ...mevcut,
                ogunler:
                    yeniOgunler,
            };
        });
    }

    async function yeniPlaniKaydet(event) {
        event.preventDefault();

        const temizPlanAdi =
            yeniPlan.planAdi.trim();

        if (!temizPlanAdi) {
            setHata(
                "Plan adı zorunludur.",
            );

            return;
        }

        const onizlemeOgunleri =
            Array.isArray(
                pdfOnizleme?.ogunler,
            )
                ? pdfOnizleme.ogunler
                : [];

        if (onizlemeOgunleri.length === 0) {
            setHata(
                "Kaydedilecek PDF öğünleri bulunamadı.",
            );

            return;
        }

        const gecersizOgun =
            onizlemeOgunleri.find(
                (ogun) =>
                    !String(
                        ogun?.ogunAdi || "",
                    ).trim(),
            );

        if (gecersizOgun) {
            setHata(
                "Tüm öğünlerin bir adı olmalıdır.",
            );

            return;
        }

        setYeniPlanKaydediliyor(true);
        setKayitAsamasi(
            "PDF güvenli alana yükleniyor...",
        );
        setHata("");

        let olusanPlan = null;

        try {
            const yuklenenPdf =
                await beslenmePdfiniYukle(
                    pdfDosyasi,
                );

            setKayitAsamasi(
                "Beslenme planı oluşturuluyor...",
            );

            olusanPlan =
                await beslenmePlaniOlustur({
                    planAdi:
                        temizPlanAdi,

                    kaynakDosyaAdi:
                        yuklenenPdf.dosyaAdi,

                    kaynakDosyaYolu:
                        yuklenenPdf.dosyaYolu,

                    diyetisyenAdi:
                        yeniPlan
                            .diyetisyenAdi
                            .trim() ||
                        null,

                    planTarihi:
                        yeniPlan
                            .planTarihi ||
                        null,

                    aktif:
                        Boolean(
                            yeniPlan.hemenAktifEt,
                        ),
                });

            for (
                let ogunIndex = 0;
                ogunIndex <
                onizlemeOgunleri.length;
                ogunIndex += 1
            ) {
                const ogun =
                    onizlemeOgunleri[
                    ogunIndex
                    ];

                setKayitAsamasi(
                    `${ogunIndex + 1}/${onizlemeOgunleri.length} öğün kaydediliyor...`,
                );

                const olusanOgun =
                    await ogunEkle({
                        planId:
                            olusanPlan.id,

                        ogunAdi:
                            String(
                                ogun.ogunAdi,
                            ).trim(),

                        saat:
                            ogun.saat ||
                            "12:00",

                        ikon:
                            ogun.ikon ||
                            "🍽️",

                        aciklama:
                            ogun.aciklama ||
                            null,

                        sira:
                            Number.isFinite(
                                Number(
                                    ogun.sira,
                                ),
                            )
                                ? Number(
                                    ogun.sira,
                                )
                                : ogunIndex,
                    });

                const detaylar =
                    Array.isArray(
                        ogun.detaylar,
                    )
                        ? ogun.detaylar
                        : [];

                for (
                    let detayIndex = 0;
                    detayIndex <
                    detaylar.length;
                    detayIndex += 1
                ) {
                    const detay =
                        detaylar[
                        detayIndex
                        ];

                    const temizBaslik =
                        String(
                            detay?.baslik ||
                            "",
                        ).trim();

                    if (!temizBaslik) {
                        continue;
                    }

                    await ogunDetayiEkle({
                        ogunId:
                            olusanOgun.id,

                        baslik:
                            temizBaslik,

                        miktar:
                            String(
                                detay.miktar ||
                                "",
                            ).trim() ||
                            null,

                        aciklama:
                            String(
                                detay.aciklama ||
                                "",
                            ).trim() ||
                            null,

                        alternatifler:
                            Array.isArray(
                                detay.alternatifler,
                            )
                                ? detay.alternatifler
                                    .map(
                                        (
                                            alternatif,
                                        ) =>
                                            String(
                                                alternatif,
                                            ).trim(),
                                    )
                                    .filter(
                                        Boolean,
                                    )
                                : [],

                        sira:
                            Number.isFinite(
                                Number(
                                    detay.sira,
                                ),
                            )
                                ? Number(
                                    detay.sira,
                                )
                                : detayIndex,
                    });
                }
            }

            setKayitAsamasi(
                "Plan hazırlandı.",
            );

            setYeniPlan({
                planAdi: "",
                diyetisyenAdi: "",
                planTarihi: "",
                hemenAktifEt: true,
            });

            setPdfDosyasi(null);
            setPdfOnizleme(null);
            setYeniPlanFormuAcik(false);

            localStorage.removeItem(
                "pdf-plan-onizleme",
            );

            await planlariYukle();

            onPlanDuzenle?.(
                olusanPlan.id,
            );
        } catch (error) {
            console.error(
                "PDF beslenme planı kaydedilemedi:",
                error,
            );

            if (olusanPlan?.id) {
                try {
                    await beslenmePlaniniSil(
                        olusanPlan.id,
                    );
                } catch (
                geriAlmaHatasi
                ) {
                    console.error(
                        "Yarım kalan plan geri alınamadı:",
                        geriAlmaHatasi,
                    );
                }
            }

            setHata(
                error?.message ||
                "PDF beslenme planı kaydedilemedi.",
            );
        } finally {
            setYeniPlanKaydediliyor(
                false,
            );
            setKayitAsamasi("");
        }
    }

    function planKartiOlustur(
        plan,
        aktifMi,
    ) {
        const islemde =
            islemdekiPlanId ===
            plan.id;

        return (
            <article
                key={plan.id}
                className={[
                    "beslenme-plan-karti",
                    aktifMi
                        ? "beslenme-plan-karti--aktif"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div className="beslenme-plan-ikon">
                    <Utensils
                        size={23}
                    />
                </div>

                <div className="beslenme-plan-bilgi">
                    <div className="beslenme-plan-baslik-satiri">
                        <h2>
                            {plan.plan_adi}
                        </h2>

                        {aktifMi && (
                            <span className="beslenme-plan-aktif-etiket">
                                <Check
                                    size={
                                        13
                                    }
                                />

                                Aktif
                            </span>
                        )}
                    </div>

                    <div className="beslenme-plan-meta">
                        <span>
                            <CalendarDays
                                size={
                                    14
                                }
                            />

                            {tarihiFormatla(
                                plan.plan_tarihi,
                            )}
                        </span>

                        {plan.diyetisyen_adi && (
                            <span>
                                {
                                    plan.diyetisyen_adi
                                }
                            </span>
                        )}
                    </div>

                    {plan.kaynak_dosya_adi && (
                        <small>
                            Kaynak:{" "}
                            {
                                plan.kaynak_dosya_adi
                            }
                        </small>
                    )}
                </div>

                <div className="beslenme-plan-islemleri">
                    {!aktifMi && (
                        <button
                            type="button"
                            className="beslenme-plan-aktif-yap"
                            disabled={islemde}
                            onClick={() =>
                                planiAktifYap(
                                    plan.id,
                                )
                            }
                        >
                            {islemde ? (
                                <LoaderCircle
                                    size={
                                        16
                                    }
                                    className="donen-ikon"
                                />
                            ) : (
                                <Check
                                    size={
                                        16
                                    }
                                />
                            )}

                            Aktif Yap
                        </button>
                    )}

                    <button
                        type="button"
                        className="beslenme-plan-duzenle"
                        onClick={() =>
                            onPlanDuzenle?.(
                                plan.id,
                            )
                        }
                    >
                        <Pencil
                            size={16}
                        />

                        Düzenle
                    </button>

                    <button
                        type="button"
                        className="beslenme-plan-sil"
                        disabled={islemde}
                        onClick={() =>
                            planiSil(plan)
                        }
                        aria-label="Planı sil"
                    >
                        <Trash2
                            size={16}
                        />
                    </button>
                </div>
            </article>
        );
    }

    return (
        <div className="beslenme-planlari-sayfasi">
            <section className="beslenme-planlari-hero">
                <div>
                    <span>
                        Kişisel plan yönetimi
                    </span>

                    <h1>
                        Beslenme Planlarım
                    </h1>

                    <p>
                        PDF’den oluşturulan planları
                        buradan yönetebilir ve aktif
                        planını seçebilirsin.
                    </p>
                </div>

            </section>

            {hata && (
                <section className="beslenme-planlari-hata">
                    {hata}
                </section>
            )}

            {yukleniyor ? (
                <section className="beslenme-planlari-yukleniyor">
                    <LoaderCircle
                        size={25}
                        className="donen-ikon"
                    />

                    <strong>
                        Planlar hazırlanıyor...
                    </strong>
                </section>
            ) : (
                <>
                    <section className="beslenme-planlari-bolum">
                        <div className="beslenme-planlari-bolum-baslik">
                            <div>
                                <span>
                                    Şu anda kullanılan
                                </span>

                                <h2>
                                    Aktif Plan
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    planlariYukle
                                }
                                aria-label="Planları yenile"
                            >
                                <RefreshCw
                                    size={
                                        17
                                    }
                                />
                            </button>
                        </div>

                        {aktifPlan ? (
                            planKartiOlustur(
                                aktifPlan,
                                true,
                            )
                        ) : (
                            <div className="beslenme-plan-bos">
                                <FilePlus2
                                    size={28}
                                />

                                <strong>
                                    Aktif plan yok
                                </strong>

                                <span>
                                    İlk planını
                                    oluşturarak
                                    başlayabilirsin.
                                </span>
                            </div>
                        )}
                    </section>

                    {digerPlanlar.length >
                        0 && (
                            <section className="beslenme-planlari-bolum">
                                <div className="beslenme-planlari-bolum-baslik">
                                    <div>
                                        <span>
                                            Daha önce
                                            oluşturulanlar
                                        </span>

                                        <h2>
                                            Diğer Planlar
                                        </h2>
                                    </div>

                                    <strong>
                                        {
                                            digerPlanlar.length
                                        }
                                    </strong>
                                </div>

                                <div className="beslenme-plan-listesi">
                                    {digerPlanlar.map(
                                        (plan) =>
                                            planKartiOlustur(
                                                plan,
                                                false,
                                            ),
                                    )}
                                </div>
                            </section>
                        )}

                    <section className="beslenme-pdf-yukleme-karti">
                        <div className="beslenme-pdf-yukleme-ust">
                            <div>
                                <span>
                                    Otomatik plan oluşturma
                                </span>

                                <h2>
                                    PDF’den Beslenme Planı
                                </h2>
                            </div>

                            <FilePlus2 size={22} />
                        </div>

                        <label className="beslenme-pdf-secici">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => {
                                    const dosya =
                                        event.target.files?.[0] ||
                                        null;

                                    setPdfDosyasi(dosya);
                                    setPdfOnizleme(null);
                                    setHata("");
                                }}
                            />

                            <strong>
                                {pdfDosyasi
                                    ? pdfDosyasi.name
                                    : "PDF seç"}
                            </strong>

                            <span>
                                Metin tabanlı PDF dosyaları desteklenir.
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={pdfyiAnalizEt}
                            disabled={
                                !pdfDosyasi ||
                                pdfAnalizEdiliyor
                            }
                        >
                            {pdfAnalizEdiliyor ? (
                                <>
                                    <LoaderCircle
                                        size={17}
                                        className="donen-ikon"
                                    />

                                    PDF analiz ediliyor...
                                </>
                            ) : (
                                <>
                                    <FilePlus2 size={17} />

                                    PDF’yi Analiz Et
                                </>
                            )}
                        </button>
                    </section>
                </>
            )}

            {pdfOnizleme && (
                <section className="beslenme-pdf-onizleme">
                    <div className="beslenme-pdf-onizleme-baslik">
                        <div>
                            <span>
                                Kontrol et ve düzenle
                            </span>

                            <h2>
                                {pdfOnizleme.planAdi ||
                                    "Beslenme Planı"}
                            </h2>
                        </div>

                        <strong>
                            {pdfOnizleme.ogunler?.length ||
                                0}{" "}
                            öğün
                        </strong>
                    </div>

                    <div className="beslenme-pdf-onizleme-listesi">
                        {(pdfOnizleme.ogunler || []).map(
                            (ogun, ogunIndex) => (
                                <article
                                    key={`${ogun.ogunAdi}-${ogunIndex}`}
                                    className="beslenme-pdf-onizleme-ogun"
                                >
                                    <div className="beslenme-pdf-onizleme-ogun-baslik">
                                        <div className="beslenme-pdf-ogun-ikon">
                                            {ogun.ikon ||
                                                "🍽️"}
                                        </div>

                                        <div className="beslenme-pdf-ogun-alanlari">
                                            <label>
                                                <span>
                                                    Öğün adı
                                                </span>

                                                <input
                                                    type="text"
                                                    value={
                                                        ogun.ogunAdi ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        onizlemeOgununuGuncelle(
                                                            ogunIndex,
                                                            "ogunAdi",
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label>
                                                <span>
                                                    Saat
                                                </span>

                                                <div className="beslenme-pdf-saat-alani">
                                                    <Clock3
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    <input
                                                        type="time"
                                                        value={
                                                            ogun.saat ||
                                                            "00:00"
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            onizlemeOgununuGuncelle(
                                                                ogunIndex,
                                                                "saat",
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </label>
                                        </div>

                                        <button
                                            type="button"
                                            className="beslenme-pdf-ogun-sil"
                                            onClick={() =>
                                                onizlemeOgununuSil(
                                                    ogunIndex,
                                                )
                                            }
                                            aria-label="Öğünü sil"
                                        >
                                            <Trash2
                                                size={17}
                                            />
                                        </button>
                                    </div>

                                    <div className="beslenme-pdf-detay-listesi">
                                        {(ogun.detaylar || []).map(
                                            (
                                                detay,
                                                detayIndex,
                                            ) => (
                                                <div
                                                    key={`${detay.baslik}-${detayIndex}`}
                                                    className="beslenme-pdf-detay-satiri"
                                                >
                                                    <label>
                                                        <span>
                                                            Miktar
                                                        </span>

                                                        <input
                                                            type="text"
                                                            value={
                                                                detay.miktar ||
                                                                ""
                                                            }
                                                            placeholder="Örn. 1 adet"
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                onizlemeDetayiniGuncelle(
                                                                    ogunIndex,
                                                                    detayIndex,
                                                                    "miktar",
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <label className="beslenme-pdf-detay-ad">
                                                        <span>
                                                            Besin
                                                        </span>

                                                        <input
                                                            type="text"
                                                            value={
                                                                detay.baslik ||
                                                                ""
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                onizlemeDetayiniGuncelle(
                                                                    ogunIndex,
                                                                    detayIndex,
                                                                    "baslik",
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onizlemeDetayiniSil(
                                                                ogunIndex,
                                                                detayIndex,
                                                            )
                                                        }
                                                        aria-label="Besini sil"
                                                    >
                                                        <X
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="beslenme-pdf-detay-ekle"
                                        onClick={() =>
                                            onizlemeDetayiEkle(
                                                ogunIndex,
                                            )
                                        }
                                    >
                                        <Plus size={15} />

                                        Besin Ekle
                                    </button>
                                </article>
                            ),
                        )}
                    </div>

                    <button
                        type="button"
                        className="beslenme-pdf-ogun-ekle"
                        onClick={
                            onizlemeOgunuEkle
                        }
                    >
                        <Plus size={17} />

                        Yeni Öğün Ekle
                    </button>

                    <div className="beslenme-pdf-onizleme-alt">
                        <button
                            type="button"
                            className="ikincil"
                            onClick={() => {
                                setPdfOnizleme(
                                    null,
                                );

                                setPdfDosyasi(
                                    null,
                                );
                            }}
                        >
                            Vazgeç
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    !pdfOnizleme
                                        .ogunler
                                        ?.length
                                ) {
                                    setHata(
                                        "Kaydedilecek en az bir öğün olmalıdır.",
                                    );

                                    return;
                                }

                                localStorage.setItem(
                                    "pdf-plan-onizleme",
                                    JSON.stringify(
                                        pdfOnizleme,
                                    ),
                                );

                                setYeniPlan({
                                    planAdi:
                                        pdfOnizleme.planAdi ||
                                        pdfDosyasi?.name?.replace(
                                            /\.pdf$/i,
                                            "",
                                        ) ||
                                        "Beslenme Planı",

                                    diyetisyenAdi:
                                        pdfOnizleme.diyetisyenAdi ||
                                        "",

                                    planTarihi:
                                        pdfOnizleme.planTarihi ||
                                        new Date()
                                            .toISOString()
                                            .slice(0, 10),

                                    hemenAktifEt:
                                        true,
                                });

                                setYeniPlanFormuAcik(
                                    true,
                                );
                            }}
                        >
                            Bilgileri Onayla ve Kaydet
                        </button>
                    </div>
                </section>
            )}
            {yeniPlanFormuAcik && (
                <div className="beslenme-plan-modal-katmani">
                    <form
                        className="beslenme-plan-modal"
                        onSubmit={
                            yeniPlaniKaydet
                        }
                    >
                        <div className="beslenme-plan-modal-ust">
                            <div>
                                <span>
                                    PDF planını kaydet
                                </span>

                                <h2>
                                    Bilgileri Kontrol Et
                                </h2>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    yeniPlanKaydediliyor
                                }
                                onClick={() =>
                                    setYeniPlanFormuAcik(
                                        false,
                                    )
                                }
                            >
                                ×
                            </button>
                        </div>

                        <label>
                            <span>
                                Plan adı
                            </span>

                            <input
                                type="text"
                                value={
                                    yeniPlan.planAdi
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setYeniPlan(
                                        (
                                            mevcut,
                                        ) => ({
                                            ...mevcut,
                                            planAdi:
                                                event
                                                    .target
                                                    .value,
                                        }),
                                    )
                                }
                                placeholder="Örn. Temmuz Diyet Planım"
                                autoFocus
                            />
                        </label>

                        <label>
                            <span>
                                Diyetisyen
                            </span>

                            <input
                                type="text"
                                value={
                                    yeniPlan.diyetisyenAdi
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setYeniPlan(
                                        (
                                            mevcut,
                                        ) => ({
                                            ...mevcut,
                                            diyetisyenAdi:
                                                event
                                                    .target
                                                    .value,
                                        }),
                                    )
                                }
                                placeholder="Diyetisyen adı"
                            />
                        </label>

                        <label>
                            <span>
                                Plan tarihi
                            </span>

                            <input
                                type="date"
                                value={
                                    yeniPlan.planTarihi
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setYeniPlan(
                                        (
                                            mevcut,
                                        ) => ({
                                            ...mevcut,
                                            planTarihi:
                                                event
                                                    .target
                                                    .value,
                                        }),
                                    )
                                }
                            />
                        </label>

                        <label className="beslenme-plan-aktif-secimi">
                            <input
                                type="checkbox"
                                checked={
                                    yeniPlan.hemenAktifEt
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setYeniPlan(
                                        (
                                            mevcut,
                                        ) => ({
                                            ...mevcut,
                                            hemenAktifEt:
                                                event
                                                    .target
                                                    .checked,
                                        }),
                                    )
                                }
                            />

                            <span>
                                <strong>
                                    Planı hemen kullanmaya başla
                                </strong>

                                <small>
                                    Mevcut aktif plan kapanır ve PDF’den oluşturulan plan günlük programa aktarılır.
                                </small>
                            </span>
                        </label>

                        {yeniPlanKaydediliyor &&
                            kayitAsamasi && (
                                <div className="beslenme-plan-kayit-durumu">
                                    <LoaderCircle
                                        size={16}
                                        className="donen-ikon"
                                    />

                                    <span>
                                        {kayitAsamasi}
                                    </span>
                                </div>
                            )}

                        <div className="beslenme-plan-modal-alt">
                            <button
                                type="button"
                                className="ikincil"
                                onClick={() =>
                                    setYeniPlanFormuAcik(
                                        false,
                                    )
                                }
                            >
                                Vazgeç
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    yeniPlanKaydediliyor
                                }
                            >
                                {yeniPlanKaydediliyor ? (
                                    <>
                                        <LoaderCircle
                                            size={
                                                17
                                            }
                                            className="donen-ikon"
                                        />

                                        Kaydediliyor
                                    </>
                                ) : (
                                    <>
                                        <Plus
                                            size={
                                                17
                                            }
                                        />

                                        Planı Oluştur
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}