"use server";

import { createClient } from "@/lib/supabase/server";
import { sendQuotationEmail, sendFollowUpReminder } from "@/lib/email";

// Manager bersifat read-only (PRD §3.3), jadi hanya admin/sales yang boleh
// memicu aksi tulis-samping seperti kirim email penawaran. Server action bisa
// dipanggil langsung, jadi cek otorisasi wajib di sini, bukan hanya di UI.
async function requireWriteAccess(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_active === false) return { error: "Unauthorized" };
  if (profile.role !== "admin" && profile.role !== "sales") {
    return { error: "Forbidden: aksi ini tidak diizinkan untuk role Anda" };
  }
  return { userId: user.id };
}

// Send quotation email
export async function sendQuotationEmailAction(quotationId: string) {
  const access = await requireWriteAccess();
  if ("error" in access) return { success: false, error: access.error };

  const supabase = await createClient();

  // Get quotation with customer and items
  const { data: quotation, error: qError } = await supabase
    .from("quotations")
    .select(`
      *,
      customer:customers(name, email, company),
      items:quotation_items(
        *,
        product:products(name)
      )
    `)
    .eq("id", quotationId)
    .single();

  if (qError || !quotation) {
    return { success: false, error: "Quotation tidak ditemukan" };
  }

  const customer = quotation.customer as { name: string; email: string; company: string } | null;
  if (!customer?.email) {
    return { success: false, error: "Email customer tidak tersedia" };
  }

  const items = (quotation.items || []).map((item: { product?: { name: string }; qty: number; price: number }) => ({
    name: item.product?.name || "Produk",
    qty: item.qty,
    price: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.price),
  }));

  const total = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(quotation.total);

  const result = await sendQuotationEmail({
    to: customer.email,
    customerName: customer.name,
    quotationNumber: quotation.quotation_number,
    total,
    items,
    notes: quotation.notes || undefined,
  });

  // Hanya catat aktivitas bila email benar-benar terkirim
  if (result.success) {
    const { error: activityError } = await supabase.from("activities").insert({
      customer_id: quotation.customer_id,
      user_id: access.userId,
      type: "email",
      note: `Email penawaran ${quotation.quotation_number} dikirim ke ${customer.email}`,
    });
    if (activityError) console.error("Gagal mencatat aktivitas email:", activityError.message);
  }

  return result;
}

// Send follow-up reminder email
export async function sendFollowUpReminderAction(followUpId: string) {
  const access = await requireWriteAccess();
  if ("error" in access) return { success: false, error: access.error };

  const supabase = await createClient();

  // Get follow-up with customer and assigned user
  const { data: followUp, error: fuError } = await supabase
    .from("followups")
    .select(`
      *,
      customer:customers(name, email),
      assigned_user:profiles(fullname, email)
    `)
    .eq("id", followUpId)
    .single();

  if (fuError || !followUp) {
    return { success: false, error: "Follow-up tidak ditemukan" };
  }

  const customer = followUp.customer as { name: string; email: string } | null;
  const assignedUser = followUp.assigned_user as { fullname: string; email: string } | null;

  if (!assignedUser?.email) {
    return { success: false, error: "Email user tidak tersedia" };
  }

  const dueDate = new Date(followUp.due_date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const result = await sendFollowUpReminder({
    to: assignedUser.email,
    customerName: customer?.name || "Unknown",
    dueDate,
    note: followUp.note || undefined,
  });

  return result;
}
