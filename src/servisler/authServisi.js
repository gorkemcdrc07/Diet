import { supabase } from "./supabase";

function supabaseKontrolEt() {
    if (!supabase) {
        throw new Error(
            "Supabase baðlantýsý hazýr deðil. .env ayarlarýný kontrol et.",
        );
    }
}

export async function kayitOl({
    email,
    sifre,
    adSoyad,
}) {
    supabaseKontrolEt();

    const temizEmail = String(email || "")
        .trim()
        .toLowerCase();

    const temizAdSoyad = String(adSoyad || "")
        .trim();

    if (!temizEmail) {
        throw new Error("E-posta adresi zorunludur.");
    }

    if (!sifre || sifre.length < 6) {
        throw new Error(
            "Þifre en az 6 karakter olmalýdýr.",
        );
    }

    const { data, error } =
        await supabase.auth.signUp({
            email: temizEmail,
            password: sifre,

            options: {
                data: {
                    ad_soyad: temizAdSoyad,
                },
            },
        });

    if (error) {
        console.error(
            "Kayýt olma hatasý:",
            error,
        );

        throw new Error(
            error.message ||
            "Kullanýcý kaydý oluþturulamadý.",
        );
    }

    return data;
}

export async function girisYap({
    email,
    sifre,
}) {
    supabaseKontrolEt();

    const temizEmail = String(email || "")
        .trim()
        .toLowerCase();

    if (!temizEmail || !sifre) {
        throw new Error(
            "E-posta ve þifre zorunludur.",
        );
    }

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: temizEmail,
            password: sifre,
        });

    if (error) {
        console.error(
            "Giriþ yapma hatasý:",
            error,
        );

        if (
            error.message
                ?.toLowerCase()
                .includes("invalid login")
        ) {
            throw new Error(
                "E-posta veya þifre hatalý.",
            );
        }

        throw new Error(
            error.message ||
            "Giriþ yapýlamadý.",
        );
    }

    return data;
}

export async function cikisYap() {
    supabaseKontrolEt();

    const { error } =
        await supabase.auth.signOut();

    if (error) {
        console.error(
            "Çýkýþ yapma hatasý:",
            error,
        );

        throw new Error(
            error.message ||
            "Çýkýþ yapýlamadý.",
        );
    }
}

export async function aktifOturumuGetir() {
    supabaseKontrolEt();

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) {
        console.error(
            "Oturum bilgisi alýnamadý:",
            error,
        );

        throw new Error(
            error.message ||
            "Oturum bilgisi alýnamadý.",
        );
    }

    return session;
}

export async function aktifKullaniciyiGetir() {
    const session =
        await aktifOturumuGetir();

    return session?.user || null;
}

export function oturumDegisikliginiDinle(
    callback,
) {
    supabaseKontrolEt();

    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback?.({
                event,
                session,
                user: session?.user || null,
            });
        },
    );

    return () => {
        subscription?.unsubscribe();
    };
}

export async function profilBilgisiniGetir() {
    supabaseKontrolEt();

    const user =
        await aktifKullaniciyiGetir();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiller")
        .select(
            `
            id,
            email,
            ad_soyad,
            avatar_url,
            olusturulma_tarihi,
            guncellenme_tarihi
            `,
        )
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error(
            "Profil bilgisi alýnamadý:",
            error,
        );

        throw new Error(
            error.message ||
            "Profil bilgisi alýnamadý.",
        );
    }

    return data;
}