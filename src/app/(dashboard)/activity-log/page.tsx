import { createClient } from "@/lib/supabase/server";
import { ActivityLogList } from "@/components/activity-log-list";

export default async function ActivityLogPage() {
  const supabase = await createClient();

  // Fetch all activities with user info
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      id,
      type,
      note,
      created_at,
      user:profiles(fullname),
      customer:customers(name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch quotations for quotation activities
  const { data: quotations } = await supabase
    .from("quotations")
    .select("id, quotation_number, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch follow-ups
  const { data: followups } = await supabase
    .from("followups")
    .select("id, note, due_date, status, created_at, customer:customers(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch notifications
  const { data: { user } } = await supabase.auth.getUser();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, message, type, created_at")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false })
    .limit(50);

  // Combine and format all activities
  const allActivities = [
    // Activities
    ...(activities || []).map((a) => {
      const cust = (a.customer ?? null) as unknown as { name: string } | null;
      const usr = (a.user ?? null) as unknown as { fullname: string } | null;
      return {
        id: a.id,
        type: a.type,
        description: `${a.note || "Aktivitas"} - ${cust?.name || "Customer"}`,
        module: "customer",
        user: usr?.fullname || "",
        created_at: a.created_at,
      };
    }),
    // Quotations
    ...(quotations || []).map((q) => ({
      id: `q-${q.id}`,
      type: "quotation_created",
      description: `Quotation ${q.quotation_number} - ${q.status} - Rp ${q.total?.toLocaleString("id-ID") || 0}`,
      module: "quotation",
      user: "",
      created_at: q.created_at,
    })),
    // Follow-ups
    ...(followups || []).map((f) => {
      const cust = (f.customer ?? null) as unknown as { name: string } | null;
      return {
        id: `fu-${f.id}`,
        type: "followup_created",
        description: `Follow-up ${cust?.name || "Customer"} - ${f.status} - Jatuh tempo: ${new Date(f.due_date).toLocaleDateString("id-ID")}`,
        module: "followup",
        user: "",
        created_at: f.created_at,
      };
    }),
    // Notifications
    ...(notifications || []).map((n) => ({
      id: `n-${n.id}`,
      type: "notification",
      description: `${n.title} - ${n.message}`,
      module: "notification",
      user: "",
      created_at: n.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">Riwayat semua aktivitas dalam sistem</p>
      </div>

      <ActivityLogList activities={allActivities} />
    </div>
  );
}
