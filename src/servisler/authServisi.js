import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase bağlantısı hazır değil. .env ayarlarını kontrol et.",
        );
    }
}

function authHatasiniCevir(
    error,
    varsayilanMesaj,
) {
    const mesaj = String(
        error?.message || "",
    ).toLowerCase();

    if (
        mesaj.includes(
            "email rate limit exceeded",
        )
    ) {
        return new Error(
            "E-posta gönderim limiti aşıldı. Supabase üzerinden e-posta doğrulamasını kapatmalısın.",
        );
    }

    if (
        mesaj.includes(
            "user already registered",
        ) ||
        mesaj.includes(
            "already been registered",
        )
    ) {
        return new Error(
            "Bu e-posta adresiyle daha önce kayıt olunmuş. Giriş yapmayı dene.",
        );
    }

    if (
        mesaj.includes(
            "invalid login credentials",
        ) ||
        mesaj.includes(
            "invalid login",
        )
    ) {
        return new Error(
            "E-posta veya şifre hatalı.",
        );
    }

    if (
        mesaj.includes(
            "email not confirmed",
        )
    ) {
        return new Error(
            "Bu kullanıcı daha önce e-posta doğrulaması açıkken oluşturulmuş. Kullanıcıyı Supabase Authentication ekranından silip yeniden kayıt ol.",
        );
    }

    if (
        mesaj.includes(
            "password should be at least",
        )
    ) {
        return new Error(
            "Şifre en az 6 karakter olmalıdır.",
        );
    }

    if (
        mesaj.includes(
            "unable to validate email address",
        )
    ) {
        return new Error(
            "Geçerli bir e-posta adresi gir.",
        );
    }

    return new Error(
        error?.message ||
        varsayilanMesaj,
    );
}

export async function kayitOl({
    email,
    sifre,
    adSoyad,
}) {
    supabaseKontrolEt();

    const temizEmail = String(
        email || "",
    )
        .trim()
        .toLowerCase();

    const temizAdSoyad = String(
        adSoyad || "",
    ).trim();

    const temizSifre = String(
        sifre || "",
    );

    if (!temizEmail) {
        throw new Error(
            "E-posta adresi zorunludur.",
        );
    }

    if (
        !temizEmail.includes("@")
    ) {
        throw new Error(
            "Geçerli bir e-posta adresi gir.",
        );
    }

    if (
        temizSifre.length < 6
    ) {
        throw new Error(
            "Şifre en az 6 karakter olmalıdır.",
        );
    }

    const { data, error } =
        await supabase.auth.signUp({
            email: temizEmail,
            password: temizSifre,

            options: {
                data: {
                    ad_soyad:
                        temizAdSoyad || null,
                },
            },
        });

    if (error) {
        console.error(
            "Kayıt olma hatası:",
            error,
        );

        throw authHatasiniCevir(
            error,
            "Kullanıcı kaydı oluşturulamadı.",
        );
    }

    if (!data?.user) {
        throw new Error(
            "Kullanıcı oluşturulamadı.",
        );
    }

    /*
     * Confirm email kapalıysa signUp işlemi
     * doğrudan session döndürür.
     */
    if (data.session) {
        return {
            user:
                data.user,

            session:
                data.session,

            profil:
                data.user.user_metadata ||
                {},

            dogrudanGiris:
                true,
        };
    }

    /*
     * Session gelmediyse büyük ihtimalle
     * Supabase'te Confirm email açıktır.
     *
     * Yine de kullanıcı daha önce oluşturulmuş
     * olabilir. Direkt giriş yapmayı deniyoruz.
     */
    const {
        data: girisData,
        error: girisError,
    } =
        await supabase.auth
            .signInWithPassword({
                email:
                    temizEmail,

                password:
                    temizSifre,
            });

    if (girisError) {
        console.error(
            "Kayıt sonrası giriş hatası:",
            girisError,
        );

        throw new Error(
            "Kullanıcı oluşturuldu ancak oturum açılamadı. Supabase Authentication ayarlarından Confirm email seçeneğini kapat.",
        );
    }

    return {
        user:
            girisData.user,

        session:
            girisData.session,

        profil:
            girisData.user
                ?.user_metadata ||
            {},

        dogrudanGiris:
            true,
    };
}

