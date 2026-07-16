const API_URL = String(
    import.meta.env.VITE_API_URL || "",
).replace(/\/+$/, "");

export async function yemekFotografiniAnalizEt({
    fotograf,
    ogunTuru = "diger",
    aciklama = "",
}) {
    if (!API_URL) {
        throw new Error(
            "VITE_API_URL tanımlı değil.",
        );
    }

    if (!(fotograf instanceof File)) {
        throw new Error(
            "Analiz edilecek fotoğraf seçilmedi.",
        );
    }

    const formData = new FormData();

    formData.append(
        "fotograf",
        fotograf,
    );

    formData.append(
        "ogunTuru",
        ogunTuru,
    );

    formData.append(
        "aciklama",
        aciklama,
    );

    const response = await fetch(
        `${API_URL}/api/yemek-analiz`,
        {
            method: "POST",
            body: formData,
        },
    );

    let sonuc = null;

    try {
        sonuc = await response.json();
    } catch {
        sonuc = null;
    }

    if (
        !response.ok ||
        !sonuc?.success
    ) {
        throw new Error(
            sonuc?.message ||
            "Fotoğraf analiz edilemedi.",
        );
    }

    return sonuc.analiz;
}