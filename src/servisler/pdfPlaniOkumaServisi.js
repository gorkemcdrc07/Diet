import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DESTEKLENEN_OGUN_ADLARI = [
    "kahvaltı",
    "kahvalti",
    "ara öğün",
    "ara ogun",
    "öğle",
    "ogle",
    "öğle yemeği",
    "ogle yemegi",
    "akşam",
    "aksam",
    "akşam yemeği",
    "aksam yemegi",
    "gece öğünü",
    "gece ogunu",
    "brunch",
    "ikindi",
    "kuşluk",
    "kusluk",
    "sahur",
    "iftar",
    "antrenman öncesi",
    "antrenman oncesi",
    "antrenman sonrası",
    "antrenman sonrasi",
];

function metniTemizle(metin) {
    return String(metin || "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();
}

function saatBul(metin) {
    const temizMetin = metniTemizle(metin);

    const eslesme = temizMetin.match(
        /(?:saat\s*)?(\d{1,2})[.: ](\d{2})(?:\s*[-–]\s*(\d{1,2})[.: ](\d{2}))?/i,
    );

    if (!eslesme) {
        return null;
    }

    const saat = Number(eslesme[1]);
    const dakika = Number(eslesme[2]);

    if (
        Number.isNaN(saat) ||
        Number.isNaN(dakika) ||
        saat < 0 ||
        saat > 23 ||
        dakika < 0 ||
        dakika > 59
    ) {
        return null;
    }

    return `${String(saat).padStart(2, "0")}:${String(dakika).padStart(2, "0")}`;
}

function ogunAdiBul(metin) {
    const kucukMetin = metniTemizle(metin).toLocaleLowerCase("tr-TR");

    const bulunan = DESTEKLENEN_OGUN_ADLARI.find((ogunAdi) =>
        kucukMetin.includes(ogunAdi),
    );

    if (!bulunan) {
        return null;
    }

    return bulunan
        .split(" ")
        .map((kelime) => {
            if (!kelime) {
                return kelime;
            }

            return kelime.charAt(0).toLocaleUpperCase("tr-TR") + kelime.slice(1);
        })
        .join(" ");
}

function ogunIkonuGetir(ogunAdi) {
    const ad = String(ogunAdi || "").toLocaleLowerCase("tr-TR");

    if (ad.includes("kahvalt") || ad.includes("brunch")) {
        return "🍳";
    }

    if (ad.includes("ara")) {
        return "🍎";
    }

    if (ad.includes("öğle") || ad.includes("ogle")) {
        return "🥗";
    }

    if (ad.includes("akşam") || ad.includes("aksam")) {
        return "🍽️";
    }

    if (ad.includes("sahur")) {
        return "🌙";
    }

    if (ad.includes("iftar")) {
        return "🌅";
    }

    if (ad.includes("antrenman")) {
        return "🏋️";
    }

    return "🍴";
}

function satiriBesinDetayinaDonustur(satir, sira) {
    const temizSatir = metniTemizle(satir)
        .replace(/^[-•*–—]\s*/, "")
        .trim();

    if (!temizSatir) {
        return null;
    }

    const miktarEslesmesi = temizSatir.match(
        /^((?:\d+[.,]?\d*|\d+\/\d+)\s*(?:adet|dilim|kaşık|kasik|yemek kaşığı|yemek kasigi|tatlı kaşığı|tatli kasigi|çay kaşığı|cay kasigi|bardak|kase|gram|gr|g|ml|litre|lt|porsiyon|avuç|avuc|kepçe|kepce)?)(?:\s+)(.+)$/i,
    );

    if (miktarEslesmesi) {
        return {
            baslik: metniTemizle(miktarEslesmesi[2]),
            miktar: metniTemizle(miktarEslesmesi[1]),
            aciklama: "",
            alternatifler: [],
            sira,
        };
    }

    return {
        baslik: temizSatir,
        miktar: "",
        aciklama: "",
        alternatifler: [],
        sira,
    };
}

async function pdfMetniniOku(dosya) {
    const arrayBuffer = await dosya.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
    }).promise;

    if (!pdf.numPages) {
        throw new Error("PDF dosyasında okunabilir sayfa bulunamadı.");
    }

    if (pdf.numPages > 50) {
        throw new Error("PDF en fazla 50 sayfa olabilir.");
    }

    const sayfaMetinleri = [];

    for (let sayfaNo = 1; sayfaNo <= pdf.numPages; sayfaNo += 1) {
        const sayfa = await pdf.getPage(sayfaNo);
        const icerik = await sayfa.getTextContent();

        const satirlar = [];
        let mevcutSatir = [];
        let oncekiY = null;

        const ogeler = [...icerik.items].sort((a, b) => {
            const aY = a.transform?.[5] || 0;
            const bY = b.transform?.[5] || 0;

            if (Math.abs(bY - aY) > 3) {
                return bY - aY;
            }

            const aX = a.transform?.[4] || 0;
            const bX = b.transform?.[4] || 0;

            return aX - bX;
        });

        for (const oge of ogeler) {
            const y = oge.transform?.[5] || 0;
            const metin = metniTemizle(oge.str);

            if (!metin) {
                continue;
            }

            if (oncekiY !== null && Math.abs(y - oncekiY) > 4) {
                if (mevcutSatir.length > 0) {
                    satirlar.push(mevcutSatir.join(" "));
                }

                mevcutSatir = [];
            }

            mevcutSatir.push(metin);
            oncekiY = y;
        }

        if (mevcutSatir.length > 0) {
            satirlar.push(mevcutSatir.join(" "));
        }

        sayfaMetinleri.push(...satirlar);
    }

    return sayfaMetinleri
        .map(metniTemizle)
        .filter(Boolean);
}

