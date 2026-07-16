const GELISTIRME_API_URL =
    "http://localhost:5050";

const CANLI_API_URL =
    "https://diet-fcgx.onrender.com";

const ortamApiUrl =
    String(
        import.meta.env
            .VITE_API_URL ||
        "",
    ).trim();

const API_URL =
    (
        ortamApiUrl ||
        (
            import.meta.env.PROD
                ? CANLI_API_URL
                : GELISTIRME_API_URL
        )
    ).replace(
        /\/+$/,
        "",
    );

export async function yemekFotografiniAnalizEt({
    fotograf,
    ogunTuru = "diger",
    aciklama = "",
}) {
    if (!API_URL) {
        throw new Error(
            "Yemek analiz servisi adresi bulunamadı.",
        );
    }

    if (
        typeof File === "undefined" ||
        !(fotograf instanceof File)
    ) {
        throw new Error(
            "Analiz edilecek fotoğraf seçilmedi.",
        );
    }

    const formData =
        new FormData();

    formData.append(
        "fotograf",
        fotograf,
    );

    formData.append(
        "ogunTuru",
        String(
            ogunTuru ||
            "diger",
        ),
    );

    formData.append(
        "aciklama",
        String(
            aciklama ||
            "",
        ),
    );

    let response;

    try {
        response =
            await fetch(
                `${API_URL}/api/yemek-analiz`,
                {
                    method:
                        "POST",

                    body:
                        formData,
                },
            );
    } catch (error) {
        console.error(
            "Yemek analiz API bağlantı hatası:",
            {
                apiUrl:
                    API_URL,

                error,
            },
        );

        throw new Error(
            "Yemek analiz servisine bağlanılamadı. Backend'in çalıştığını kontrol et.",
        );
    }

    let sonuc = null;

    try {
        sonuc =
            await response.json();
    } catch {
        sonuc = null;
    }

    if (!response.ok) {
        throw new Error(
            sonuc?.message ||
            sonuc?.error ||
            `Fotoğraf analizi başarısız oldu (${response.status}).`,
        );
    }

    if (!sonuc?.success) {
        throw new Error(
            sonuc?.message ||
            "Fotoğraf analiz edilemedi.",
        );
    }

    if (!sonuc?.analiz) {
        throw new Error(
            "Analiz servisi geçerli bir sonuç döndürmedi.",
        );
    }

    return sonuc.analiz;
}