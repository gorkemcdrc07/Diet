import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    bugununHafizasiniGetir,
    gunlukHafizayiKaydet,
    karakterDurumunuGetir,
    karakterDurumunuKaydet,
    karakterOlayiKaydet,
} from "../servisler/karakterSupabaseServisi";

const VARSAYILAN_DURUM = {
    mico_ofke: 45,
    mico_mutluluk: 45,
    mico_ruh_hali: "kizgin",
    mico_dokunma_sayisi: 0,
    mico_konusma_sayisi: 0,

    viki_aclik: 65,
    viki_mutluluk: 70,
    viki_ruh_hali: "acik",
    viki_mama_istegi: 0,
    viki_dokunma_sayisi: 0,
    viki_konusma_sayisi: 0,

    gunluk_seri: 0,
};

function sinirla(
    deger,
    min = 0,
    max = 100,
) {
    return Math.min(
        Math.max(Number(deger) || 0, min),
        max,
    );
}

export default function useSupabaseKarakterMotoru() {
    const [durum, setDurum] =
        useState(VARSAYILAN_DURUM);

    const [gunlukHafiza, setGunlukHafiza] =
        useState(null);

    const [aktifTepki, setAktifTepki] =
        useState(null);

    const [yukleniyor, setYukleniyor] =
        useState(true);

    const [hata, setHata] =
        useState("");

    const sistemiYukle = useCallback(
        async () => {
            setYukleniyor(true);
            setHata("");

            try {
                const [
                    durumSonucu,
                    hafizaSonucu,
                ] = await Promise.all([
                    karakterDurumunuGetir(),
                    bugununHafizasiniGetir(),
                ]);

                setDurum(durumSonucu);
                setGunlukHafiza(
                    hafizaSonucu,
                );
            } catch (error) {
                console.error(error);

                setHata(
                    error instanceof Error
                        ? error.message
                        : "Karakter sistemi yüklenemedi.",
                );
            } finally {
                setYukleniyor(false);
            }
        },
        [],
    );

    useEffect(() => {
        sistemiYukle();
    }, [sistemiYukle]);

    const olayCalistir = useCallback(
        async ({
            olay,
            karakter,
            ruhHali,
            mesaj,
            veri = {},
        }) => {
            setHata("");

            try {
                const mevcut =
                    durum ||
                    VARSAYILAN_DURUM;

                const guncellemeler = {
                    son_olay: olay,
                    son_karakter:
                        karakter,
                    son_mesaj: mesaj,
                };

                if (
                    karakter === "mico"
                ) {
                    guncellemeler.mico_konusma_sayisi =
                        (mevcut.mico_konusma_sayisi ||
                            0) + 1;

                    guncellemeler.mico_ruh_hali =
                        ruhHali ||
                        mevcut.mico_ruh_hali;

                    if (
                        olay ===
                        "karaktere-dokunuldu"
                    ) {
                        guncellemeler.mico_dokunma_sayisi =
                            (mevcut.mico_dokunma_sayisi ||
                                0) + 1;

                        guncellemeler.mico_ofke =
                            sinirla(
                                mevcut.mico_ofke -
                                4,
                            );

                        guncellemeler.mico_mutluluk =
                            sinirla(
                                mevcut.mico_mutluluk +
                                6,
                            );
                    }
                }

                if (
                    karakter === "viki"
                ) {
                    guncellemeler.viki_konusma_sayisi =
                        (mevcut.viki_konusma_sayisi ||
                            0) + 1;

                    guncellemeler.viki_ruh_hali =
                        ruhHali ||
                        mevcut.viki_ruh_hali;

                    if (
                        olay ===
                        "karaktere-dokunuldu"
                    ) {
                        guncellemeler.viki_dokunma_sayisi =
                            (mevcut.viki_dokunma_sayisi ||
                                0) + 1;

                        guncellemeler.viki_mama_istegi =
                            (mevcut.viki_mama_istegi ||
                                0) + 1;

                        guncellemeler.viki_mutluluk =
                            sinirla(
                                mevcut.viki_mutluluk +
                                8,
                            );
                    }
                }

                if (
                    olay ===
                    "ogun-tamamlandi"
                ) {
                    guncellemeler.mico_ofke =
                        sinirla(
                            mevcut.mico_ofke -
                            8,
                        );

                    guncellemeler.mico_mutluluk =
                        sinirla(
                            mevcut.mico_mutluluk +
                            7,
                        );

                    guncellemeler.viki_aclik =
                        sinirla(
                            mevcut.viki_aclik +
                            7,
                        );

                    guncellemeler.viki_mutluluk =
                        sinirla(
                            mevcut.viki_mutluluk +
                            8,
                        );
                }

                if (
                    olay === "ogun-gecikti"
                ) {
                    guncellemeler.mico_ofke =
                        sinirla(
                            mevcut.mico_ofke +
                            18,
                        );

                    guncellemeler.viki_aclik =
                        sinirla(
                            mevcut.viki_aclik +
                            12,
                        );
                }

                if (
                    olay === "su-icildi"
                ) {
                    guncellemeler.mico_ofke =
                        sinirla(
                            mevcut.mico_ofke -
                            3,
                        );

                    guncellemeler.viki_mutluluk =
                        sinirla(
                            mevcut.viki_mutluluk +
                            4,
                        );
                }

                const [
                    yeniDurum,
                ] = await Promise.all([
                    karakterDurumunuKaydet(
                        guncellemeler,
                    ),

                    karakterOlayiKaydet({
                        olay,
                        karakter,
                        ruhHali,
                        mesaj,
                        veri,
                    }),
                ]);

                const yeniTepki = {
                    id: `${olay}-${Date.now()}`,
                    olay,
                    karakter,
                    ruhHali,
                    mesaj,
                    veri,
                };

                setDurum(yeniDurum);
                setAktifTepki(yeniTepki);

                return yeniTepki;
            } catch (error) {
                console.error(error);

                const hataMesaji =
                    error instanceof Error
                        ? error.message
                        : "Karakter olayı işlenemedi.";

                setHata(hataMesaji);
                throw error;
            }
        },
        [durum],
    );

    const gunlukDurumuGuncelle =
        useCallback(
            async (guncellemeler) => {
                try {
                    const yeniHafiza =
                        await gunlukHafizayiKaydet(
                            guncellemeler,
                        );

                    setGunlukHafiza(
                        yeniHafiza,
                    );

                    return yeniHafiza;
                } catch (error) {
                    console.error(error);

                    setHata(
                        error instanceof Error
                            ? error.message
                            : "Günlük hafıza güncellenemedi.",
                    );

                    throw error;
                }
            },
            [],
        );

    return {
        durum,
        gunlukHafiza,
        aktifTepki,
        yukleniyor,
        hata,

        olayCalistir,
        gunlukDurumuGuncelle,
        sistemiYukle,
    };
}