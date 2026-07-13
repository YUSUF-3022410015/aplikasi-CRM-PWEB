"use server";

import { createClient } from "@supabase/supabase-js";

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

export async function deleteUser(userId: string) {
  try {
    // 1. Nullify foreign key references first (bypass RLS with service role)
    await supabaseAdmin
      .from("customers")
      .update({ assigned_to: null })
      .eq("assigned_to", userId);

    await supabaseAdmin
      .from("activities")
      .update({ user_id: null })
      .eq("user_id", userId);

    await supabaseAdmin
      .from("followups")
      .update({ assigned_to: null })
      .eq("assigned_to", userId);

    // 2. Delete notifications that reference this user
    await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    // 3. Delete from auth.users (profiles cascades automatically via ON DELETE CASCADE)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      return { success: false, error: authError.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus user",
    };
  }
}
