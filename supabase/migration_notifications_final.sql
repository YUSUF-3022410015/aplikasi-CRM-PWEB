-- ============================================
-- Notifications Table - Combined Migration
-- Jalankan di Supabase SQL Editor jika tabel belum ada
-- ============================================

-- 1. Tabel Notifications (safe - CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('followup_reminder', 'quotation_sent', 'quotation_approved', 'quotation_rejected', 'activity_added')),
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index (safe - CREATE IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- 3. RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop old policies if exist
DROP POLICY IF EXISTS "Notifications: read own" ON notifications;
DROP POLICY IF EXISTS "Notifications: insert own" ON notifications;
DROP POLICY IF EXISTS "Notifications: update own" ON notifications;
DROP POLICY IF EXISTS "Notifications: delete own" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow insert notifications for all users" ON notifications;

-- 4. Policies - allow insert for any authenticated user (needed for cross-user notifications)
CREATE POLICY "notifications_insert_auth" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 5. Enable Realtime (optional - also enable in Supabase Dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
