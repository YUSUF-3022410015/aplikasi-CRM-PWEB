-- Fix RLS Policy for notifications table
-- Jalankan ini di Supabase SQL Editor

-- 1. Hapus policy lama jika ada
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- 2. Buat policy baru

-- Policy: Allow authenticated users to INSERT notifications for ANY user
CREATE POLICY "Allow insert notifications for all users"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Users can only VIEW their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can UPDATE (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can DELETE their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
