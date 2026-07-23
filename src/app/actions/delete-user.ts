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
    // Ambil data user sebelum dinonaktifkan
    const { data: targetUser } = await supabaseAdmin.from("profiles").select("fullname").eq("id", userId).single();

    // PRD §3.4: Nonaktifkan user (is_active = false) — bukan hard delete
    // User tidak bisa login lagi, tapi data pelanggan/deal miliknya tetap tersimpan
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: false })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Notifikasi ke semua user aktif
    const { data: users } = await supabaseAdmin.from("profiles").select("id").eq("is_active", true);
    if (users && targetUser) {
      for (const u of users) {
        Promise.resolve(supabaseAdmin.from("notifications").insert({
          user_id: u.id,
          title: "User Dinonaktifkan",
          message: `${targetUser.fullname} telah dinonaktifkan oleh administrator`,
          type: "activity_added",
          link: "/users",
        })).catch(() => {});
      }
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menonaktifkan user",
    };
  }
}
