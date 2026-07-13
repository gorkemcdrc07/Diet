import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const gerekliDegiskenler = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
];

for (const degisken of gerekliDegiskenler) {
    if (!process.env[degisken]) {
        console.error(`Eksik ortam değişkeni: ${degisken}`);
        process.exit(1);
    }
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    },
);

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

const bildirimProgrami = {
    uyandiginda: {
        saat: "10:00",
        baslik: "Günaydın güzelim 🌸",
        mesajlar: [
            "Kefir saatin geldi. Güne kendine iyi bakarak başlayalım ❤️",
            "Günaydın güzelim. Kefirini içip güne güzel bir başlangıç yapma zamanı 🥛",
            "Yeni bir gün, yeni bir güzel adım. Kefirini unutma ❤️",
        ],
    },

    sabah: {
        saat: "12:00",
        baslik: "Kahvaltı zamanı 🍳",
        mesajlar: [
            "Güzel bir kahvaltıyla enerjini yenileme zamanı ❤️",
            "Kahvaltı saatin geldi güzelim. Bugün de kendine iyi bakmayı unutma.",
            "Minik bir hatırlatma: Kahvaltın seni bekliyor 🥰",
        ],
    },

    "ara-ogun-1": {
        saat: "14:00",
        baslik: "Küçük bir mola 🍵",
        mesajlar: [
            "Bitki çayını hazırlama zamanı. Bugün de çok iyi gidiyorsun ❤️",
            "Kendine kısa bir mola verip bitki çayını içebilirsin güzelim.",
            "Saat 14.00 oldu. Bitki çayı zamanı 🌿",
        ],
    },

    ogle: {
        saat: "15:00",
        baslik: "Öğle öğünün hazır 🍎",
        mesajlar: [
            "Öğle öğününü atlamıyoruz. Kendine iyi baktığın için seninle gurur duyuyorum ❤️",
            "Öğle öğünü zamanı güzelim. Programındaki seçeneklerden birini seçebilirsin.",
            "Enerjini korumak için öğle öğününü unutma 🥰",
        ],
    },

    "ara-ogun-2": {
        saat: "16:00",
        baslik: "Bitki çayı zamanı 🌿",
        mesajlar: [
            "Kısa bir mola verip çayını içme zamanı güzelim ❤️",
            "İkinci bitki çayı hatırlatman geldi 🍵",
            "Bugün de çok güzel ilerliyorsun. Çayını unutma.",
        ],
    },

    aksam: {
        saat: "18:30",
        baslik: "Akşam yemeği zamanı 🥗",
        mesajlar: [
            "Günün dengeli akşam öğününü hazırlama zamanı. Çok güzel ilerliyorsun ❤️",
            "Akşam yemeğin seni bekliyor güzelim. Afiyet olsun 🥰",
            "Akşam öğününü atlamadan günü güzelce tamamlayalım.",
        ],
    },

    "yatmadan-once": {
        saat: "21:00",
        baslik: "Günün son hatırlatması 🌙",
        mesajlar: [
            "Bugünün son küçük öğünü geldi. Gösterdiğin çabayla gurur duyuyorum ❤️",
            "Ayranını ve bugünkü programına uygunsa kabak çekirdeğini unutma güzelim.",
            "Günü kendine iyi bakarak tamamladığın için seninle gurur duyuyorum 🌙",
        ],
    },
};

/*
 * GitHub Actions cron ifadeleri UTC zamanındadır.
 * Türkiye UTC+3:
 *
 * 10:00 → 07:00 UTC
 * 12:00 → 09:00 UTC
 * 14:00 → 11:00 UTC
 * 15:00 → 12:00 UTC
 * 16:00 → 13:00 UTC
 * 18:30 → 15:30 UTC
 * 21:00 → 18:00 UTC
 */
const cronOgunEslesmesi = {
    "0 7 * * *": "uyandiginda",
    "0 9 * * *": "sabah",
    "0 11 * * *": "ara-ogun-1",
    "0 12 * * *": "ogle",
    "0 13 * * *": "ara-ogun-2",
    "30 15 * * *": "aksam",
    "0 18 * * *": "yatmadan-once",
};

function rastgeleMesajGetir(mesajlar) {
    const index = Math.floor(Math.random() * mesajlar.length);
    return mesajlar[index];
}

function gonderilecekOgunuBul() {
    const manuelOgunId = process.env.MANUEL_OGUN_ID?.trim();

    if (manuelOgunId) {
        return manuelOgunId;
    }

    const calisanCron = process.env.GITHUB_EVENT_SCHEDULE?.trim();

    if (!calisanCron) {
        throw new Error(
            "Çalışan cron bilgisi bulunamadı. Yerel test için MANUEL_OGUN_ID tanımla.",
        );
    }

    return cronOgunEslesmesi[calisanCron];
}

async function telefonuGetir() {
    const { data, error } = await supabase
        .from("sevgilim_telefonu")
        .select("endpoint, p256dh, auth, aktif")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Telefon bilgisi okunamadı: ${error.message}`,
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

    return data;
}

async function gecersizTelefonuPasifYap() {
    const { error } = await supabase
        .from("sevgilim_telefonu")
        .update({
            aktif: false,
            guncellenme_tarihi: new Date().toISOString(),
        })
        .eq("id", 1);

    if (error) {
        console.error(
            "Geçersiz telefon kaydı pasif yapılamadı:",
            error.message,
        );
    }
}

async function bildirimiGonder() {
    const ogunId = gonderilecekOgunuBul();
    const ogun = bildirimProgrami[ogunId];

    if (!ogun) {
        throw new Error(
            `Geçersiz veya bulunamayan öğün kimliği: ${ogunId}`,
        );
    }

    const telefon = await telefonuGetir();

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

    const payload = JSON.stringify({
        baslik: ogun.baslik,
        mesaj: rastgeleMesajGetir(ogun.mesajlar),
        ikon: "/ikonlar/ikon-192.png",
        rozet: "/ikonlar/ikon-192.png",
        url: "/",
        tag: `ogun-${ogunId}`,
        ogunId,
        saat: ogun.saat,
    });

    console.log(
        `${ogun.saat} - ${ogunId} bildirimi gönderiliyor...`,
    );

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
            `Bildirim başarıyla gönderildi. HTTP: ${sonuc.statusCode}`,
        );
    } catch (error) {
        const durumKodu = error?.statusCode;

        console.error(
            "Push bildirimi gönderilemedi:",
            durumKodu || "",
            error?.body || error?.message,
        );

        /*
         * 404 veya 410, tarayıcıdaki push kaydının artık
         * geçerli olmadığını gösterebilir.
         */
        if (durumKodu === 404 || durumKodu === 410) {
            await gecersizTelefonuPasifYap();

            console.log(
                "Geçersiz telefon kaydı pasif duruma getirildi.",
            );
        }

        throw error;
    }
}

bildirimiGonder().catch((error) => {
    console.error(
        "Hatırlatıcı işlemi başarısız:",
        error?.message || error,
    );

    process.exit(1);
});