function planiSatirlardanOlustur(satirlar, dosyaAdi) {
    const ogunler = [];
    let aktifOgun = null;

    for (const satir of satirlar) {
        const saat = saatBul(satir);
        const ogunAdi = ogunAdiBul(satir);

        if (saat && ogunAdi) {
            aktifOgun = {
                ogunAdi,
                saat,
                ikon: ogunIkonuGetir(ogunAdi),
                aciklama: "",
                sira: ogunler.length,
                detaylar: [],
            };

            ogunler.push(aktifOgun);
            continue;
        }

        if (!aktifOgun) {
            continue;
        }

        const detay = satiriBesinDetayinaDonustur(
            satir,
            aktifOgun.detaylar.length,
        );

        if (detay) {
            aktifOgun.detaylar.push(detay);
        }
    }

    if (ogunler.length === 0) {
        throw new Error(
            "PDF içinde saatli bir öğün bulunamadı. PDF metin tabanlı olmayabilir veya öğün başlıkları tanınmamış olabilir.",
        );
    }

    return {
        planAdi: String(dosyaAdi || "Beslenme Planı").replace(/\.pdf$/i, ""),
        diyetisyenAdi: "",
        planTarihi: "",
        genelNotlar: "",
        ogunler,
    };
}

export async function beslenmePdfiniYereldeAnalizEt(dosya) {
    if (!dosya) {
        throw new Error("PDF dosyası seçilmedi.");
    }

    if (
        dosya.type &&
        dosya.type !== "application/pdf"
    ) {
        throw new Error("Yalnızca PDF dosyaları desteklenir.");
    }

    const maksimumBoyut = 15 * 1024 * 1024;

    if (dosya.size > maksimumBoyut) {
        throw new Error("PDF dosyası en fazla 15 MB olabilir.");
    }

    const satirlar = await pdfMetniniOku(dosya);

    if (satirlar.length === 0) {
        throw new Error(
            "PDF içinde okunabilir metin bulunamadı. Taranmış veya fotoğraf tabanlı PDF dosyaları desteklenmez.",
        );
    }

    const plan = planiSatirlardanOlustur(
        satirlar,
        dosya.name,
    );

    return {
        plan,
        hamSatirlar: satirlar,
    };
}