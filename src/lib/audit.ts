import { createClient } from "@/lib/supabase/client";

/**
 * Catat aktivitas ke audit_logs secara non-blocking.
 * Kegagalan audit tidak boleh menggagalkan aksi utama, tetapi tetap dilaporkan.
 */
export function logAudit(
  action: "create" | "update" | "delete",
  tableName: string,
  recordId: string,
  oldData?: Record<string, unknown> | null,
  newData?: Record<string, unknown> | null
) {
  void (async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("audit_logs").insert({
        user_id: user.id,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData || null,
        new_data: newData || null,
      });
      if (error) console.error("Gagal mencatat audit log:", error.message);
    } catch (err) {
      console.error("Gagal mencatat audit log:", err);
    }
  })();
}
