"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateQuotationStatus(quotationId: string, newStatus: string) {
  const supabase = await createClient();

  // Update quotation status
  const { error: updateError } = await supabase
    .from("quotations")
    .update({ status: newStatus })
    .eq("id", quotationId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Get quotation details
  const { data: quotation } = await supabase
    .from("quotations")
    .select("*, customer:customers(name)")
    .eq("id", quotationId)
    .single();

  if (!quotation) {
    return { success: false, error: "Quotation not found" };
  }

  const customerName = (quotation.customer as { name: string })?.name || "Unknown";

  // Get all users
  const { data: users } = await supabase.from("profiles").select("id");

  if (users && users.length > 0) {
    // Create notifications for all users
    const notifications = users.map((u) => ({
      user_id: u.id,
      title: newStatus === "approved" ? "Quotation Disetujui" : "Quotation Ditolak",
      message:
        newStatus === "approved"
          ? `Quotation ${quotation.quotation_number} untuk ${customerName} telah disetujui (Rp ${quotation.total.toLocaleString("id-ID")})`
          : `Quotation ${quotation.quotation_number} untuk ${customerName} telah ditolak`,
      type: newStatus === "approved" ? "quotation_approved" : "quotation_rejected",
      link: "/quotations",
      read: false,
    }));

    await supabase.from("notifications").insert(notifications);
  }

  return { success: true };
}
