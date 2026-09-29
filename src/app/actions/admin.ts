"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const ALLOWED_ROLES = ["admin", "manager", "sales"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6; // PRD §4: password minimal 6 karakter

// Server actions bisa dipanggil langsung (bukan hanya lewat UI), jadi
// input wajib divalidasi di sini — bukan hanya di form.
function validateRole(role: string): string | null {
  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return `Role tidak valid. Pilihan: ${ALLOWED_ROLES.join(", ")}`;
  }
  return null;
}

function validateEmail(email: string): string | null {
  if (!EMAIL_RE.test(email)) return "Format email tidak valid";
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter`;
  }
  return null;
}

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
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin" || profile.is_active === false) {
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

  const inputError =
    validateEmail(email) ||
    validateRole(role) ||
    validatePassword(password) ||
    (fullname.trim() ? null : "Nama lengkap wajib diisi");
  if (inputError) return { success: false, error: inputError };

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

      // Notifikasi ke semua user aktif
      const { data: users } = await supabaseAdmin.from("profiles").select("id").eq("is_active", true);
      if (users?.length) {
        const { error: notifError } = await supabaseAdmin.from("notifications").insert(
          users.map((u) => ({
            user_id: u.id,
            title: "User Baru",
            message: `${fullname} (${email}) telah diundang sebagai ${role}`,
            type: "activity_added",
            link: "/users",
          }))
        );
        if (notifError) console.error("Gagal membuat notifikasi user baru:", notifError.message);
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

  const roleError = validateRole(newRole);
  if (roleError) return { success: false, error: roleError };

  try {
    // Ambil data user sebelum diubah
    const { data: targetUser } = await supabaseAdmin.from("profiles").select("fullname, role").eq("id", userId).single();

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Notifikasi ke semua user aktif
    const { data: users } = await supabaseAdmin.from("profiles").select("id").eq("is_active", true);
    if (users?.length && targetUser) {
      const { error: notifError } = await supabaseAdmin.from("notifications").insert(
        users.map((u) => ({
          user_id: u.id,
          title: "Role User Diubah",
          message: `Role ${targetUser.fullname} diubah dari "${targetUser.role}" ke "${newRole}"`,
          type: "activity_added",
          link: "/users",
        }))
      );
      if (notifError) console.error("Gagal membuat notifikasi ubah role:", notifError.message);
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

  const passwordError = validatePassword(newPassword);
  if (passwordError) return { success: false, error: passwordError };

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    // Notifikasi ke user yang password-nya direset
    const { error: notifError } = await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title: "Password Direset",
      message: "Password Anda telah direset oleh administrator",
      type: "activity_added",
      link: "/profile",
    });
    if (notifError) console.error("Gagal membuat notifikasi reset password:", notifError.message);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal reset password",
    };
  }
}
