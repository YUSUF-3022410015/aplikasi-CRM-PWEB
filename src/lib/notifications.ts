import { createClient } from "@/lib/supabase/server";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "followup_reminder" | "quotation_sent" | "quotation_approved" | "quotation_rejected" | "activity_added";
  read: boolean;
  link?: string;
  created_at: string;
}

// Create notification
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification["type"],
  link?: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    link: link || null,
    read: false,
  });
  return !error;
}

// Notify all users (admin, manager, sales)
export async function notifyAllUsers(
  title: string,
  message: string,
  type: Notification["type"],
  link?: string,
  excludeUserId?: string
) {
  const supabase = await createClient();

  // Get all users
  const { data: users } = await supabase.from("profiles").select("id");

  if (!users || users.length === 0) return false;

  // Create notifications for all users (except optionally the current user)
  const notifications = users
    .filter((u) => u.id !== excludeUserId)
    .map((u) => ({
      user_id: u.id,
      title,
      message,
      type,
      link: link || null,
      read: false,
    }));

  if (notifications.length === 0) return false;

  const { error } = await supabase.from("notifications").insert(notifications);
  return !error;
}

// Get user notifications
export async function getUserNotifications(userId: string, limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

// Mark as read
export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}

// Mark all as read
export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

// Get unread count
export async function getUnreadCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count || 0;
}
