import {
    KARAKTERLER,
    KARAKTER_DURUMLARI,
    RUH_HALLERI,
} from "../karakterler/karakterSabitleri";

export const micoVikiMesajlari = {
    [KARAKTER_DURUMLARI.NORMAL]: [
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.NORMAL,
            mesaj: "Bugünkü programı kontrol etmeyi unutma.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.SEVECEN,
            mesaj: "Bugün de beraberiz. Çok güzel ilerleyeceğiz 🤍",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.SABIRSIZ,
            mesaj: "HAV! Program hazır. Sen de hazırsan başlayalım.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.MUTLU,
            mesaj: "Seni burada görmek çok güzel 🥹",
        },
    ],

    [KARAKTER_DURUMLARI.SABAH]: [
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.MUTLU,
            mesaj: "Günaydın! Bugün çok güzel bir gün olacak ☀️",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.NORMAL,
            mesaj: "Günaydın. Bugün programı aksatmak yok.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.ACIK,
            mesaj: "Günaydın... Kahvaltı zamanı yaklaştı mı? 🥹",
        },
    ],

    [KARAKTER_DURUMLARI.OGUN_YAKLASIYOR]: [
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.SABIRSIZ,
            mesaj: "HAV! Öğün saatine az kaldı.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.ACIK,
            mesaj: "Birazdan yemek mi yiyeceğiz? Ben hazırım 🥹",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.NORMAL,
            mesaj: "Hazırlığını yap. Öğün saati yaklaşıyor.",
        },
    ],

    [KARAKTER_DURUMLARI.OGUN_GECTI]: [
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.KIZGIN,
            mesaj: "HAV! Öğün saati geçti. Hemen kontrol et.",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.SABIRSIZ,
            mesaj: "Beklemeyi sevmem. Öğünü tamamlamanın zamanı geldi.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.ACIK,
            mesaj: "Öğünümüzü unutmadık değil mi? 🥹",
        },
    ],

    [KARAKTER_DURUMLARI.OGUN_TAMAMLANDI]: [
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.HEYECANLI,
            mesaj: "Yaşasın! Bir öğün daha tamamlandı 🎉",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.GURURLU,
            mesaj: "Güzel. Tam zamanında yaptın.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.MUTLU,
            mesaj: "Seninle gurur duyuyorum 🤍",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.MUTLU,
            mesaj: "İşte böyle. Seriyi bozmak yok.",
        },
    ],

    [KARAKTER_DURUMLARI.SU_ICILDI]: [
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.MUTLU,
            mesaj: "Bir bardak daha! Harika gidiyorsun 💧",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.GURURLU,
            mesaj: "Güzel. Su içmeye devam et.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.SEVECEN,
            mesaj: "Ben de seninle birlikte su içtim sayılır mı? 🥹",
        },
    ],

    [KARAKTER_DURUMLARI.SU_HEDEFI_TAMAMLANDI]: [
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.HEYECANLI,
            mesaj: "Su hedefini tamamladın! Sana kocaman sarılıyorum 💙",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.GURURLU,
            mesaj: "Bugünkü su görevini başarıyla tamamladın.",
        },
    ],

    [KARAKTER_DURUMLARI.GUN_TAMAMLANDI]: [
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.GURURLU,
            mesaj: "Bugünkü bütün görevler tamamlandı. İyi iş.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.HEYECANLI,
            mesaj: "Bugünü birlikte başardık! 🎉",
        },
    ],

    [KARAKTER_DURUMLARI.SERI_DEVAM]: [
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.GURURLU,
            mesaj: "Seri devam ediyor. Sakın bozma.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.MUTLU,
            mesaj: "Her gün biraz daha güçleniyoruz 🔥",
        },
    ],

    [KARAKTER_DURUMLARI.GECE]: [
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.UYKULU,
            mesaj: "Bugünlük bu kadar. Yarın devam ederiz.",
        },
        {
            karakter: KARAKTERLER.VIKI,
            ruhHali: RUH_HALLERI.UYKULU,
            mesaj: "Ben battaniyeme kıvrıldım. İyi geceler 🤍",
        },
        {
            karakter: KARAKTERLER.MICO,
            ruhHali: RUH_HALLERI.UYKULU,
            mesaj: "Sessiz ol. Viki uyuyor.",
        },
    ],
};