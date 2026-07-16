import { supabase } from "./supabase";

const BUCKET_ADI =
    "yemek-fotograflari";

function dosyaUzantisiniGetir(
    dosya,
) {
    const dosyaAdi =
        String(
            dosya?.name || "",
        );

    const parcalar =
        dosyaAdi.split(".");

    if (parcalar.length > 1) {
        return parcalar
            .pop()
            .toLowerCase();
    }

    const mimeUzantilari = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };

    return (
        mimeUzantilari[
        dosya?.type
        ] || "jpg"
    );
}

function guvenliDosyaAdiOlustur(
    dosya,
) {
    const uzanti =
        dosyaUzantisiniGetir(
            dosya,
        );

    const benzersizId =
        typeof crypto !==
            "undefined" &&
            typeof crypto.randomUUID ===
            "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

    return `${benzersizId}.${uzanti}`;
}

async function aktifKullaniciyiGetir() {
    if (!supabase) {
        throw new Error(
            "Supabase bağlantısı hazır değil.",
        );
    }

    const {
        data: {
            user,
        },
        error,
    } =
        await supabase.auth.getUser();

    if (error) {
        throw new Error(
            error.message ||
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    if (!user) {
        throw new Error(
            "Fotoğraf yüklemek için giriş yapmalısın.",
        );
    }

    return user;
}

export async function yemekFotografiniYukle(
    dosya,
) {
    if (
        !dosya ||
        !(dosya instanceof File)
    ) {
        throw new Error(
            "Yüklenecek fotoğraf bulunamadı.",
        );
    }

    const izinliTipler = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (
        !izinliTipler.includes(
            dosya.type,
        )
    ) {
        throw new Error(
            "Yalnızca JPG, PNG veya WEBP yüklenebilir.",
        );
    }

    const maksimumBoyut =
        8 * 1024 * 1024;

    if (
        dosya.size >
        maksimumBoyut
    ) {
        throw new Error(
            "Fotoğraf 8 MB'tan küçük olmalıdır.",
        );
    }

    const user =
        await aktifKullaniciyiGetir();

    const bugun =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Europe/Istanbul",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",
            },
        ).format(new Date());

    const dosyaAdi =
        guvenliDosyaAdiOlustur(
            dosya,
        );

    const dosyaYolu =
        `${user.id}/${bugun}/${dosyaAdi}`;

    const {
        error:
        yuklemeHatasi,
    } =
        await supabase.storage
            .from(BUCKET_ADI)
            .upload(
                dosyaYolu,
                dosya,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        dosya.type,
                },
            );

    if (yuklemeHatasi) {
        throw new Error(
            yuklemeHatasi.message ||
            "Fotoğraf yüklenemedi.",
        );
    }

    const {
        data:
        publicUrlVerisi,
    } =
        supabase.storage
            .from(BUCKET_ADI)
            .getPublicUrl(
                dosyaYolu,
            );

    const publicUrl =
        publicUrlVerisi
            ?.publicUrl;

    if (!publicUrl) {
        throw new Error(
            "Fotoğraf bağlantısı oluşturulamadı.",
        );
    }

    return {
        dosyaYolu,
        publicUrl,
    };
}

export async function yemekFotografiniSil(
    dosyaYolu,
) {
    if (!dosyaYolu) {
        return false;
    }

    const {
        error,
    } =
        await supabase.storage
            .from(BUCKET_ADI)
            .remove([
                dosyaYolu,
            ]);

    if (error) {
        throw new Error(
            error.message ||
            "Fotoğraf silinemedi.",
        );
    }

    return true;
}