export async function girisYap({
    email,
    sifre,
}) {
    supabaseKontrolEt();

    const temizEmail = String(
        email || "",
    )
        .trim()
        .toLowerCase();

    const temizSifre = String(
        sifre || "",
    );

    if (
        !temizEmail ||
        !temizSifre
    ) {
        throw new Error(
            "E-posta ve şifre zorunludur.",
        );
    }

    const { data, error } =
        await supabase.auth
            .signInWithPassword({
                email:
                    temizEmail,

                password:
                    temizSifre,
            });

    if (error) {
        console.error(
            "Giriş yapma hatası:",
            error,
        );

        throw authHatasiniCevir(
            error,
            "Giriş yapılamadı.",
        );
    }

    if (
        !data?.user ||
        !data?.session
    ) {
        throw new Error(
            "Oturum oluşturulamadı.",
        );
    }

    return {
        user:
            data.user,

        session:
            data.session,

        profil:
            data.user.user_metadata ||
            {},
    };
}

export async function cikisYap() {
    supabaseKontrolEt();

    const { error } =
        await supabase.auth.signOut();

    if (error) {
        console.error(
            "Çıkış yapma hatası:",
            error,
        );

        throw authHatasiniCevir(
            error,
            "Çıkış yapılamadı.",
        );
    }

    return true;
}

export async function aktifOturumuGetir() {
    supabaseKontrolEt();

    const {
        data: { session },
        error,
    } =
        await supabase.auth
            .getSession();

    if (error) {
        console.error(
            "Oturum bilgisi alınamadı:",
            error,
        );

        throw authHatasiniCevir(
            error,
            "Oturum bilgisi alınamadı.",
        );
    }

    return session || null;
}

export async function aktifKullaniciyiGetir() {
    supabaseKontrolEt();

    const {
        data: { user },
        error,
    } =
        await supabase.auth
            .getUser();

    if (error) {
        console.error(
            "Aktif kullanıcı alınamadı:",
            error,
        );

        throw authHatasiniCevir(
            error,
            "Kullanıcı bilgisi alınamadı.",
        );
    }

    return user || null;
}

export function oturumDegisikliginiDinle(
    callback,
) {
    supabaseKontrolEt();

    const {
        data: { subscription },
    } =
        supabase.auth
            .onAuthStateChange(
                (
                    event,
                    session,
                ) => {
                    callback?.({
                        event,
                        session,
                        user:
                            session?.user ||
                            null,
                    });
                },
            );

    return () => {
        subscription
            ?.unsubscribe();
    };
}

export async function profilBilgisiniGetir() {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    if (!user) {
        return null;
    }

    const { data, error } =
        await supabase
            .from("profiller")
            .select(`
                id,
                email,
                ad_soyad,
                avatar_url,
                olusturulma_tarihi,
                guncellenme_tarihi
            `)
            .eq(
                "id",
                user.id,
            )
            .maybeSingle();

    if (error) {
        console.error(
            "Profil bilgisi alınamadı:",
            error,
        );

        throw new Error(
            error.message ||
            "Profil bilgisi alınamadı.",
        );
    }

    /*
     * Profiller tablosunda kayıt yoksa
     * auth metadata üzerinden temel profil döner.
     */
    if (!data) {
        return {
            id:
                user.id,

            email:
                user.email || null,

            ad_soyad:
                user.user_metadata
                    ?.ad_soyad ||
                null,

            avatar_url:
                user.user_metadata
                    ?.avatar_url ||
                null,

            olusturulma_tarihi:
                user.created_at ||
                null,

            guncellenme_tarihi:
                user.updated_at ||
                null,
        };
    }

    return data;
}