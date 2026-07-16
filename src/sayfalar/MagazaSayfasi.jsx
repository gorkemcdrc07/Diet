import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Check,
    Coins,
    Flame,
    Heart,
    PackageOpen,
    PawPrint,
    Search,
    ShoppingBag,
    Sparkles,
    Star,
    X,
} from "lucide-react";

import {
    envanteriGetir,
    magazaUrunleriniGetir,
    magazaUrunuSatinAl,
} from "../servisler/magazaServisi";

import {
    coinOzetiniGetir,
} from "../servisler/coinServisi";

import "./MagazaSayfasi.css";

const KATEGORILER = [
    { id: "tumu", etiket: "Tümü", ikon: ShoppingBag },
    { id: "romantik", etiket: "Romantik", ikon: Heart },
    { id: "mico", etiket: "Miço", ikon: PawPrint },
    { id: "viki", etiket: "Viki", ikon: PawPrint },
    { id: "efekt", etiket: "Efekt", ikon: Sparkles },
    { id: "tema", etiket: "Tema", ikon: PackageOpen },
];

// Bir sonraki ödül eşiği için sabit kilometre taşları.
// Backend'den hedef gelirse (coinOzeti.sonraki_hedef) o kullanılır, yoksa buraya düşülür.
const VARSAYILAN_HEDEFLER = [50, 100, 200, 350, 500, 750, 1000];

// Coin yetersizken Miço'nun söyleyeceği huysuz uyarılar.
const MICO_YETERSIZ_MESAJLARI = [
    "Coin'in yok. Görevlerini bitir de gel, yoksa yatağına sıçarım.",
    "HAV! Cebin boş. Önce görevini yap, sonra konuşuruz.",
    "Bu kadar coinle bu ürünü alamazsın. Git görevlerini tamamla.",
    "Coin yetersiz. Kazanmadan almak yok, kural bu.",
    "Beni bu şekilde ikna edemezsin. Önce görevler, sonra mağaza.",
];

// Coin yetersizken Viki'nin söyleyeceği mama odaklı repliği.
const VIKI_YETERSIZ_MESAJLARI = [
    "Coin yok demek. Neyse, ben zaten mama severim. Bana mama ver 🍗",
    "Cebin boşmuş ama mama kabım da boş. Bir çözüm bulalım mı?",
    "Coin bulamadın... Sen mama getir, ben coin'i unuturum 🥹",
    "Üzülme, coin değil mama severim ben. Hadi mama zamanı!",
    "Görev bitince coin de gelir. Ama mama şimdi de gelebilir aslında 👀",
];

function yetersizKarakterVeMesajSec() {
    const karakter = Math.random() < 0.5 ? "mico" : "viki";
    const mesaj = rastgeleSec(
        karakter === "mico"
            ? MICO_YETERSIZ_MESAJLARI
            : VIKI_YETERSIZ_MESAJLARI,
    );
    return { karakter, mesaj };
}

function rastgeleSec(liste) {
    if (!Array.isArray(liste) || liste.length === 0) return "";
    return liste[Math.floor(Math.random() * liste.length)];
}

function urunKategoriyeUyuyorMu(urun, seciliKategori) {
    if (seciliKategori === "tumu") return true;
    if (seciliKategori === "mico") return urun.karakter === "mico";
    if (seciliKategori === "viki") return urun.karakter === "viki";
    return urun.kategori === seciliKategori;
}

function nadirlikEtiketiGetir(nadirlik) {
    switch (nadirlik) {
        case "efsanevi": return "Efsanevi";
        case "epik": return "Epik";
        case "nadir": return "Nadir";
        default: return "Normal";
    }
}

function nadirlikYildizi(nadirlik) {
    switch (nadirlik) {
        case "efsanevi": return 5;
        case "epik": return 4;
        case "nadir": return 3;
        default: return 2;
    }
}

