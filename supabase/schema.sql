-- ============================================
-- CRM Database Schema - Sesuai PRD §3.2
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Profiles (terhubung ke auth.users)
-- PRD §3.2: id, name, email, role, is_active
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'manager', 'sales')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers - PRD §3.2: id, name, email, phone, owner_id
-- Soft delete sesuai PRD §3.4
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  industry TEXT,
  city TEXT,
  address TEXT,
  website TEXT,
  source TEXT,
  owner_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'active', 'inactive', 'archived')),
  assigned_to UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Deals - PRD §3.2: id, customer_id, name, value, pipeline_stage, status, assigned_to
-- Dipisah dari customers agar satu klien bisa banyak peluang penjualan
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  name TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  pipeline_stage TEXT NOT NULL DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'contacted', 'meeting', 'proposal', 'won', 'lost')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost')),
  assigned_to UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activities - PRD §3.2: id, customer_id, type, note, created_at
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'whatsapp', 'visit', 'demo', 'proposal', 'closing')),
  note TEXT,
  attachment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Follow-ups - PRD §3.2: id, customer_id, due_date, status, assigned_to
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  reminder TIMESTAMPTZ,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Products - PRD §3.2: id, name, price, description
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  quotation_number TEXT NOT NULL,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Quotation Items
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  qty NUMERIC DEFAULT 1,
  price NUMERIC DEFAULT 0
);

-- 9. Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Notifications (Sprint 8)
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

-- 11. Audit Logs - PRD §3.2: immutable, tidak boleh dihapus
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Auto-create profile saat user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, fullname, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'fullname', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'sales')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Audit Log Function
-- ============================================
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_assigned ON customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deals_customer ON deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_deals_deleted ON deals(deleted_at);
CREATE INDEX IF NOT EXISTS idx_activities_customer ON activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_followups_customer ON followups(customer_id);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);

-- ============================================
-- Row Level Security (RLS) — Sesuai PRD §3.3
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'sales');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles: user bisa baca semua
DROP POLICY IF EXISTS "Profiles: read all" ON profiles;
CREATE POLICY "Profiles: read all" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Profiles: update own" ON profiles;
CREATE POLICY "Profiles: update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Customers: soft delete, role-based access
DROP POLICY IF EXISTS "Customers: read" ON customers;
CREATE POLICY "Customers: read" ON customers FOR SELECT USING (
  auth.uid() IS NOT NULL AND deleted_at IS NULL AND (
    public.get_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
  )
);
DROP POLICY IF EXISTS "Customers: insert" ON customers;
CREATE POLICY "Customers: insert" ON customers FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
);
DROP POLICY IF EXISTS "Customers: update" ON customers;
CREATE POLICY "Customers: update" ON customers FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'sales' AND assigned_to = auth.uid())
  )
);
DROP POLICY IF EXISTS "Customers: delete" ON customers;
CREATE POLICY "Customers: delete" ON customers FOR DELETE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);

-- Deals: soft delete, role-based access
DROP POLICY IF EXISTS "Deals: read" ON deals;
CREATE POLICY "Deals: read" ON deals FOR SELECT USING (
  auth.uid() IS NOT NULL AND deleted_at IS NULL AND (
    public.get_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
  )
);
DROP POLICY IF EXISTS "Deals: insert" ON deals;
CREATE POLICY "Deals: insert" ON deals FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
);
DROP POLICY IF EXISTS "Deals: update" ON deals;
CREATE POLICY "Deals: update" ON deals FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'sales' AND assigned_to = auth.uid())
  )
);
DROP POLICY IF EXISTS "Deals: delete" ON deals;
CREATE POLICY "Deals: delete" ON deals FOR DELETE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);

-- Activities: role-based access
DROP POLICY IF EXISTS "Activities: read" ON activities;
CREATE POLICY "Activities: read" ON activities FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    public.get_user_role() IN ('admin', 'manager')
    OR user_id = auth.uid()
    OR customer_id IN (SELECT id FROM customers WHERE assigned_to = auth.uid())
  )
);
DROP POLICY IF EXISTS "Activities: insert" ON activities;
CREATE POLICY "Activities: insert" ON activities FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
);
DROP POLICY IF EXISTS "Activities: update" ON activities;
CREATE POLICY "Activities: update" ON activities FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    public.get_user_role() = 'admin'
    OR user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Activities: delete" ON activities;
