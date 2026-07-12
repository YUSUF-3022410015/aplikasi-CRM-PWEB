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

export async function resetPasswordByEmail(email: string, newPassword: string) {
  try {
    // Find user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return { success: false, error: listError.message };
    }

    const user = users?.users?.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: "Email tidak ditemukan" };
    }

    // Update password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal reset password",
    };
  }
}
