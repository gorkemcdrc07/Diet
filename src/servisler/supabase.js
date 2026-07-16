import {
    createClient,
} from "@supabase/supabase-js";

const supabaseUrlHam =
    import.meta.env
        .VITE_SUPABASE_URL
        ?.trim();

const supabaseAnonKey =
    import.meta.env
        .VITE_SUPABASE_ANON_KEY
        ?.trim();

const supabaseUrl =
    supabaseUrlHam
        ?.replace(
            /\/rest\/v1\/?$/i,
            "",
        )
        .replace(
            /\/+$/,
            "",
        );

function supabaseUrlGecerliMi(
    url,
) {
    if (!url) {
        return false;
    }

    try {
        const adres =
            new URL(url);

        return (
            adres.protocol ===
            "https:" &&
            adres.hostname.endsWith(
                ".supabase.co",
            )
        );
    } catch {
        return false;
    }
}

export const supabaseHazir =
    supabaseUrlGecerliMi(
        supabaseUrl,
    ) &&
    Boolean(
        supabaseAnonKey,
    );

if (!supabaseHazir) {
    console.error(
        "Supabase ayarları geçersiz.",
        {
            urlVarMi:
                Boolean(
                    supabaseUrlHam,
                ),

            urlGecerliMi:
                supabaseUrlGecerliMi(
                    supabaseUrl,
                ),

            anonKeyVarMi:
                Boolean(
                    supabaseAnonKey,
                ),
        },
    );
}

export const supabase =
    supabaseHazir
        ? createClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                auth: {
                    persistSession:
                        true,

                    autoRefreshToken:
                        true,

                    detectSessionInUrl:
                        true,

                    storage:
                        window.localStorage,

                    storageKey:
                        "diyet-uygulamasi-auth",
                },
            },
        )
        : null;

/*
 * Geçici Supabase Auth ayar kontrolü.
 *
 * Kayıt problemi çözüldükten sonra
 * authAyarlariniKontrolEt fonksiyonunu
 * ve alttaki çağrısını kaldırabilirsin.
 */
async function authAyarlariniKontrolEt() {
    if (
        !supabaseHazir ||
        !supabaseUrl ||
        !supabaseAnonKey
    ) {
        return;
    }

    try {
        const response =
            await fetch(
                `${supabaseUrl}/auth/v1/settings`,
                {
                    method:
                        "GET",

                    headers: {
                        apikey:
                            supabaseAnonKey,

                        Authorization:
                            `Bearer ${supabaseAnonKey}`,

                        "Content-Type":
                            "application/json",
                    },
                },
            );

        let sonuc = null;

        try {
            sonuc =
                await response.json();
        } catch {
            sonuc = null;
        }

        console.log(
            "Supabase bağlantı adresi:",
            supabaseUrl,
        );

        console.log(
            "Supabase Auth HTTP durumu:",
            response.status,
        );

        console.log(
            "Supabase Auth ayarları:",
            sonuc,
        );

        console.log(
            "Önemli Auth ayarları:",
            {
                emailProvider:
                    sonuc?.external
                        ?.email,

                disableSignup:
                    sonuc?.disable_signup,

                mailerAutoconfirm:
                    sonuc?.mailer_autoconfirm,
            },
        );

        if (!response.ok) {
            console.error(
                "Supabase Auth ayarları alınamadı.",
                {
                    status:
                        response.status,

                    statusText:
                        response.statusText,

                    sonuc,
                },
            );

            return;
        }

        if (
            sonuc?.external
                ?.email === false
        ) {
            console.warn(
                "Email provider kapalı görünüyor.",
            );
        }

        if (
            sonuc?.disable_signup ===
            true
        ) {
            console.warn(
                "Yeni kullanıcı kaydı backend tarafında kapalı görünüyor.",
            );
        }

        if (
            sonuc?.mailer_autoconfirm ===
            false
        ) {
            console.warn(
                "E-posta doğrulaması backend tarafında açık görünüyor.",
            );
        }
    } catch (error) {
        console.error(
            "Supabase Auth ayarları okunamadı:",
            error,
        );
    }
}

if (
    import.meta.env.DEV &&
    supabaseHazir
) {
    authAyarlariniKontrolEt();
}