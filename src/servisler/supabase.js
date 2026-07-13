import { createClient } from "@supabase/supabase-js";

const supabaseUrlHam =
    import.meta.env.VITE_SUPABASE_URL?.trim();

const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

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
            adres.hostname.endsWith(".supabase.co")
        );
    } catch {
        return false;
    }
}

export const supabaseHazir =
    supabaseUrlGecerliMi(supabaseUrl) &&
    Boolean(supabaseAnonKey);

if (!supabaseHazir) {
    console.error("Supabase ayarlari gecersiz.", {
        urlVarMi: Boolean(supabaseUrlHam),
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