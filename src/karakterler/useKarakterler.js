import { useCallback, useEffect, useRef, useState } from "react";
import {
    rastgeleKarakterMesajiGetir,
    saateGoreKarakterDurumuGetir,
} from "./karakterMotoru";
import { KARAKTER_DURUMLARI } from "./karakterSabitleri";

export default function useKarakterler({
    otomatikKonusma = true,
    otomatikKonusmaSuresi = 12000,
} = {}) {
    const ilkDurum = saateGoreKarakterDurumuGetir();

    const [aktifDurum, setAktifDurum] = useState(ilkDurum);
    const [aktifMesaj, setAktifMesaj] = useState(() =>
        rastgeleKarakterMesajiGetir(ilkDurum)
    );
    const [konusuyor, setKonusuyor] = useState(true);

    const mesajKapatmaZamanlayicisi = useRef(null);

    const mesajGoster = useCallback(
        (
            durum = KARAKTER_DURUMLARI.NORMAL,
            gorunmeSuresi = 6500
        ) => {
            if (mesajKapatmaZamanlayicisi.current) {
                clearTimeout(mesajKapatmaZamanlayicisi.current);
            }

            const yeniMesaj = rastgeleKarakterMesajiGetir(durum);

            setAktifDurum(durum);
            setAktifMesaj(yeniMesaj);
            setKonusuyor(true);

            mesajKapatmaZamanlayicisi.current = setTimeout(() => {
                setKonusuyor(false);
            }, gorunmeSuresi);

            return yeniMesaj;
        },
        []
    );

    const normalMesajGoster = useCallback(() => {
        const saateGoreDurum = saateGoreKarakterDurumuGetir();
        mesajGoster(saateGoreDurum);
    }, [mesajGoster]);

    const ogunTamamlandi = useCallback(() => {
        mesajGoster(KARAKTER_DURUMLARI.OGUN_TAMAMLANDI, 8000);
    }, [mesajGoster]);

    const suIcildi = useCallback(
        (mevcutSu, hedefSu) => {
            if (
                Number(hedefSu) > 0 &&
                Number(mevcutSu) >= Number(hedefSu)
            ) {
                mesajGoster(
                    KARAKTER_DURUMLARI.SU_HEDEFI_TAMAMLANDI,
                    8000
                );
                return;
            }

            mesajGoster(KARAKTER_DURUMLARI.SU_ICILDI);
        },
        [mesajGoster]
    );

    const gunTamamlandi = useCallback(() => {
        mesajGoster(KARAKTER_DURUMLARI.GUN_TAMAMLANDI, 9000);
    }, [mesajGoster]);

    const ogunGecikti = useCallback(() => {
        mesajGoster(KARAKTER_DURUMLARI.OGUN_GECTI, 8000);
    }, [mesajGoster]);

    const ogunYaklasiyor = useCallback(() => {
        mesajGoster(KARAKTER_DURUMLARI.OGUN_YAKLASIYOR);
    }, [mesajGoster]);

    useEffect(() => {
        if (!otomatikKonusma) {
            return undefined;
        }

        const interval = setInterval(() => {
            normalMesajGoster();
        }, otomatikKonusmaSuresi);

        return () => clearInterval(interval);
    }, [
        normalMesajGoster,
        otomatikKonusma,
        otomatikKonusmaSuresi,
    ]);

    useEffect(() => {
        return () => {
            if (mesajKapatmaZamanlayicisi.current) {
                clearTimeout(mesajKapatmaZamanlayicisi.current);
            }
        };
    }, []);

    return {
        aktifDurum,
        aktifMesaj,
        konusuyor,
        mesajGoster,
        normalMesajGoster,
        ogunTamamlandi,
        suIcildi,
        gunTamamlandi,
        ogunGecikti,
        ogunYaklasiyor,
    };
}