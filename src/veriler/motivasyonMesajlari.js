export const motivasyonMesajlari = [
    "Bugün attığın küçük adımlar, yarının büyük mutluluğu olacak.",
    "Kendine iyi baktığın her an, seni hedeflerine biraz daha yaklaştırıyor.",
    "Bugün de seninle gurur duyuyorum.",
    "Güzel bir gün, kendine verdiğin güzel bir sözle başlar.",
    "Sen her hâlinle çok güzelsin, bu program sadece daha iyi hissetmen için.",
];

export function rastgeleMotivasyonMesaji() {
    const rastgeleIndex = Math.floor(
        Math.random() * motivasyonMesajlari.length,
    );

    return motivasyonMesajlari[rastgeleIndex];
}