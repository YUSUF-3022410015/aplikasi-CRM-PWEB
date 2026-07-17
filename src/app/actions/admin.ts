"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Use service role key for admin operations
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

export async function inviteUser(email: string, fullname: string, password: string, role: string) {
  const error = await checkAdminOnly();
  if (error) return { success: false, error };

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { fullname, role },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: data.user.id,
        fullname,
        email,
        role,
      });

      if (profileError) {
        return { success: false, error: profileError.message };
      }
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengundang user",
    };
  }
}

export async function editUserRole(userId: string, newRole: string) {
  const authError = await checkAdminOnly();
  if (authError) return { success: false, error: authError };

  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengubah role",
    };
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const authError = await checkAdminOnly();
  if (authError) return { success: false, error: authError };

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

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
