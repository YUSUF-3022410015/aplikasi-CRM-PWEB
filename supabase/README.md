# Seed Data Instructions

## Cara Mengisi Data ke Aplikasi

### 1. Buat Akun Terlebih Dahulu

Buka aplikasi dan daftar 3 akun:
- **Admin**: admin@company.com
- **Manager**: manager@company.com  
- **Sales**: sales@company.com

### 2. Ambil User IDs

Setelah daftar, buka **Supabase Dashboard** > **SQL Editor** dan jalankan:

```sql
SELECT id, email, role FROM auth.users;
```

Copy UUID untuk setiap user.

### 3. Update Seed Data

Buka file `supabase/seed.sql` dan ganti:
- `00000000-0000-0000-0000-000000000001` dengan UUID user asli

### 4. Jalankan Seed Data

Buka **Supabase Dashboard** > **SQL Editor** dan paste seluruh isi `seed.sql`, lalu klik **Run**.

### 5. Data yang Tersedia

| Tabel | Jumlah | Keterangan |
|-------|--------|------------|
| customers | 20 | Berbagai industri & kota |
| activities | 18 | 8 tipe aktivitas |
| followups | 12 | Pending, done, cancelled |
| products | 10 | Software & service |
| quotations | 8 | Draft, sent, approved, rejected |
| quotation_items | 8 | Items per quotation |

### 6. Test Fitur

Setelah data terisi, test:
- **Dashboard**: Lihat KPI & charts
- **Customers**: Filter, search, export Excel
- **Pipeline**: Drag & drop customer
- **Quotations**: Buat & print PDF
- **Follow-ups**: Cek overdue & pending
- **Reports**: Export PDF & Excel
