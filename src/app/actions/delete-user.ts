"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function checkAdminOnly(): Promise<string | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Unauthorized";

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return "Forbidden: hanya Admin yang dapat melakukan aksi ini";
    }

    return null;
  } catch {
    return "Unauthorized";
  }
}

export async function deactivateUser(userId: string) {
  const authError = await checkAdminOnly();
  if (authError) return { success: false, error: authError };

  try {
    // PRD §3.4: Nonaktifkan user (is_active = false) — bukan hard delete
    // User tidak bisa login lagi, tapi data pelanggan/deal miliknya tetap tersimpan
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: false })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menonaktifkan user",
    };
  }
}