function sonrakiHedefiHesapla(mevcutCoin, backendHedef) {
    if (Number.isFinite(backendHedef) && backendHedef > mevcutCoin) {
        return backendHedef;
    }
    const bulunan = VARSAYILAN_HEDEFLER.find((h) => h > mevcutCoin);
    return bulunan || mevcutCoin + 100;
}

// Basit kural tabanlı "sana özel" öneri: envanterdeki karakter/kategori
// ağırlıklarına göre henüz alınmamış ürünleri öne çıkarır. LLM entegrasyonu
// gelene kadar geçici bir sezgisel katman.
function sanaOzelUrunleriSec(urunler, envanter, satinAlinanIdleri) {
    if (!urunler.length) return [];

    const agirlik = {};
    envanter.forEach((kayit) => {
        const k = kayit?.urun?.karakter;
        const kat = kayit?.urun?.kategori;
        if (k) agirlik[`karakter:${k}`] = (agirlik[`karakter:${k}`] || 0) + 1;
        if (kat) agirlik[`kategori:${kat}`] = (agirlik[`kategori:${kat}`] || 0) + 1;
    });

    const adaylar = urunler.filter((u) => !satinAlinanIdleri.has(u.id));

    const puanla = (urun) => {
        let puan = 0;
        if (urun.karakter) puan += agirlik[`karakter:${urun.karakter}`] || 0;
        if (urun.kategori) puan += agirlik[`kategori:${urun.kategori}`] || 0;
        if (urun.nadirlik === "efsanevi") puan += 0.5;
        return puan;
    };

    return [...adaylar]
        .sort((a, b) => puanla(b) - puanla(a))
        .slice(0, 4);
}

