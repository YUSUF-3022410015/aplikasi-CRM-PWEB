-- ============================================
-- Sprint 8 Migration - Notifications
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Tabel Notifications
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

-- 2. Index
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- 3. RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications: read own" ON notifications;
DROP POLICY IF EXISTS "Notifications: insert own" ON notifications;
DROP POLICY IF EXISTS "Notifications: update own" ON notifications;
DROP POLICY IF EXISTS "Notifications: delete own" ON notifications;

CREATE POLICY "Notifications: read own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Notifications: insert own" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Notifications: update own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Notifications: delete own" ON notifications FOR DELETE USING (auth.uid() = user_id);
