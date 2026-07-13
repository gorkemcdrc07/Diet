import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const ZORUNLU_DEGISKENLER = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
];

function ortamDegiskenleriniKontrolEt() {
    const eksikDegiskenler = ZORUNLU_DEGISKENLER.filter(
        (degisken) => !process.env[degisken]?.trim(),
    );

    if (eksikDegiskenler.length > 0) {
        throw new Error(
            `Eksik GitHub Secret değerleri: ${eksikDegiskenler.join(", ")}`,
        );
    }
}

ortamDegiskenleriniKontrolEt();

const supabase = createClient(
    process.env.SUPABASE_URL.trim().replace(/\/+$/, ""),
    process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    },
);

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT.trim(),
    process.env.VAPID_PUBLIC_KEY.trim(),
    process.env.VAPID_PRIVATE_KEY.trim(),
);

const OGUN_PROGRAMI = {
    uyandiginda: {
        saat: "10:00",
        basliklar: [
            "Günaydın güzelim 🌸",
            "Yeni bir güne merhaba ❤️",
            "Kefir zamanı güzelim 🥛",
        ],
        mesajlar: [
            "Kefir saatin geldi. Güne kendine iyi bakarak başlayalım ❤️",
            "Laktozsuz kefirini, chia ve keten tohumunu unutma güzelim.",
            "Güne güzel bir başlangıç yapma zamanı. Bugün de seninle gurur duyuyorum 🥰",
        ],
        url: "/",
    },

    sabah: {
        saat: "12:00",
        basliklar: [
            "Kahvaltı zamanı 🍳",
            "Güzel bir kahvaltı molası ❤️",
            "Enerjini yenileme zamanı 🌸",
        ],
        mesajlar: [
            "Kahvaltı saatin geldi güzelim. Kendine iyi bakmayı unutma.",
            "Yumurta, yeşillik, peynir ve ekmeğin seni bekliyor 🥰",
            "Tenis günüyse iki yumurtayı unutma. Afiyet olsun güzelim ❤️",
        ],
        url: "/",
    },

    "ara-ogun-1": {
        saat: "14:00",
        basliklar: [
            "Küçük bir mola 🍵",
            "Bitki çayı zamanı 🌿",
            "Kendine güzel bir mola ver ❤️",
        ],
        mesajlar: [
            "Bitki çayını hazırlama zamanı. Bugün de çok iyi gidiyorsun.",
            "Kısa bir mola verip çayını keyifle içebilirsin güzelim.",
            "Saat 14.00 oldu. Kolajenli veya prebiyotikli yeşil çayını unutma 🌸",
        ],
        url: "/",
    },

    ogle: {
        saat: "15:00",
        basliklar: [
            "Öğle öğünün hazır 🍎",
            "Öğle molası zamanı ❤️",
            "Enerjini koruma zamanı 🌸",
        ],
        mesajlar: [
            "Öğle öğününü atlamıyoruz. Kendine iyi baktığın için seninle gurur duyuyorum.",
            "Programındaki öğle seçeneklerinden birini seçebilirsin güzelim 🥰",
            "Meyve, yoğurt veya diğer alternatiflerinden sana uygun olanı seçme zamanı.",
        ],
        url: "/",
    },

    "ara-ogun-2": {
        saat: "16:00",
        basliklar: [
            "Bitki çayı zamanı 🌿",
            "İkinci küçük mola 🍵",
            "Bugün çok güzel ilerliyorsun ❤️",
        ],
        mesajlar: [
            "Kısa bir mola verip bitki çayını içme zamanı güzelim.",
            "Kolajenli yeşil çayını hazırlamayı unutma 🌸",
            "Bir fincan çay ve kısa bir dinlenme sana çok iyi gelecek.",
        ],
        url: "/",
    },

    aksam: {
        saat: "18:30",
        basliklar: [
            "Akşam yemeği zamanı 🥗",
            "Günün dengeli öğünü ❤️",
            "Akşam öğünün seni bekliyor 🌸",
        ],
        mesajlar: [
            "Akşam yemeğini hazırlama zamanı. Bugün de çok güzel ilerliyorsun.",
            "Ana yemek, salata, yoğurt ve seçtiğin eşdeğeri unutma güzelim 🥰",
            "Günü dengeli bir akşam öğünüyle tamamlayalım. Afiyet olsun ❤️",
        ],
        url: "/",
    },

    "yatmadan-once": {
        saat: "21:00",
        basliklar: [
            "Günün son hatırlatması 🌙",
            "Gece öğünü zamanı ❤️",
            "Bugünü güzelce tamamlayalım 🌸",
        ],
        mesajlar: [
            "Ayranını ve programına uygunsa kabak çekirdeğini unutma güzelim.",
            "Bugünün son küçük öğünü geldi. Gösterdiğin çabayla gurur duyuyorum ❤️",
            "Bugün kendine çok güzel baktın. Son hatırlatmanı da tamamlayalım 🌙",
        ],
        url: "/",
    },
};

