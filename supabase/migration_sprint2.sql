-- ============================================
-- Sprint 2 Migration
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Tambah kolom pipeline_stage ke customers
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT NOT NULL DEFAULT 'lead'
CHECK (pipeline_stage IN ('lead', 'qualified', 'contacted', 'meeting', 'proposal', 'negotiation', 'won', 'lost'));

-- 2. Index untuk pipeline
CREATE INDEX IF NOT EXISTS idx_customers_pipeline ON customers(pipeline_stage);

-- 3. Tambah kolom description ke products (kalau belum ada)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Tambah kolom notes ke quotations (kalau belum ada)
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS notes TEXT;
