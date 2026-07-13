export const motivasyonMesajlari = [
    "BugÃ¼n attÄ±ÄŸÄ±n kÃ¼Ã§Ã¼k adÄ±mlar, yarÄ±nÄ±n bÃ¼yÃ¼k mutluluÄŸu olacak.",
    "Kendine iyi baktÄ±ÄŸÄ±n her an, seni hedeflerine biraz daha yaklaÅŸtÄ±rÄ±yor.",
    "BugÃ¼n de seninle gurur duyuyorum.",
    "GÃ¼zel bir gÃ¼n, kendine verdiÄŸin gÃ¼zel bir sÃ¶zle baÅŸlar.",
    "Sen her hÃ¢linle Ã§ok gÃ¼zelsin, bu program sadece daha iyi hissetmen iÃ§in.",
];

export function rastgeleMotivasyonMesaji() {
    const rastgeleIndex = Math.floor(
        Math.random() * motivasyonMesajlari.length,
    );

    return motivasyonMesajlari[rastgeleIndex];
}