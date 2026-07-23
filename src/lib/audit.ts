"use server";

import { createClient } from "@/lib/supabase/server";

export async function logAudit(
  action: "create" | "update" | "delete",
  tableName: string,
  recordId: string,
  oldData?: Record<string, unknown> | null,
  newData?: Record<string, unknown> | null
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData || null,
      new_data: newData || null,
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}
