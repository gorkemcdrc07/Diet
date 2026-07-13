import { createClient } from "@supabase/supabase-js";

const supabaseUrlHam =
    import.meta.env.VITE_SUPABASE_URL?.trim();

const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/*
 * YanlÄ±ÅŸlÄ±kla ÅŸu ÅŸekilde girilse bile:
 * https://proje.supabase.co/rest/v1/
 *
 * otomatik olarak ÅŸuna Ã§evirir:
 * https://proje.supabase.co
 */
const supabaseUrl = supabaseUrlHam
    ?.replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

function supabaseUrlGecerliMi(url) {
    if (!url) {
        return false;
    }

    try {
        const adres = new URL(url);

        return (
            adres.protocol === "https:" &&
            adres.hostname.endsWith(".supabase.co") &&
            adres.pathname === "/"
        );
    } catch {
        return false;
    }
}

export const supabaseHazir =
    supabaseUrlGecerliMi(supabaseUrl) &&
    Boolean(supabaseAnonKey);

if (!supabaseHazir) {
    console.error("Supabase ayarlarÄ± geÃ§ersiz.", {
        urlVarMi: Boolean(supabaseUrlHam),
        temizlenmisUrl: supabaseUrl,
        urlGecerliMi: supabaseUrlGecerliMi(supabaseUrl),
        anonKeyVarMi: Boolean(supabaseAnonKey),
    });
}

export const supabase = supabaseHazir
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    })
    : null;