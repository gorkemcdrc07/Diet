function gecerliSayiMi(deger) {
    return Number.isFinite(
        Number(deger),
    );
}

function sayiyaCevir(
    deger,
    varsayilan = null,
) {
    if (!gecerliSayiMi(deger)) {
        return varsayilan;
    }

    return Number(deger);
}

function kiloMetni(deger) {
    const sayi =
        sayiyaCevir(deger);

    if (sayi === null) {
        return null;
    }

    return sayi.toLocaleString(
        "tr-TR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        },
    );
}

export function kiloMotivasyonunuGetir({
    hedefTuru = "kilo-al",
    gunlukDegisim = null,
    haftalikDegisim = null,
    hedefeKalan = null,
} = {}) {
    const guvenliGunlukDegisim =
        sayiyaCevir(
            gunlukDegisim,
        );

    const guvenliHaftalikDegisim =
        sayiyaCevir(
            haftalikDegisim,
        );

    const guvenliHedefeKalan =
        sayiyaCevir(
            hedefeKalan,
        );

    const haftalikDegisimMetni =
        kiloMetni(
            guvenliHaftalikDegisim,
        );

    const hedefeKalanMetni =
        kiloMetni(
            guvenliHedefeKalan,
        );

    if (
        guvenliHedefeKalan !== null &&
        guvenliHedefeKalan <= 0.2
    ) {
        return {
            mico:
                "Hedef tamam! Bugünlük seni denetlemiyorum 😼",

            vicky:
                "Başardın! Seninle gurur duyuyorum 💜",
        };
    }

    if (hedefTuru === "kilo-al") {
        if (
            guvenliHaftalikDegisim !== null &&
            guvenliHaftalikDegisim > 0
        ) {
            return {
                mico:
                    "Güzel ilerliyorsun. Ama öğünleri aksatmak yok, seni izliyorum.",

                vicky:
                    `Bu hafta ${haftalikDegisimMetni} kg ilerledin. Harikasın 💜`,
            };
        }

        if (
            guvenliHaftalikDegisim !== null &&
            guvenliHaftalikDegisim < 0
        ) {
            return {
                mico:
                    "Kilo biraz gerilemiş. Bugün öğün atlamıyoruz.",

                vicky:
                    "Tek bir ölçüm moralini bozmasın. Düzenli devam edelim 💜",
            };
        }

        if (
            guvenliGunlukDegisim !== null &&
            guvenliGunlukDegisim > 0
        ) {
            return {
                mico:
                    "Bugün küçük bir artış var. Düzeni bozmadan devam.",

                vicky:
                    "İlerlemen güzel görünüyor. Sabırlı ve düzenli olalım 💜",
            };
        }
    }

    if (hedefTuru === "kilo-ver") {
        if (
            guvenliHaftalikDegisim !== null &&
            guvenliHaftalikDegisim < 0
        ) {
            return {
                mico:
                    "Plan işe yarıyor. Ama kendini aç bırakmak yok.",

                vicky:
                    `Bu hafta ${Math.abs(
                        guvenliHaftalikDegisim,
                    ).toLocaleString(
                        "tr-TR",
                        {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 2,
                        },
                    )} kg ilerledin. Çok güzel gidiyorsun 💜`,
            };
        }

        if (
            guvenliHaftalikDegisim !== null &&
            guvenliHaftalikDegisim > 0
        ) {
            return {
                mico:
                    "Biraz yükselmiş. Bugün plana daha dikkatli dönüyoruz.",

                vicky:
                    "Günlük dalgalanmalar normal. Genel ilerlemeye odaklanalım 💜",
            };
        }
    }

    if (hedefTuru === "kiloyu-koru") {
        if (
            guvenliHaftalikDegisim !== null &&
            Math.abs(
                guvenliHaftalikDegisim,
            ) <= 0.5
        ) {
            return {
                mico:
                    "Kilon dengede. Aynı disiplini devam ettir.",

                vicky:
                    "Dengen çok güzel görünüyor. Böyle devam 💜",
            };
        }

        return {
            mico:
                "Korumak da ciddi iş. Bugün rutinini kontrol edelim.",

            vicky:
                "Küçük değişimler normal, önemli olan uzun dönem dengesi 💜",
        };
    }

    if (
        guvenliHedefeKalan !== null
    ) {
        return {
            mico:
                "Bugünkü kilonu girdin. Takip artık bende.",

            vicky:
                `Hedefine ${hedefeKalanMetni} kg kaldı. Birlikte başaracağız 💜`,
        };
    }

    return {
        mico:
            "Bugünkü kilonu gir, ilerlemeyi ben takip edeyim.",

        vicky:
            "Başlangıç ve hedef kilonu belirlediğinde sana özel mesajlar hazırlayacağız 💜",
    };
}