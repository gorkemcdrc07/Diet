import { micoVikiMesajlari } from "../veriler/micoVikiMesajlari";
import { KARAKTER_DURUMLARI } from "./karakterSabitleri";

let sonMesajIndexleri = {};

function rastgeleIndexGetir(uzunluk, durum) {
    if (uzunluk <= 1) {
        return 0;
    }

    let yeniIndex;
    const oncekiIndex = sonMesajIndexleri[durum];

    do {
        yeniIndex = Math.floor(Math.random() * uzunluk);
    } while (yeniIndex === oncekiIndex);

    sonMesajIndexleri[durum] = yeniIndex;

    return yeniIndex;
}

export function rastgeleKarakterMesajiGetir(
    durum = KARAKTER_DURUMLARI.NORMAL
) {
    const mesajlar =
        micoVikiMesajlari[durum] ||
        micoVikiMesajlari[KARAKTER_DURUMLARI.NORMAL];

    const index = rastgeleIndexGetir(mesajlar.length, durum);

    return {
        ...mesajlar[index],
        durum,
        id: `${durum}-${Date.now()}-${index}`,
    };
}

export function saateGoreKarakterDurumuGetir(tarih = new Date()) {
    const saat = tarih.getHours();

    if (saat >= 22 || saat < 6) {
        return KARAKTER_DURUMLARI.GECE;
    }

    if (saat >= 6 && saat < 11) {
        return KARAKTER_DURUMLARI.SABAH;
    }

    return KARAKTER_DURUMLARI.NORMAL;
}

export function karakterMesajiOlustur({
    durum,
    karakter,
    mesaj,
    ruhHali,
}) {
    return {
        id: `${karakter}-${Date.now()}`,
        durum,
        karakter,
        mesaj,
        ruhHali,
    };
}