CREATE POLICY "Activities: delete" ON activities FOR DELETE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);

-- Follow-ups: role-based access
DROP POLICY IF EXISTS "Followups: read" ON followups;
CREATE POLICY "Followups: read" ON followups FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    public.get_user_role() IN ('admin', 'manager')
    OR assigned_to = auth.uid()
  )
);
DROP POLICY IF EXISTS "Followups: insert" ON followups;
CREATE POLICY "Followups: insert" ON followups FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
);
DROP POLICY IF EXISTS "Followups: update" ON followups;
CREATE POLICY "Followups: update" ON followups FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    public.get_user_role() = 'admin'
    OR assigned_to = auth.uid()
  )
);
DROP POLICY IF EXISTS "Followups: delete" ON followups;
CREATE POLICY "Followups: delete" ON followups FOR DELETE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);

-- Products: role-based access
DROP POLICY IF EXISTS "Products: read" ON products;
CREATE POLICY "Products: read" ON products FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Products: insert" ON products;
CREATE POLICY "Products: insert" ON products FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);
DROP POLICY IF EXISTS "Products: update" ON products;
CREATE POLICY "Products: update" ON products FOR UPDATE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);
DROP POLICY IF EXISTS "Products: delete" ON products;
CREATE POLICY "Products: delete" ON products FOR DELETE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);

-- Quotations: role-based access
DROP POLICY IF EXISTS "Quotations: read" ON quotations;
CREATE POLICY "Quotations: read" ON quotations FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    public.get_user_role() IN ('admin', 'manager')
    OR customer_id IN (SELECT id FROM customers WHERE assigned_to = auth.uid())
  )
);
DROP POLICY IF EXISTS "Quotations: insert" ON quotations;
CREATE POLICY "Quotations: insert" ON quotations FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.get_user_role() IN ('admin', 'sales')
);
DROP POLICY IF EXISTS "Quotations: update" ON quotations;
CREATE POLICY "Quotations: update" ON quotations FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Quotations: delete" ON quotations;
CREATE POLICY "Quotations: delete" ON quotations FOR DELETE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);

-- Quotation Items
DROP POLICY IF EXISTS "Quotation Items: read" ON quotation_items;
CREATE POLICY "Quotation Items: read" ON quotation_items FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Quotation Items: insert" ON quotation_items;
CREATE POLICY "Quotation Items: insert" ON quotation_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Quotation Items: update" ON quotation_items;
CREATE POLICY "Quotation Items: update" ON quotation_items FOR UPDATE USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Quotation Items: delete" ON quotation_items;
CREATE POLICY "Quotation Items: delete" ON quotation_items FOR DELETE USING (auth.uid() IS NOT NULL);

-- Settings: Admin only for write
DROP POLICY IF EXISTS "Settings: read" ON settings;
CREATE POLICY "Settings: read" ON settings FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Settings: insert" ON settings;
CREATE POLICY "Settings: insert" ON settings FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);
DROP POLICY IF EXISTS "Settings: update" ON settings;
CREATE POLICY "Settings: update" ON settings FOR UPDATE USING (
  auth.uid() IS NOT NULL AND public.get_user_role() = 'admin'
);

-- Notifications: user only sees own
DROP POLICY IF EXISTS "Notifications: read own" ON notifications;
CREATE POLICY "Notifications: read own" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Notifications: insert" ON notifications;
CREATE POLICY "Notifications: insert" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Notifications: update own" ON notifications;
CREATE POLICY "Notifications: update own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Notifications: delete own" ON notifications;
CREATE POLICY "Notifications: delete own" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Audit Logs: immutable - hanya Admin bisa baca, semua bisa insert, TIDAK ADA delete
DROP POLICY IF EXISTS "Audit Logs: admin read" ON audit_logs;
CREATE POLICY "Audit Logs: admin read" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Audit Logs: insert" ON audit_logs;
CREATE POLICY "Audit Logs: insert" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- TIDAK ADA policy delete atau update!
