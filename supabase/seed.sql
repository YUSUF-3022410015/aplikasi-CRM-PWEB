-- ============================================
-- SEED DATA untuk CRM Application
-- ============================================
-- Cara pakai: jalankan langsung di Supabase SQL Editor
-- (tidak perlu ganti ID manual lagi)
-- ============================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Ambil user admin pertama, atau user pertama sebagai fallback
  SELECT id INTO v_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM profiles ORDER BY created_at ASC LIMIT 1;
  END IF;

  -- Pastikan ada user reference
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Tidak ada user di tabel profiles. Buat user dulu via halaman Users.';
  END IF;

  -- ============================================
  -- 1. CUSTOMERS (20 data sample)
  -- ============================================
  INSERT INTO customers (id, name, company, email, phone, whatsapp, industry, city, address, website, source, status, pipeline_stage, assigned_to, created_at) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Budi Santoso', 'PT Tech Indonesia', 'budi@techindonesia.com', '081234567890', '081234567890', 'Technology', 'Jakarta', 'Jl. Sudirman No. 100', 'www.techindonesia.com', 'Website', 'active', 'proposal', v_user_id, NOW() - INTERVAL '60 days'),
  ('c0000001-0000-0000-0000-000000000002', 'Siti Rahayu', 'CV Digital Solusi', 'siti@digitalsolusi.co.id', '081234567891', '081234567891', 'Technology', 'Bandung', 'Jl. Asia Afrika No. 50', 'www.digitalsolusi.co.id', 'Referral', 'active', 'negotiation', v_user_id, NOW() - INTERVAL '55 days'),
  ('c0000001-0000-0000-0000-000000000003', 'Ahmad Fauzi', 'PT Cloud Nusantara', 'ahmad@cloudnusantara.id', '081234567892', '081234567892', 'Technology', 'Surabaya', 'Jl. Pemuda No. 25', 'www.cloudnusantara.id', 'LinkedIn', 'lead', 'lead', v_user_id, NOW() - INTERVAL '45 days'),
  ('c0000001-0000-0000-0000-000000000004', 'Dewi Lestari', 'PT Data Maju', 'dewi@datamaju.com', '081234567893', '081234567893', 'Technology', 'Jakarta', 'Jl. Gatot Subroto No. 30', 'www.datamaju.com', 'Google Ads', 'prospect', 'qualified', v_user_id, NOW() - INTERVAL '40 days'),
  ('c0000001-0000-0000-0000-000000000005', 'Rizki Pratama', 'Startup Digital', 'rizki@startupdigital.io', '081234567894', '081234567894', 'Technology', 'Yogyakarta', 'Jl. Malioboro No. 10', 'www.startupdigital.io', 'Event', 'active', 'contacted', v_user_id, NOW() - INTERVAL '35 days'),
  ('c0000001-0000-0000-0000-000000000006', 'Hendra Wijaya', 'PT Manufacturing Jaya', 'hendra@mfgjaya.co.id', '081234567895', '081234567895', 'Manufacturing', 'Semarang', 'Jl. Industri No. 100', 'www.mfgjaya.co.id', 'Cold Call', 'active', 'meeting', v_user_id, NOW() - INTERVAL '30 days'),
  ('c0000001-0000-0000-0000-000000000007', 'Putri Anggraini', 'CV Produksi Mandiri', 'putri@produksimandiri.com', '081234567896', '081234567896', 'Manufacturing', 'Medan', 'Jl. Pabrik No. 20', 'www.produksimandiri.com', 'Website', 'lead', 'lead', v_user_id, NOW() - INTERVAL '25 days'),
  ('c0000001-0000-0000-0000-000000000008', 'Agus Setiawan', 'PT Fabrika Utama', 'agus@fabrikautama.id', '081234567897', '081234567897', 'Manufacturing', 'Surabaya', 'Jl. Rungkut No. 50', 'www.fabrikautama.id', 'Referral', 'prospect', 'proposal', v_user_id, NOW() - INTERVAL '20 days'),
  ('c0000001-0000-0000-0000-000000000009', 'Maya Sari', 'PT Retail Modern', 'maya@retailmodern.co.id', '081234567898', '081234567898', 'Retail', 'Jakarta', 'Jl. Thamrin No. 45', 'www.retailmodern.co.id', 'Facebook', 'active', 'won', v_user_id, NOW() - INTERVAL '15 days'),
  ('c0000001-0000-0000-0000-000000000010', 'Andi Kurniawan', 'Toko Bangunan Jaya', 'andi@tokobangunan.com', '081234567899', '081234567899', 'Retail', 'Bandung', 'Jl. Dago No. 75', 'www.tokobangunan.com', 'Walk-in', 'inactive', 'lost', v_user_id, NOW() - INTERVAL '10 days'),
  ('c0000001-0000-0000-0000-000000000011', 'Dr. Sari Dewi', 'Klinik Sehat Selalu', 'sari@kliniksehat.co.id', '081234567900', '081234567900', 'Healthcare', 'Jakarta', 'Jl. Kesehatan No. 15', 'www.kliniksehat.co.id', 'Google Ads', 'active', 'qualified', v_user_id, NOW() - INTERVAL '50 days'),
  ('c0000001-0000-0000-0000-000000000012', 'Bambang Hermanto', 'RS Medika Utama', 'bambang@rsmedika.co.id', '081234567901', '081234567901', 'Healthcare', 'Surabaya', 'Jl. Dharmawangsa No. 30', 'www.rsmedika.co.id', 'Referral', 'lead', 'lead', v_user_id, NOW() - INTERVAL '48 days'),
  ('c0000001-0000-0000-0000-000000000013', 'Prof. Dr. Hadi', 'Universitas Nusantara', 'hadi@uninusantara.ac.id', '081234567902', '081234567902', 'Education', 'Yogyakarta', 'Jl. Kampus No. 1', 'www.uninusantara.ac.id', 'Event', 'active', 'contacted', v_user_id, NOW() - INTERVAL '52 days'),
  ('c0000001-0000-0000-0000-000000000014', 'Rina Susanti', 'SMA Nusantara', 'rina@smanusantara.sch.id', '081234567903', '081234567903', 'Education', 'Bandung', 'Jl. Pendidikan No. 25', 'www.smanusantara.sch.id', 'Cold Call', 'prospect', 'meeting', v_user_id, NOW() - INTERVAL '38 days'),
  ('c0000001-0000-0000-0000-000000000015', 'Indra Lesmana', 'PT Finance Sejahtera', 'indra@financesejahtera.co.id', '081234567904', '081234567904', 'Finance', 'Jakarta', 'Jl. Sudirman No. 200', 'www.financesejahtera.co.id', 'LinkedIn', 'active', 'negotiation', v_user_id, NOW() - INTERVAL '42 days'),
  ('c0000001-0000-0000-0000-000000000016', 'Linda Hartono', 'Bank Digital Indonesia', 'linda@bankdigital.co.id', '081234567905', '081234567905', 'Finance', 'Surabaya', 'Jl. Basuki Rahmat No. 40', 'www.bankdigital.co.id', 'Website', 'lead', 'lead', v_user_id, NOW() - INTERVAL '28 days'),
  ('c0000001-0000-0000-0000-000000000017', 'Hadi Purnomo', 'PT Properti Bersama', 'hadi@propertibersama.com', '081234567906', '081234567906', 'Real Estate', 'Jakarta', 'Jl. TB Simatupang No. 88', 'www.propertibersama.com', 'Google Ads', 'active', 'proposal', v_user_id, NOW() - INTERVAL '33 days'),
  ('c0000001-0000-0000-0000-000000000018', 'Eka Putri', 'Griya Indah Property', 'eka@griyaindah.co.id', '081234567907', '081234567907', 'Real Estate', 'Bandung', 'Jl. Buah Batu No. 55', 'www.griyaindah.co.id', 'Referral', 'archived', 'lost', v_user_id, NOW() - INTERVAL '65 days'),
  ('c0000001-0000-0000-0000-000000000019', 'Rudi Hartono', 'PT Mobil Sejahtera', 'rudi@mobilsejahtera.co.id', '081234567908', '081234567908', 'Automotive', 'Surabaya', 'Jl. Ahmad Yani No. 120', 'www.mobilsejahtera.co.id', 'Walk-in', 'active', 'qualified', v_user_id, NOW() - INTERVAL '18 days'),
  ('c0000001-0000-0000-0000-000000000020', 'Yanti Sari', 'Bengkel Maju Jaya', 'yanti@bengkelmaju.com', '081234567909', '081234567909', 'Automotive', 'Medan', 'Jl. Pahlawan No. 35', 'www.bengkelmaju.com', 'Event', 'inactive', 'lead', v_user_id, NOW() - INTERVAL '58 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 2. ACTIVITIES (18 data sample)
  -- ============================================
  INSERT INTO activities (id, customer_id, user_id, type, note, created_at) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', v_user_id, 'call', 'Telepon pertama, Budi tertarik dengan produk kami', NOW() - INTERVAL '58 days'),
  ('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', v_user_id, 'meeting', 'Meeting di kantor PT Tech Indonesia, presentasi produk', NOW() - INTERVAL '55 days'),
  ('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', v_user_id, 'proposal', 'Kirim proposal via email, menunggu feedback', NOW() - INTERVAL '50 days'),
  ('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', v_user_id, 'whatsapp', 'Siti minta katalog produk via WhatsApp', NOW() - INTERVAL '53 days'),
  ('a0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002', v_user_id, 'demo', 'Demo produk di kantor CV Digital Solusi', NOW() - INTERVAL '48 days'),
  ('a0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000003', v_user_id, 'email', 'Follow up via email, belum ada respon', NOW() - INTERVAL '43 days'),
  ('a0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000004', v_user_id, 'call', 'Dewi tertarik, minta penawaran harga', NOW() - INTERVAL '38 days'),
  ('a0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000004', v_user_id, 'visit', 'Kunjungan ke kantor Data Maju', NOW() - INTERVAL '35 days'),
  ('a0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000005', v_user_id, 'meeting', 'Meeting dengan founder Startup Digital', NOW() - INTERVAL '33 days'),
  ('a0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000006', v_user_id, 'call', 'Hendra butuh solusi untuk pabriknya', NOW() - INTERVAL '28 days'),
  ('a0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000006', v_user_id, 'demo', 'Demo di pabrik Manufacturing Jaya', NOW() - INTERVAL '25 days'),
  ('a0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000009', v_user_id, 'closing', 'Deal ditandatangani, kontrak 1 tahun', NOW() - INTERVAL '14 days'),
  ('a0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000011', v_user_id, 'call', 'Dr. Sari konsultasi kebutuhan klinik', NOW() - INTERVAL '48 days'),
  ('a0000001-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000011', v_user_id, 'whatsapp', 'Follow up via WhatsApp', NOW() - INTERVAL '45 days'),
  ('a0000001-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000015', v_user_id, 'meeting', 'Meeting dengan direktur Finance Sejahtera', NOW() - INTERVAL '40 days'),
  ('a0000001-0000-0000-0000-000000000016', 'c0000001-0000-0000-0000-000000000015', v_user_id, 'proposal', 'Kirim proposal customized', NOW() - INTERVAL '37 days'),
  ('a0000001-0000-0000-0000-000000000017', 'c0000001-0000-0000-0000-000000000017', v_user_id, 'email', 'Email brochure produk', NOW() - INTERVAL '31 days'),
  ('a0000001-0000-0000-0000-000000000018', 'c0000001-0000-0000-0000-000000000017', v_user_id, 'visit', 'Kunjungan ke lokasi proyek', NOW() - INTERVAL '28 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 3. FOLLOW-UPS (12 data sample)
  -- ============================================
  INSERT INTO followups (id, customer_id, assigned_to, due_date, reminder, status, note, created_at) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', v_user_id, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '1 day', 'pending', 'Follow up proposal PT Tech Indonesia - Budi minta revisi proposal', NOW() - INTERVAL '5 days'),
  ('f0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', v_user_id, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'pending', 'Kirim penawaran harga CV Digital Solusi - Siti sudah oke dengan demo', NOW() - INTERVAL '4 days'),
  ('f0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000004', v_user_id, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE, 'pending', 'Follow up kunjungan PT Data Maju - Dewi minta waktu 1 minggu', NOW() - INTERVAL '3 days'),
  ('f0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000006', v_user_id, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '3 days', 'pending', 'Negosiasi kontrak PT Manufacturing Jaya - Hendra minta diskon khusus', NOW() - INTERVAL '2 days'),
  ('f0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000003', v_user_id, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '3 days', 'pending', 'Follow up Cloud Nusantara - Ahmad belum merespon email', NOW() - INTERVAL '10 days'),
  ('f0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000016', v_user_id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '2 days', 'pending', 'Follow up Bank Digital Indonesia - Linda minta waktu telepon', NOW() - INTERVAL '8 days'),
  ('f0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000012', v_user_id, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '6 days', 'pending', 'Follow up RS Medika Utama - Bambang belum ada kabar', NOW() - INTERVAL '12 days'),
  ('f0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000009', v_user_id, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE - INTERVAL '15 days', 'done', 'Closing kontrak Retail Modern - Deal berhasil ditandatangani', NOW() - INTERVAL '20 days'),
  ('f0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000015', v_user_id, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '8 days', 'done', 'Follow up Finance Sejahtera - Indra setuju dengan penawaran', NOW() - INTERVAL '15 days'),
  ('f0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000019', v_user_id, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '11 days', 'done', 'Demo produk untuk Mobil Sejahtera - Demo berhasil, Rudi puas', NOW() - INTERVAL '18 days'),
  ('f0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000010', v_user_id, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '21 days', 'cancelled', 'Follow up Toko Bangunan Jaya - Andi sudah tidak tertarik', NOW() - INTERVAL '25 days'),
  ('f0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000018', v_user_id, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '31 days', 'cancelled', 'Follow up Griya Indah Property - Eka pindah perusahaan', NOW() - INTERVAL '35 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 4. PRODUCTS (10 data sample)
  -- ============================================
  INSERT INTO products (id, sku, name, category, price, description, status, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'SKU-001', 'CRM Basic Plan', 'Software', 500000, 'Paket CRM dasar untuk bisnis kecil', 'active', NOW() - INTERVAL '90 days'),
  ('10000000-0000-0000-0000-000000000002', 'SKU-002', 'CRM Pro Plan', 'Software', 1500000, 'Paket CRM profesional dengan fitur lengkap', 'active', NOW() - INTERVAL '90 days'),
  ('10000000-0000-0000-0000-000000000003', 'SKU-003', 'CRM Enterprise', 'Software', 5000000, 'Paket CRM untuk perusahaan besar', 'active', NOW() - INTERVAL '90 days'),
  ('10000000-0000-0000-0000-000000000004', 'SKU-004', 'Training CRM 1 Hari', 'Service', 2500000, 'Pelatihan penggunaan CRM selama 1 hari', 'active', NOW() - INTERVAL '85 days'),
  ('10000000-0000-0000-0000-000000000005', 'SKU-005', 'Training CRM 3 Hari', 'Service', 6000000, 'Pelatihan intensif CRM selama 3 hari', 'active', NOW() - INTERVAL '85 days'),
  ('10000000-0000-0000-0000-000000000006', 'SKU-006', 'Custom Integration', 'Service', 10000000, 'Integrasi CRM dengan sistem existing', 'active', NOW() - INTERVAL '80 days'),
  ('10000000-0000-0000-0000-000000000007', 'SKU-007', 'Data Migration', 'Service', 3000000, 'Migrasi data dari sistem lama', 'active', NOW() - INTERVAL '80 days'),
  ('10000000-0000-0000-0000-000000000008', 'SKU-008', 'Premium Support', 'Service', 2000000, 'Dukungan teknis prioritas 24/7', 'active', NOW() - INTERVAL '75 days'),
  ('10000000-0000-0000-0000-000000000009', 'SKU-009', 'CRM Mobile App', 'Software', 750000, 'Aplikasi mobile untuk CRM', 'active', NOW() - INTERVAL '70 days'),
  ('10000000-0000-0000-0000-000000000010', 'SKU-010', 'CRM Basic Plan (Legacy)', 'Software', 300000, 'Paket CRM dasar versi lama', 'inactive', NOW() - INTERVAL '120 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 5. DEALS (8 data sample) — untuk Pipeline
  -- ============================================
  INSERT INTO deals (id, customer_id, name, value, pipeline_stage, status, assigned_to, created_at) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'CRM Pro - Tech Indonesia', 1500000, 'proposal', 'active', v_user_id, NOW() - INTERVAL '55 days'),
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'Enterprise + Training - Digital Solusi', 5000000, 'negotiation', 'active', v_user_id, NOW() - INTERVAL '50 days'),
  ('d0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000003', 'Cloud Nusantara - Paket Basic', 500000, 'lead', 'active', v_user_id, NOW() - INTERVAL '45 days'),
  ('d0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000004', 'Data Maju - CRM Pro', 1500000, 'qualified', 'active', v_user_id, NOW() - INTERVAL '38 days'),
  ('d0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000005', 'Startup Digital - Basic Plan', 500000, 'contacted', 'active', v_user_id, NOW() - INTERVAL '33 days'),
  ('d0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000006', 'Manufacturing Jaya - Custom Integration', 10000000, 'meeting', 'active', v_user_id, NOW() - INTERVAL '28 days'),
  ('d0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000009', 'Retail Modern - Basic Plan', 500000, 'won', 'won', v_user_id, NOW() - INTERVAL '14 days'),
  ('d0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000010', 'Toko Bangunan - Basic Plan', 500000, 'lost', 'lost', v_user_id, NOW() - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 6. QUOTATIONS (8 data sample)
  -- ============================================
  INSERT INTO quotations (id, customer_id, quotation_number, subtotal, tax, discount, total, status, notes, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Q-2026-001', 1500000, 165000, 0, 1665000, 'sent', 'Penawaran CRM Pro Plan untuk PT Tech Indonesia', NOW() - INTERVAL '48 days'),
  ('20000000-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'Q-2026-002', 5000000, 550000, 500000, 5050000, 'approved', 'Paket Enterprise + Training untuk CV Digital Solusi', NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000004', 'Q-2026-003', 1500000, 165000, 0, 1665000, 'draft', 'Penawaran CRM Pro untuk PT Data Maju', NOW() - INTERVAL '33 days'),
  ('20000000-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000006', 'Q-2026-004', 10000000, 1100000, 1000000, 10100000, 'sent', 'Custom Integration untuk PT Manufacturing Jaya', NOW() - INTERVAL '23 days'),
  ('20000000-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000009', 'Q-2026-005', 500000, 55000, 0, 555000, 'approved', 'CRM Basic Plan untuk PT Retail Modern', NOW() - INTERVAL '18 days'),
  ('20000000-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000015', 'Q-2026-006', 1500000, 165000, 165000, 1500000, 'sent', 'CRM Pro + Premium Support untuk Finance Sejahtera', NOW() - INTERVAL '35 days'),
  ('20000000-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000017', 'Q-2026-007', 5000000, 550000, 500000, 5050000, 'expired', 'Paket Enterprise untuk Properti Bersama', NOW() - INTERVAL '60 days'),
  ('20000000-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000010', 'Q-2026-008', 500000, 55000, 0, 555000, 'rejected', 'CRM Basic untuk Toko Bangunan - ditolak', NOW() - INTERVAL '12 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- 7. QUOTATION ITEMS
  -- ============================================
  INSERT INTO quotation_items (id, quotation_id, product_id, qty, price) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 1500000),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1, 5000000),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 1, 1500000),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', 1, 10000000),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 1, 500000),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 1, 1500000),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 1, 5000000),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 1, 500000)
  ON CONFLICT (id) DO NOTHING;

END $$;
