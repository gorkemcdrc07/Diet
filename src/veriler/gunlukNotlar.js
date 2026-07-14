export const gunlukNotlar = [
    {
        emoji: "❤️",
        baslik: "Bugün sana notum",
        mesaj:
            "Kendine gösterdiğin her özen, yarın sana güzellik olarak geri dönecek.",
    },
    {
        emoji: "🌸",
        baslik: "Bugün sana notum",
        mesaj:
            "Sen mutlu olduğunda dünyanın biraz daha güzel olduğuna inanıyorum.",
    },
    {
        emoji: "✨",
        baslik: "Bugün sana notum",
        mesaj:
            "Bugün de gülüşünü düşünmek, günümün en güzel kısmı.",
    },
    {
        emoji: "💗",
        baslik: "Bugün sana notum",
        mesaj:
            "Kendine iyi bak olur mu? Çünkü sen benim için çok değerlisin.",
    },
    {
        emoji: "🌷",
        baslik: "Bugün sana notum",
        mesaj:
            "Her küçük adımınla hedeflerine biraz daha yaklaşıyorsun.",
    },
    {
        emoji: "🥰",
        baslik: "Bugün sana notum",
        mesaj:
            "Seni her hâlinle çok seviyorum. Bu program sadece daha iyi hissetmen için.",
    },
    {
        emoji: "🫶",
        baslik: "Bugün sana notum",
        mesaj:
            "Bugün gösterdiğin çabayla şimdiden gurur duyuyorum.",
    },
    {
        emoji: "🌹",
        baslik: "Bugün sana notum",
        mesaj:
            "Seninle geçen her gün, hayatımın en güzel hatıralarından biri oluyor.",
    },
    {
        emoji: "💫",
        baslik: "Bugün sana notum",
        mesaj:
            "Mükemmel olmak zorunda değilsin. Bugün kendin için bir şey yapman yeterli.",
    },
    {
        emoji: "💕",
        baslik: "Bugün sana notum",
        mesaj:
            "Senin yanında olduğumu ve her zaman seni desteklediğimi unutma.",
    },
    {
        emoji: "🌼",
        baslik: "Bugün sana notum",
        mesaj:
            "Küçük mutlulukları fark ettiğin çok güzel bir gün olsun.",
    },
    {
        emoji: "💖",
        baslik: "Bugün sana notum",
        mesaj:
            "Bugün de seni ne kadar çok sevdiğimi söylemek istedim.",
    },
];

function tarihSayisiGetir() {
    const tarihMetni = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const [yil, ay, gun] = tarihMetni
        .split("-")
        .map(Number);

    return yil * 372 + ay * 31 + gun;
}

export function bugununNotunuGetir() {
    const tarihSayisi = tarihSayisiGetir();
    const index = tarihSayisi % gunlukNotlar.length;

    return gunlukNotlar[index];
}