/*
Türkiye saatleri için GitHub cron eşleşmeleri:

10:00 -> 07:00
12:00 -> 09:00
14:00 -> 11:00
15:00 -> 12:00
16:00 -> 13:00
18:30 -> 15:30
21:00 -> 18:00
*/
const CRON_OGUN_ESLESMESI = {
    "0 7 * * *": "uyandiginda",
    "0 9 * * *": "sabah",
    "0 11 * * *": "ara-ogun-1",
    "0 12 * * *": "ogle",
    "0 13 * * *": "ara-ogun-2",
    "30 15 * * *": "aksam",
    "0 18 * * *": "yatmadan-once",
};

function rastgeleElemanGetir(liste) {
    if (!Array.isArray(liste) || liste.length === 0) {
        return "";
    }

    const index = Math.floor(Math.random() * liste.length);

    return liste[index];
}

function gonderilecekOgunIdGetir() {
    const manuelOgunId = process.env.MANUEL_OGUN_ID?.trim();

    if (manuelOgunId) {
        return manuelOgunId;
    }

    const cronIfadesi =
        process.env.GITHUB_EVENT_SCHEDULE?.trim();

    if (!cronIfadesi) {
        throw new Error(
            "Öğün belirlenemedi. Manuel test için MANUEL_OGUN_ID gereklidir.",
        );
    }

    const ogunId = CRON_OGUN_ESLESMESI[cronIfadesi];

    if (!ogunId) {
        throw new Error(
            `Cron ifadesi için öğün bulunamadı: ${cronIfadesi}`,
        );
    }

    return ogunId;
}

async function telefonBilgisiniGetir() {
    const { data, error } = await supabase
        .from("sevgilim_telefonu")
        .select("id, endpoint, p256dh, auth, aktif")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Telefon bilgisi Supabase'den okunamadı: ${error.message}`,
        );
    }

    if (!data) {
        throw new Error(
            "Supabase'de kayıtlı telefon bulunamadı.",
        );
    }

    if (!data.aktif) {
        console.log(
            "Telefon bildirimleri kapalı. Bildirim gönderilmedi.",
        );

        return null;
    }

    if (!data.endpoint || !data.p256dh || !data.auth) {
        throw new Error(
            "Telefonun push bilgileri eksik.",
        );
    }

    return data;
}

async function telefonuPasifYap() {
    const { error } = await supabase
        .from("sevgilim_telefonu")
        .update({
            aktif: false,
            guncellenme_tarihi: new Date().toISOString(),
        })
        .eq("id", 1);

    if (error) {
        console.error(
            "Telefon kaydı pasif yapılamadı:",
            error.message,
        );
    }
}

async function bildirimiGonder() {
    const ogunId = gonderilecekOgunIdGetir();
    const ogun = OGUN_PROGRAMI[ogunId];

    if (!ogun) {
        throw new Error(
            `Geçersiz öğün kimliği: ${ogunId}`,
        );
    }

    const telefon = await telefonBilgisiniGetir();

    if (!telefon) {
        return;
    }

    const pushAboneligi = {
        endpoint: telefon.endpoint,

        keys: {
            p256dh: telefon.p256dh,
            auth: telefon.auth,
        },
    };

    const baslik = rastgeleElemanGetir(
        ogun.basliklar,
    );

    const mesaj = rastgeleElemanGetir(
        ogun.mesajlar,
    );

    const payload = JSON.stringify({
        baslik,
        mesaj,
        ikon: "/ikonlar/ikon-192.png",
        rozet: "/ikonlar/ikon-192.png",
        url: ogun.url,
        tag: `ogun-${ogunId}`,
        ogunId,
        saat: ogun.saat,
    });

    console.log("--------------------------------");
    console.log(`Öğün: ${ogunId}`);
    console.log(`Saat: ${ogun.saat}`);
    console.log(`Başlık: ${baslik}`);
    console.log(`Mesaj: ${mesaj}`);
    console.log("--------------------------------");

    try {
        const sonuc = await webpush.sendNotification(
            pushAboneligi,
            payload,
            {
                TTL: 60 * 60,
                urgency: "high",
            },
        );

        console.log(
            `Bildirim başarıyla gönderildi. HTTP durum kodu: ${sonuc.statusCode}`,
        );
    } catch (error) {
        const durumKodu = error?.statusCode;

        console.error(
            "Bildirim gönderme hatası:",
            durumKodu || "",
            error?.body || error?.message || error,
        );

        if (durumKodu === 404 || durumKodu === 410) {
            await telefonuPasifYap();

            console.log(
                "Push kaydı geçersiz olduğu için telefon pasif yapıldı.",
            );
        }

        throw error;
    }
}

bildirimiGonder()
    .then(() => {
        console.log(
            "Hatırlatıcı işlemi tamamlandı.",
        );
    })
    .catch((error) => {
        console.error(
            "Hatırlatıcı çalıştırılamadı:",
            error?.message || error,
        );

        process.exit(1);
    });