export default function MagazaSayfasi() {
    const [urunler, setUrunler] = useState([]);
    const [envanter, setEnvanter] = useState([]);
    const [coinOzeti, setCoinOzeti] = useState(null);
    const [seciliKategori, setSeciliKategori] = useState("tumu");
    const [aramaMetni, setAramaMetni] = useState("");
    const [yukleniyor, setYukleniyor] = useState(true);
    const [hata, setHata] = useState("");
    const [satinAlinanUrun, setSatinAlinanUrun] = useState(null);
    const [satinAlinanUrunId, setSatinAlinanUrunId] = useState(null);
    const [detayUrunu, setDetayUrunu] = useState(null);
    const [yetersizUyari, setYetersizUyari] = useState(null);

    const yetersizTimerRef = useRef(null);

    function yetersizUyariGoster() {
        if (yetersizTimerRef.current) {
            window.clearTimeout(yetersizTimerRef.current);
        }

        setYetersizUyari({
            ...yetersizKarakterVeMesajSec(),
            anahtar: Date.now(),
        });

        yetersizTimerRef.current = window.setTimeout(() => {
            setYetersizUyari(null);
        }, 4200);
    }

    useEffect(() => {
        return () => {
            if (yetersizTimerRef.current) {
                window.clearTimeout(yetersizTimerRef.current);
            }
        };
    }, []);

    async function verileriYukle() {
        setYukleniyor(true);
        setHata("");

        try {
            const [urunVerisi, envanterVerisi, coinVerisi] = await Promise.all([
                magazaUrunleriniGetir(),
                envanteriGetir(),
                coinOzetiniGetir(),
            ]);

            setUrunler(Array.isArray(urunVerisi) ? urunVerisi : []);
            setEnvanter(Array.isArray(envanterVerisi) ? envanterVerisi : []);
            setCoinOzeti(coinVerisi);
        } catch (error) {
            console.error("Mağaza verileri yüklenemedi:", error);
            setHata(error?.message || "Mağaza yüklenemedi.");
        } finally {
            setYukleniyor(false);
        }
    }

    useEffect(() => {
        verileriYukle();
    }, []);

    const satinAlinanUrunIdleri = useMemo(() => {
        return new Set(
            envanter.map((kayit) => kayit?.urun?.id).filter(Boolean),
        );
    }, [envanter]);

    const filtrelenmisUrunler = useMemo(() => {
        const metin = aramaMetni.trim().toLocaleLowerCase("tr-TR");

        return urunler.filter((urun) => {
            if (!urunKategoriyeUyuyorMu(urun, seciliKategori)) return false;
            if (!metin) return true;

            const ad = (urun.ad || "").toLocaleLowerCase("tr-TR");
            const aciklama = (urun.aciklama || "").toLocaleLowerCase("tr-TR");
            return ad.includes(metin) || aciklama.includes(metin);
        });
    }, [urunler, seciliKategori, aramaMetni]);

    const gununFirsati = useMemo(() => {
        const adaylar = urunler.filter(
            (u) => !satinAlinanUrunIdleri.has(u.id) && (u.gunun_firsati || u.indirim_yuzdesi),
        );
        if (adaylar.length) return adaylar[0];

        // Backend'den özel bir işaret gelmiyorsa, günün tarihine göre
        // sabit (ama günlük değişen) bir ürünü öne çıkar.
        const uygunlar = urunler.filter((u) => !satinAlinanUrunIdleri.has(u.id));
        if (!uygunlar.length) return null;

        const gunIndeksi = new Date().getDate() % uygunlar.length;
        return uygunlar[gunIndeksi];
    }, [urunler, satinAlinanUrunIdleri]);

    const sanaOzelUrunler = useMemo(
        () => sanaOzelUrunleriSec(urunler, envanter, satinAlinanUrunIdleri),
        [urunler, envanter, satinAlinanUrunIdleri],
    );

    const mevcutCoin = Number(coinOzeti?.mevcut_coin) || 0;
    const bugunKazanilan = coinOzeti?.bugun_kazanilan;
    const sonrakiHedef = sonrakiHedefiHesapla(mevcutCoin, Number(coinOzeti?.sonraki_hedef));
    const hedefeKalan = Math.max(sonrakiHedef - mevcutCoin, 0);
    const ilerlemeYuzdesi = Math.min(
        100,
        Math.round((mevcutCoin / sonrakiHedef) * 100),
    );

    async function urunuSatinAl(urun) {
        if (!urun?.id) return;

        setSatinAlinanUrunId(urun.id);
        setHata("");

        try {
            const sonuc = await magazaUrunuSatinAl(urun.id);

            if (sonuc?.tekrar) {
                setHata("Bu ürün zaten envanterinde.");
                return;
            }

            setSatinAlinanUrun(sonuc?.urun || urun);
            setDetayUrunu(null);

            const [yeniEnvanter, yeniCoinOzeti] = await Promise.all([
                envanteriGetir(),
                coinOzetiniGetir(),
            ]);

            setEnvanter(Array.isArray(yeniEnvanter) ? yeniEnvanter : []);
            setCoinOzeti(yeniCoinOzeti);
        } catch (error) {
            console.error("Satın alma işlemi başarısız:", error);
            setHata(error?.message || "Ürün satın alınamadı.");
        } finally {
            setSatinAlinanUrunId(null);
        }
    }

    function urunKartiRender(urun, { vurgulu = false } = {}) {
        const satinAlindi = satinAlinanUrunIdleri.has(urun.id);
        const islemde = satinAlinanUrunId === urun.id;
        const yetersizCoin = mevcutCoin < Number(urun.fiyat);
        const kalanCoin = Math.max(Number(urun.fiyat) - mevcutCoin, 0);
        const yildizSayisi = nadirlikYildizi(urun.nadirlik);

        return (
            <article
                key={urun.id}
                className={[
                    "magaza-urun-karti",
                    `magaza-urun-karti--${urun.nadirlik}`,
                    vurgulu ? "magaza-urun-karti--vurgulu" : "",
                ].join(" ").trim()}
                onClick={() => setDetayUrunu(urun)}
            >
                <span className="magaza-urun-shine" aria-hidden="true" />

                {urun.nadirlik === "efsanevi" && (
                    <span className="magaza-pirilti" aria-hidden="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <i key={i} style={{ "--i": i }} />
                        ))}
                    </span>
                )}

                <div className="magaza-urun-ust">
                    <span className="magaza-urun-ikon-halka">
                        <span className="magaza-urun-ikon">{urun.ikon || "🎁"}</span>
                    </span>
                    <span className="magaza-nadirlik">
                        {nadirlikEtiketiGetir(urun.nadirlik)}
                    </span>
                </div>

                <div className="magaza-urun-icerik">
                    <span className="magaza-urun-kategori">{urun.kategori}</span>
                    <h2>{urun.ad}</h2>

                    <div className="magaza-yildizlar" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                fill={i < yildizSayisi ? "currentColor" : "none"}
                            />
                        ))}
                    </div>

                    <p>{urun.aciklama}</p>
                </div>

                <div className="magaza-urun-alt">
                    <div className="magaza-fiyat">
                        <Coins size={17} className="magaza-coin-donen" />
                        <strong>{urun.fiyat}</strong>
                    </div>

                    <button
                        type="button"
                        className={satinAlindi ? "magaza-btn-sahip" : "magaza-btn-satinal"}
                        disabled={satinAlindi || islemde}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (yetersizCoin) {
                                yetersizUyariGoster();
                                return;
                            }
                            urunuSatinAl(urun);
                        }}
                    >
                        {satinAlindi ? (
                            <>
                                <Check size={16} />
                                Sahipsin
                            </>
                        ) : islemde ? (
                            "Alınıyor..."
                        ) : yetersizCoin ? (
                            `${kalanCoin} Coin Eksik`
                        ) : (
                            "Satın Al"
                        )}
                    </button>
                </div>

                {yetersizCoin && !satinAlindi && (
                    <div className="magaza-mini-ilerleme" aria-hidden="true">
                        <div
                            className="magaza-mini-ilerleme-dolu"
                            style={{
                                width: `${Math.min(100, Math.round((mevcutCoin / Number(urun.fiyat)) * 100))}%`,
                            }}
                        />
                    </div>
                )}
            </article>
        );
    }

    return (
        <div className="magaza-sayfasi">
            <section className="magaza-hero">
                <div>
                    <span className="magaza-mini-baslik">
                        Miço, Viki ve senin için
                    </span>
                    <h1>Ödül Mağazası</h1>
                    <p>
                        Günlük hedeflerini tamamla, coin biriktir ve özel
                        ödülleri aç.
                    </p>
                </div>
            </section>

            <section className="magaza-cuzdan">
                <div className="magaza-cuzdan-ust">
                    <div className="magaza-cuzdan-coin">
                        <span className="magaza-altin-coin" aria-hidden="true">
                            <span className="magaza-altin-coin-yuz magaza-altin-coin-on">
                                <Coins size={18} />
                            </span>
                            <span className="magaza-altin-coin-yuz magaza-altin-coin-arka">
                                ₺
                            </span>
                        </span>
                        <div>
                            <strong>{mevcutCoin}</strong>
                            <span>Coin</span>
                        </div>
                    </div>

                    {Number.isFinite(Number(bugunKazanilan)) && (
                        <div className="magaza-cuzdan-bugun">
                            Bugün <strong>+{bugunKazanilan}</strong>
                        </div>
                    )}
                </div>

                <div className="magaza-cuzdan-ilerleme">
                    <div className="magaza-cuzdan-ilerleme-yolu">
                        <div
                            className="magaza-cuzdan-ilerleme-dolu"
                            style={{ width: `${ilerlemeYuzdesi}%` }}
                        />
                    </div>
                    <span>
                        Sonraki ödüle <strong>{hedefeKalan} Coin</strong>
                    </span>
                </div>
            </section>

            {gununFirsati && !yukleniyor && (
                <section
                    className="magaza-firsat-karti"
                    onClick={() => setDetayUrunu(gununFirsati)}
                >
                    <div className="magaza-firsat-etiket">
                        <Flame size={14} />
                        Bugün Sana Özel
                    </div>

                    <div className="magaza-firsat-govde">
                        <span className="magaza-urun-ikon">
                            {gununFirsati.ikon || "🎁"}
                        </span>

                        <div className="magaza-firsat-metin">
                            <h3>{gununFirsati.ad}</h3>
                            <p>{gununFirsati.aciklama}</p>
                        </div>

                        <div className="magaza-firsat-sag">
                            <div className="magaza-fiyat">
                                <Coins size={16} />
                                <strong>{gununFirsati.fiyat}</strong>
                            </div>
                            <button
                                type="button"
                                disabled={
                                    satinAlinanUrunIdleri.has(gununFirsati.id) ||
                                    satinAlinanUrunId === gununFirsati.id
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (mevcutCoin < Number(gununFirsati.fiyat)) {
                                        yetersizUyariGoster();
                                        return;
                                    }
                                    urunuSatinAl(gununFirsati);
                                }}
                            >
                                {satinAlinanUrunIdleri.has(gununFirsati.id)
                                    ? "Sahipsin"
                                    : "Satın Al"}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {sanaOzelUrunler.length > 0 && !yukleniyor && (
                <section className="magaza-oneri-bolumu">
                    <h3>Sana Özel Seçtik</h3>
                    <div className="magaza-oneri-satiri">
                        {sanaOzelUrunler.map((urun) => (
                            <div
                                key={urun.id}
                                className="magaza-oneri-karti"
                                onClick={() => setDetayUrunu(urun)}
                            >
                                <span>{urun.ikon || "🎁"}</span>
                                <strong>{urun.ad}</strong>
                                <div className="magaza-fiyat">
                                    <Coins size={13} />
                                    {urun.fiyat}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="magaza-arama">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                />
            </section>

            <section className="magaza-kategoriler">
                {KATEGORILER.map((kategori) => {
                    const Icon = kategori.ikon;
                    const aktif = seciliKategori === kategori.id;

                    return (
                        <button
                            key={kategori.id}
                            type="button"
                            className={aktif ? "aktif" : ""}
                            onClick={() => setSeciliKategori(kategori.id)}
                        >
                            <Icon size={17} />
                            <span>{kategori.etiket}</span>
                        </button>
                    );
                })}
            </section>

            {hata && <section className="magaza-hata">{hata}</section>}

            {yukleniyor ? (
                <section className="magaza-yukleniyor">
                    <span />
                    <strong>Mağaza hazırlanıyor...</strong>
                </section>
            ) : (
                <section className="magaza-urun-grid">
                    {filtrelenmisUrunler.map((urun) => urunKartiRender(urun))}
                </section>
            )}

            {envanter.length > 0 && !yukleniyor && (
                <section className="magaza-envanter">
                    <div className="magaza-envanter-baslik">
                        <h3>🎒 Envanterim</h3>
                        <span className="magaza-envanter-sayac">
                            {envanter.length} ürün
                        </span>
                    </div>

                    <div className="magaza-envanter-satiri">
                        {envanter.map((kayit) => (
                            <div
                                key={kayit?.urun?.id || kayit?.id}
                                className={[
                                    "magaza-envanter-ogesi",
                                    `magaza-envanter-ogesi--${kayit?.urun?.nadirlik || "normal"}`,
                                ].join(" ")}
                            >
                                <span className="magaza-envanter-rozet">
                                    <Check size={10} />
                                </span>
                                <span className="magaza-envanter-ikon">
                                    {kayit?.urun?.ikon || "🎁"}
                                </span>
                                <small>{kayit?.urun?.ad}</small>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {detayUrunu && (
                <div
                    className="magaza-sheet-katmani"
                    onClick={() => setDetayUrunu(null)}
                >
                    <section
                        className="magaza-sheet"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="magaza-sheet-kapat"
                            onClick={() => setDetayUrunu(null)}
                            aria-label="Kapat"
                        >
                            <X size={18} />
                        </button>

                        <div className="magaza-urun-ikon magaza-sheet-ikon">
                            {detayUrunu.ikon || "🎁"}
                        </div>

                        <div className="magaza-yildizlar magaza-sheet-yildizlar">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    fill={
                                        i < nadirlikYildizi(detayUrunu.nadirlik)
                                            ? "currentColor"
                                            : "none"
                                    }
                                />
                            ))}
                        </div>

                        <h2>{detayUrunu.ad}</h2>
                        <p>{detayUrunu.aciklama}</p>

                        <div className="magaza-sheet-alt">
                            <div className="magaza-fiyat">
                                <Coins size={18} />
                                <strong>{detayUrunu.fiyat}</strong>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    satinAlinanUrunIdleri.has(detayUrunu.id) ||
                                    satinAlinanUrunId === detayUrunu.id
                                }
                                onClick={() => {
                                    if (mevcutCoin < Number(detayUrunu.fiyat)) {
                                        yetersizUyariGoster();
                                        return;
                                    }
                                    urunuSatinAl(detayUrunu);
                                }}
                            >
                                {satinAlinanUrunIdleri.has(detayUrunu.id)
                                    ? "Sahipsin"
                                    : satinAlinanUrunId === detayUrunu.id
                                        ? "Alınıyor..."
                                        : mevcutCoin < Number(detayUrunu.fiyat)
                                            ? "Coin Yetersiz"
                                            : "Satın Al"}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {yetersizUyari && (
                <div
                    key={yetersizUyari.anahtar}
                    className={[
                        "magaza-yetersiz-toast",
                        `magaza-yetersiz-toast--${yetersizUyari.karakter}`,
                    ].join(" ")}
                    role="alert"
                >
                    <img
                        src={
                            yetersizUyari.karakter === "mico"
                                ? "/karakterler/mico-kizgin.png"
                                : "/karakterler/viki-mama.png"
                        }
                        alt={
                            yetersizUyari.karakter === "mico"
                                ? "Miço kızgın"
                                : "Viki acıkmış"
                        }
                        className="magaza-yetersiz-gorsel"
                        draggable="false"
                    />

                    <div className="magaza-yetersiz-metin">
                        <strong>
                            {yetersizUyari.karakter === "mico" ? "Miço" : "Viki"}
                        </strong>
                        <p>{yetersizUyari.mesaj}</p>
                    </div>

                    <button
                        type="button"
                        className="magaza-yetersiz-kapat"
                        onClick={() => setYetersizUyari(null)}
                        aria-label="Kapat"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {satinAlinanUrun && (
                <div className="magaza-kutlama-katmani">
                    <section className="magaza-kutlama-karti">
                        <div className="magaza-konfeti" aria-hidden="true">
                            {Array.from({ length: 14 }).map((_, i) => (
                                <span key={i} style={{ "--i": i }} />
                            ))}
                        </div>

                        <img
                            src="/karakterler/viki-mama.png"
                            alt="Viki kutluyor"
                            className="magaza-kutlama-maskot"
                            draggable="false"
                        />

                        <div className="magaza-kutlama-ikon">
                            {satinAlinanUrun.ikon || "🎁"}
                        </div>

                        <span>Satın alma tamamlandı</span>
                        <h2>{satinAlinanUrun.ad}</h2>
                        <p>Ürün envanterine eklendi.</p>

                        <button type="button" onClick={() => setSatinAlinanUrun(null)}>
                            Harika
                        </button>
                    </section>
                </div>
            )}
        </div>
    );
}