import { useState } from "react";
import {
    Eye,
    EyeOff,
    Heart,
    LoaderCircle,
    LockKeyhole,
    LogIn,
    Mail,
    Sparkles,
    UserRound,
} from "lucide-react";

import {
    girisYap,
    kayitOl,
} from "../servisler/authServisi";

import "./GirisSayfasi.css";

export default function GirisSayfasi() {
    const [mod, setMod] = useState("giris");

    const [form, setForm] = useState({
        adSoyad: "",
        email: "",
        sifre: "",
    });

    const [sifreGorunuyor, setSifreGorunuyor] =
        useState(false);

    const [yukleniyor, setYukleniyor] =
        useState(false);

    const [hata, setHata] = useState("");
    const [mesaj, setMesaj] = useState("");

    const kayitModu = mod === "kayit";

    function alanDegistir(event) {
        const { name, value } = event.target;

        setForm((mevcut) => ({
            ...mevcut,
            [name]: value,
        }));
    }

    function moduDegistir(yeniMod) {
        setMod(yeniMod);
        setHata("");
        setMesaj("");
    }

    async function formuGonder(event) {
        event.preventDefault();

        setHata("");
        setMesaj("");
        setYukleniyor(true);

        try {
            if (kayitModu) {
                const sonuc = await kayitOl({
                    adSoyad: form.adSoyad,
                    email: form.email,
                    sifre: form.sifre,
                });

                if (!sonuc?.session) {
                    setMesaj(
                        "Hesabın oluşturuldu. E-posta adresine gelen doğrulama bağlantısına tıklayıp giriş yapabilirsin.",
                    );

                    setMod("giris");
                    return;
                }

                setMesaj(
                    "Hesabın oluşturuldu. Uygulama hazırlanıyor.",
                );

                return;
            }

            await girisYap({
                email: form.email,
                sifre: form.sifre,
            });
        } catch (error) {
            setHata(
                error?.message ||
                "İşlem sırasında bir hata oluştu.",
            );
        } finally {
            setYukleniyor(false);
        }
    }

    return (
        <main className="giris-sayfasi">
            <div className="giris-arka-plan">
                <span className="giris-isik giris-isik--bir" />
                <span className="giris-isik giris-isik--iki" />
                <span className="giris-isik giris-isik--uc" />
            </div>

            <section className="giris-karti">
                <div className="giris-logo">
                    <Heart
                        size={34}
                        strokeWidth={1.8}
                        fill="currentColor"
                    />

                    <Sparkles
                        className="giris-logo-parilti"
                        size={18}
                    />
                </div>

                <div className="giris-baslik">
                    <span>Senin için hazırlandı</span>

                    <h1>
                        {kayitModu
                            ? "Hesabını oluştur"
                            : "Tekrar hoş geldin"}
                    </h1>

                    <p>
                        {kayitModu
                            ? "İlerlemen, Miço ve Viki’nin anıları bu hesapta güvenle saklanacak."
                            : "Programına, XP’lerine ve Miço ile Viki’ye kaldığın yerden devam et."}
                    </p>
                </div>

                <div className="giris-sekmeler">
                    <button
                        type="button"
                        className={
                            !kayitModu
                                ? "aktif"
                                : ""
                        }
                        onClick={() =>
                            moduDegistir("giris")
                        }
                    >
                        Giriş yap
                    </button>

                    <button
                        type="button"
                        className={
                            kayitModu
                                ? "aktif"
                                : ""
                        }
                        onClick={() =>
                            moduDegistir("kayit")
                        }
                    >
                        Kayıt ol
                    </button>
                </div>

                <form
                    className="giris-formu"
                    onSubmit={formuGonder}
                >
                    {kayitModu && (
                        <label className="giris-alani">
                            <span>Ad soyad</span>

                            <div>
                                <UserRound size={18} />

                                <input
                                    type="text"
                                    name="adSoyad"
                                    value={form.adSoyad}
                                    onChange={alanDegistir}
                                    placeholder="Adın ve soyadın"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </label>
                    )}

                    <label className="giris-alani">
                        <span>E-posta</span>

                        <div>
                            <Mail size={18} />

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={alanDegistir}
                                placeholder="ornek@email.com"
                                autoComplete="email"
                                required
                            />
                        </div>
                    </label>

                    <label className="giris-alani">
                        <span>Şifre</span>

                        <div>
                            <LockKeyhole size={18} />

                            <input
                                type={
                                    sifreGorunuyor
                                        ? "text"
                                        : "password"
                                }
                                name="sifre"
                                value={form.sifre}
                                onChange={alanDegistir}
                                placeholder="En az 6 karakter"
                                autoComplete={
                                    kayitModu
                                        ? "new-password"
                                        : "current-password"
                                }
                                minLength={6}
                                required
                            />

                            <button
                                type="button"
                                className="sifre-goster-butonu"
                                onClick={() =>
                                    setSifreGorunuyor(
                                        (mevcut) =>
                                            !mevcut,
                                    )
                                }
                                aria-label={
                                    sifreGorunuyor
                                        ? "Şifreyi gizle"
                                        : "Şifreyi göster"
                                }
                            >
                                {sifreGorunuyor ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </label>

                    {hata && (
                        <div className="giris-bildirimi giris-bildirimi--hata">
                            {hata}
                        </div>
                    )}

                    {mesaj && (
                        <div className="giris-bildirimi giris-bildirimi--basarili">
                            {mesaj}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="giris-ana-butonu"
                        disabled={yukleniyor}
                    >
                        {yukleniyor ? (
                            <>
                                <LoaderCircle
                                    className="giris-donuyor"
                                    size={19}
                                />
                                İşleniyor...
                            </>
                        ) : (
                            <>
                                <LogIn size={19} />

                                {kayitModu
                                    ? "Hesap oluştur"
                                    : "Giriş yap"}
                            </>
                        )}
                    </button>
                </form>

                <p className="giris-alt-yazi">
                    <Heart
                        size={13}
                        fill="currentColor"
                    />
                    İlerlemen güvenli şekilde saklanır
                </p>
            </section>
        </main>
    );
}