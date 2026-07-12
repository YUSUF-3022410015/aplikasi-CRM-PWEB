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

export async function generateResetLink(email: string) {
  try {
    const redirectUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\.supabase\.co$/, "")}.vercel.app/reset-password`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const actionLink = data?.properties?.action_link;

    if (!actionLink) {
      return { success: false, error: "Gagal generate link" };
    }

    return { success: true, link: actionLink };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal generate link",
    };
  }
}
