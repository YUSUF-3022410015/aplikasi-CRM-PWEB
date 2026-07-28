import { createClient } from "@/lib/supabase/client";

export function logAudit(
  action: "create" | "update" | "delete",
  tableName: string,
  recordId: string,
  oldData?: Record<string, unknown> | null,
  newData?: Record<string, unknown> | null
) {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    return supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData || null,
      new_data: newData || null,
    });
  }).then(() => {}).catch(() => {});
}
