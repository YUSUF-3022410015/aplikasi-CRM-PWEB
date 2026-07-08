-- ============================================
-- CRM Database Schema
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Profiles (terhubung ke auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fullname TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'manager', 'sales')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers
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
  assigned_to UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'active', 'inactive', 'archived')),
  pipeline_stage TEXT NOT NULL DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'qualified', 'contacted', 'meeting', 'proposal', 'negotiation', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('call', 'whatsapp', 'meeting', 'email', 'visit', 'demo', 'proposal', 'closing')),
  note TEXT,
  attachment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Follow-ups
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

-- 5. Products
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

-- 6. Quotations
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quotation Items
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  qty NUMERIC DEFAULT 1,
  price NUMERIC DEFAULT 0
);

-- 8. Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
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

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_assigned ON customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_pipeline ON customers(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_activities_customer ON activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_followups_customer ON followups(customer_id);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(due_date);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles: user bisa baca semua, update sendiri
CREATE POLICY "Profiles: read all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles: update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Customers: semua authenticated user bisa CRUD
CREATE POLICY "Customers: read" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Customers: insert" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Customers: update" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Customers: delete" ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- Activities
CREATE POLICY "Activities: read" ON activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Activities: insert" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Activities: update" ON activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Activities: delete" ON activities FOR DELETE USING (auth.role() = 'authenticated');

-- Follow-ups
CREATE POLICY "Followups: read" ON followups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Followups: insert" ON followups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Followups: update" ON followups FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Followups: delete" ON followups FOR DELETE USING (auth.role() = 'authenticated');

-- Products
CREATE POLICY "Products: read" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Products: insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Products: update" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Products: delete" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Quotations
CREATE POLICY "Quotations: read" ON quotations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Quotations: insert" ON quotations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Quotations: update" ON quotations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Quotations: delete" ON quotations FOR DELETE USING (auth.role() = 'authenticated');

-- Quotation Items
CREATE POLICY "Quotation Items: read" ON quotation_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Quotation Items: insert" ON quotation_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Quotation Items: update" ON quotation_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Quotation Items: delete" ON quotation_items FOR DELETE USING (auth.role() = 'authenticated');

-- Settings
CREATE POLICY "Settings: read" ON settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Settings: insert" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Settings: update" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
