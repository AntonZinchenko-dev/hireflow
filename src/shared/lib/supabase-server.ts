import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabasePublicEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return { supabaseUrl, supabaseKey };
}

export async function createServerSupabase() {
    const cookieStore = await cookies();
    const { supabaseUrl, supabaseKey } = getSupabasePublicEnv();

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
        );
    }

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                // In Server Components Next.js forbids mutating cookies.
                // Cookie writes are handled in middleware/route handlers.
                setAll: () => {},
            },
        }
    );
}
export async function getServerSession() {
    const { supabaseUrl, supabaseKey } = getSupabasePublicEnv();
    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    try {
        const supabase = await createServerSupabase();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session;
    } catch {
        return null;
    }
}