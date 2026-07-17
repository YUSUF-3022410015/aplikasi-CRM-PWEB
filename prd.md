# Dokumentasi Teknis Final — Aplikasi CRM Manajemen Pelanggan
**MVP Sprint 7 Hari**

**Repositori:** https://github.com/YUSUF-3022410015/aplikasi-CRM-PWEB.git

---

## 1. Product Requirements Document (PRD)

### 1.1 Ringkasan Produk
Aplikasi CRM (Customer Relationship Management) untuk membantu tim sales UKM mengelola prospek, pelanggan, dan proses penjualan dalam satu sistem terpusat — menggantikan pencatatan manual di Excel, WhatsApp, dan buku catatan.

### 1.2 Masalah yang Ingin Diselesaikan
Perusahaan skala kecil hingga menengah (UKM) umumnya mencatat data klien dan progres penjualan secara tersebar di berbagai tempat (Excel, WhatsApp, catatan manual). Akibatnya:
- Histori komunikasi dengan pelanggan hilang atau tidak terdokumentasi.
- *Follow-up* ke prospek sering terlambat atau terlewat.
- Manajemen kesulitan melacak konversi penjualan secara *real-time*.
- Tidak ada jejak audit ketika data pelanggan diubah atau dihapus.

### 1.3 Siapa yang Punya Masalah Ini?
| Persona | Masalah Spesifik |
|---|---|
| **Sales Representative** | Kewalahan mengatur jadwal *follow-up* manual, rentan kehilangan prospek karena tidak ada pengingat otomatis. |
| **Sales Manager** | Sulit memantau performa tim secara *real-time*, tidak punya visibilitas terhadap estimasi pendapatan dari *pipeline* yang berjalan. Peran Manager murni memantau — jika ada kesalahan, Manager menghubungi Sales terkait langsung, bukan mengubah data sendiri. |
| **Admin/Owner** | Butuh kontrol akses data (siapa boleh lihat data siapa) dan jejak audit untuk mitigasi risiko kehilangan data. |

### 1.4 Kenapa Mereka Mau Pakai Solusi Ini?
- **Satu pintu terpusat** — prospek, kontak, dan *pipeline* penjualan ada di satu sistem, tidak perlu buka banyak aplikasi.
- **Visualisasi Kanban *drag-and-drop*** membuat status setiap *deal* langsung terlihat tanpa perlu laporan manual.
- **Pengingat otomatis *follow-up*** mencegah prospek "dingin" karena lupa dihubungi.
- **Role-based access (RLS)** — Sales hanya melihat data miliknya, Manager punya visibilitas tim, sehingga data lebih aman dan relevan per pengguna.
- **Cepat diimplementasikan** — berbasis stack modern (Next.js + Supabase) sehingga bisa *live* dalam 7 hari, cocok untuk UKM yang butuh solusi cepat dan murah dibanding CRM enterprise.

### 1.5 Tujuan & Metrik Keberhasilan MVP
| Tujuan | Metrik |
|---|---|
| Sentralisasi data pelanggan | 100% data customer & deal tercatat di sistem, bukan lagi di Excel/WA |
| Mempercepat *follow-up* | Reminder *follow-up* tampil otomatis di sidebar, 0 keterlambatan akibat lupa |
| Visibilitas *pipeline* | Manager bisa melihat total nilai deal & win rate tanpa lapor manual |
| Keamanan data | RLS aktif — Sales tidak bisa mengakses data milik Sales lain |
| Performa | Dashboard & Pipeline dimuat < 2 detik |

### 1.6 Fitur Utama (Core)
1. **Sales Pipeline & Deals** — manajemen prospek dengan visualisasi Kanban (*drag-and-drop*) dari tahap *Lead* → *Contacted* → *Meeting* → *Won/Lost*.
2. **Manajemen Customer (Kontak)** — database terpusat profil perusahaan, kontak PIC, dan riwayat interaksi.
3. **Dashboard Analytics** — ringkasan performa *real-time*: total nilai *deals*, *win rate*, jumlah *new customers*.
4. **Authentication & Role Management** — akses aman dengan pemisahan *role* (Admin, Manager, Sales) memakai Supabase Auth + RLS. Mencakup:
   - **Login** — masuk dengan email & password, sesi berbasis JWT.
   - **User Provisioning (oleh Admin)** — akun baru dibuat oleh Admin (bukan pendaftaran mandiri/publik). User baru cukup login pakai kredensial yang sudah didaftarkan Admin; tidak ada halaman "Signup" yang bisa diakses publik.
   - **Logout** — mengakhiri sesi dan mengembalikan pengguna ke halaman login.

### 1.7 Fitur Pendukung
- Manajemen Aktivitas & Pengingat *Follow-up* (badge reminder di sidebar).
- Katalog Produk & Pembuatan *Quotation* (export PDF).
- Audit Trail — mencatat log aktivitas CRUD penting (siapa mengubah apa, kapan).

### 1.8 Di Luar Cakupan MVP (Out of Scope)
Agar target 7 hari realistis, hal-hal berikut **sengaja tidak** masuk MVP:
- Integrasi email/WhatsApp otomatis (kirim pesan langsung dari sistem).
- Notifikasi push/mobile app native.
- Laporan analitik lanjutan (forecasting, AI insight).
- Multi-currency & multi-language.
- Import/export massal dari Excel (bisa jadi fase 2).
- **Reset/lupa password mandiri** — untuk MVP, reset password ditangani manual oleh Admin (reset via Supabase dashboard); fitur "Lupa Password" self-service via email masuk fase 2.

### 1.9 Teknologi yang Digunakan
| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router + TypeScript) |
| UI Framework | Tailwind CSS + shadcn/ui |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Version Control | GitHub |

---

## 2. Software Requirements Specification (SRS)

### 2.1 Functional Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| **FR1a** | Sistem mengizinkan pengguna login dengan email & password, sesi berbasis JWT (Supabase Auth). | User dengan kredensial valid berhasil masuk dan diarahkan sesuai role; kredensial salah menampilkan pesan error. |
| **FR1b** | Admin dapat melakukan *user provisioning* — membuat akun baru dan menetapkan role-nya (Manager/Sales); tidak ada pendaftaran publik/self-signup. | Admin isi email + role di form "Tambah User" → akun baru langsung tersedia dengan role sesuai yang ditetapkan → user baru cukup login (tidak perlu mendaftar sendiri). |
| **FR1c** | Pengguna dapat logout, mengakhiri sesi aktif. | Klik "Logout" menghapus session/JWT dan mengarahkan ke halaman Login; halaman terproteksi tidak bisa diakses lagi setelahnya. |
| **FR2** | Pengguna dapat membuat *deal* baru, menetapkan nilai estimasi, dan memindahkannya antar kolom *pipeline*. | Deal baru tersimpan di DB dengan `pipeline_stage` default "Lead"; drag antar kolom meng-update `pipeline_stage` secara real-time. |
| **FR3** | Sistem menyediakan CRUD terpadu untuk entitas customer, dengan pencarian & filter. | Create/Read/Update/Delete customer berfungsi; pencarian nama/email mengembalikan hasil sesuai dalam < 1 detik. |
| **FR4** | Pengguna dapat mencatat interaksi (*call, meeting, email*) ke dalam timeline customer. | Aktivitas baru muncul di timeline customer terkait, terurut berdasarkan waktu terbaru. |
| **FR5** | Sistem menampilkan pengingat *follow-up* yang jatuh tempo. | Badge reminder muncul di sidebar jika ada follow-up dengan tanggal ≤ hari ini. |
| **FR6** | Sistem menghasilkan *quotation* dalam format PDF dari katalog produk. | User memilih produk → sistem generate PDF berisi daftar item, harga, dan total. |
| **FR7** | Sistem mencatat log audit untuk aksi create/update/delete pada data krusial (customer, deal). | Setiap perubahan tercatat di tabel `audit_logs` dengan user_id, aksi, timestamp, dan data lama/baru. |
| **FR8** | Sistem membatasi akses berdasarkan role (Admin, Manager, Sales). | Sales hanya melihat & mengelola (CRUD) customer/deal miliknya; Manager melihat data seluruh tim secara **read-only** (tanpa tombol edit/hapus) untuk keperluan pemantauan; Admin akses penuh + kelola user. |

### 2.2 Aturan Validasi Form (Zod)

| Form | Field | Aturan |
|---|---|---|
| Login | email | format email valid, wajib diisi |
| Login | password | minimal 6 karakter, wajib diisi |
| Tambah/Edit Customer | email | format email valid, unik (tidak boleh duplikat) |
| Tambah/Edit Customer | phone/WhatsApp | format angka, minimal 10 digit, unik |
| Tambah/Edit Customer | name | wajib diisi, minimal 3 karakter |
| Tambah Deal | value | angka, harus lebih besar dari 0 |
| Tambah Deal | name | wajib diisi |
| Tambah User (Admin) | email | format email valid, unik |
| Tambah User (Admin) | role | wajib pilih salah satu (admin/manager/sales) |
| Follow-up | due_date | wajib diisi, tidak boleh tanggal lampau |

### 2.3 Non-Functional Requirements
- **Keamanan:** Data dilindungi dengan *Row Level Security* (RLS) di Supabase — Sales hanya mengakses data kliennya sendiri, Manager punya akses baca tingkat tim, Admin akses penuh.
- **Performa:** Halaman Dashboard dan Pipeline dimuat dalam < 2 detik pada koneksi standar.
- **Ketersediaan:** Di-*hosting* di Vercel dengan target *uptime* 99%.
- **Usability:** Mengikuti heuristik Nielsen Norman Group (NN/G), khususnya visibilitas status sistem dan pencegahan kesalahan saat drag-and-drop.
- **Maintainability:** Kode terstruktur dengan TypeScript untuk type-safety, memudahkan pengembangan lanjutan pasca-MVP.

---

## 3. System Design Document (SDD)

### 3.1 Arsitektur Sistem
Arsitektur *Client-Server* berbasis *Serverless*:
- **Next.js App Router** menangani routing, rendering (Client & Server Components), dan logic UI.
- **Supabase** bertindak sebagai *Backend-as-a-Service* (BaaS) — menyediakan API langsung ke PostgreSQL, Auth, dan Storage tanpa perlu backend custom.
- **Vercel** meng-host frontend Next.js dengan CI/CD otomatis dari GitHub.

```
[Browser] → [Next.js App Router (Vercel)] → [Supabase API]
                                              ├─ PostgreSQL (data)
                                              ├─ Auth (login/session)
                                              └─ Storage (file/PDF)
```

### 3.2 Struktur Database Utama (PostgreSQL)

| Tabel | Deskripsi | Kolom Kunci |
|---|---|---|
| `profiles` | Data pengguna & role | id, name, email, role (admin/manager/sales), is_active (boolean, default true) |
| `customers` | Entitas perusahaan/klien | id, name, email, phone, owner_id (sales yang pegang) |
| `deals` | Peluang penjualan | id, customer_id, name, value, pipeline_stage, status, owner_id |
| `activities` | Catatan interaksi historis | id, customer_id, type (call/meeting/email), note, created_at |
| `followups` | Jadwal tindak lanjut | id, customer_id, due_date, status, assigned_to |
| `products` | Katalog produk untuk quotation | id, name, price, description |
| `audit_logs` | Log mitigasi risiko TI | id, user_id, action, table_name, old_data, new_data, timestamp |

> **Catatan desain:** `deals` dipisah dari `customers` agar satu klien bisa memiliki banyak peluang penjualan (proyek) sekaligus.

### 3.3 Role & Permission Matrix (RLS)

| Aksi | Admin | Manager | Sales |
|---|---|---|---|
| Lihat semua customer/deal | ✅ | ✅ (tim sendiri, read-only) | ❌ (hanya miliknya) |
| Tambah/edit customer & deal | ✅ | ❌ (hanya memantau, bukan mengedit) | ✅ (miliknya) |
| Hapus data (lihat rincian 3.4) | ✅ | ❌ | ❌ |
| Lihat dashboard tim | ✅ | ✅ | ❌ (dashboard pribadi) |
| Kelola user & role | ✅ | ❌ | ❌ |
| Lihat audit log | ✅ | ❌ | ❌ |

> **Catatan:** Manager berperan sebagai *pemantau* — jika menemukan kesalahan atau masalah pada data, Manager tidak mengubah data secara langsung, melainkan menghubungi Sales terkait untuk koordinasi. Karena itu, UI untuk Manager tidak menampilkan tombol tambah/edit/hapus pada data customer & deal, hanya tampilan (view-only) dan dashboard performa tim.

### 3.4 Rincian Kebijakan Hapus Data

| Entitas | Boleh dihapus? | Oleh siapa | Jenis Hapus |
|---|---|---|---|
| Customer | ✅ | Admin saja | **Soft delete** (`deleted_at`) — data disembunyikan dari tampilan, tapi tetap ada di DB agar bisa dipulihkan & histori audit tetap utuh |
| Deal | ✅ | Admin saja | **Soft delete** — sama alasannya dengan Customer |
| Activity | ✅ | Admin saja | Hard delete (risiko rendah) |
| Follow-up | ✅ | Admin saja | Hard delete |
| Product | ✅ | Admin saja | Hard delete |
| User account | ✅ (nonaktifkan, bukan hard delete) | Admin saja | **Nonaktifkan** (`is_active = false`) — user tidak bisa login lagi, tapi Customer/Deal miliknya tetap tersimpan & terhubung (read-only) ke user lama. Menghindari data "yatim" saat Sales resign tanpa perlu fitur reassign massal. |
| **Audit log** | ❌ **Tidak boleh dihapus siapa pun, termasuk Admin** | — | Bersifat *immutable* — prinsip dasar audit trail: kalau log bisa dihapus, fungsinya sebagai bukti jadi tidak berguna |

> **Keputusan cascade delete:** Jika sebuah Customer dihapus (soft delete), seluruh Deal dan Activity yang terkait dengannya **ikut disembunyikan secara otomatis** (cascade soft delete) — agar tidak ada data "menggantung" (orphan) yang tidak terhubung ke customer manapun. Data tetap tersimpan di database untuk keperluan audit, hanya tidak ditampilkan di UI.

---

## 4. UI/UX Flow

### 4.1 Prinsip Desain
Mengutamakan kejelasan navigasi dan efisiensi *data entry*, berlandaskan heuristik usability NN/G — khususnya **visibility of system status** dan **error prevention** (penting saat drag-and-drop di Kanban board).

### 4.2 User Journey
1. **Onboarding:** Login → sistem deteksi role → arahkan ke Dashboard sesuai role.
2. **Manajemen Leads:** Buka halaman *Customers* → klik "Tambah" → isi form modal (validasi mencegah duplikasi email/WhatsApp) → simpan.
3. **Proses Penjualan:** Buka halaman *Pipeline* → buat Deal baru, kaitkan dengan Customer → drag kartu Deal antar kolom tahap (mis. "Contacted" → "Meeting").
4. **Tindak Lanjut:** Buka profil Customer → tambah catatan di Timeline → buat jadwal Follow-up untuk minggu depan → badge reminder muncul otomatis saat jatuh tempo.

### 4.3 Wireframe Utama (Deskripsi Halaman)
| Halaman | Komponen Utama |
|---|---|
| **Login** | Form email/password, tombol login, pesan error validasi |
| **User Management** *(khusus Admin)* | Tabel daftar user, tombol "Tambah User" (email + pilih role), tidak ada form signup publik |
| **Dashboard** | Kartu KPI (total deal value, win rate, new customers), grafik revenue, tombol Logout di navbar/sidebar |
| **Customers** | Tabel dengan search & filter, tombol "Tambah Customer", aksi edit/hapus, *empty state* ("Belum ada customer, klik Tambah untuk mulai") saat data kosong |
| **Customer Detail** | Info profil, timeline aktivitas (empty state jika belum ada aktivitas), tombol tambah aktivitas & follow-up |
| **Pipeline** | Kanban board dengan kolom per stage, kartu deal draggable, empty state per kolom jika belum ada deal |
| **Quotation** | Pilih produk dari katalog → preview → generate PDF (library: `@react-pdf/renderer` atau `pdf-lib`) |
| **Sidebar** | Navigasi utama + badge reminder follow-up jatuh tempo |

---

## 5. Roadmap & Task Breakdown (Sprint 7 Hari)

| Hari | Fokus Area | Daftar Tugas |
|---|---|---|
| **Hari 1** | Inisiasi & Setup | Inisialisasi Next.js + Tailwind + shadcn/ui • Setup repo GitHub (README awal) • Setup project Supabase (DB, Auth, Storage) • Buat skema SQL (`profiles`, `customers`, `deals`) |
| **Hari 2** | Auth & Layout | Integrasi Supabase Auth (login & logout) • Halaman User Management untuk Admin membuat akun baru + set role (signup by-invite, bukan publik) • Proteksi routing via Middleware Next.js • Layout utama (Sidebar, Navbar) |
| **Hari 3** | Customer Module | UI tabel Customer (shadcn/ui) • Fitur tambah/edit Customer (validasi Zod) • Halaman Detail Customer + timeline dasar |
| **Hari 4** | Pipeline & Deals | UI Kanban board (drag-and-drop) • CRUD tabel `deals` • Update `pipeline_stage` real-time ke database |
| **Hari 5** | Activity & Follow-up | Form input riwayat aktivitas di profil customer • Fitur jadwal follow-up (tabel `followups`) • Badge reminder di sidebar |
| **Hari 6** | Dashboard & Keamanan | Grafik revenue & KPI di Dashboard • Terapkan RLS (Sales hanya lihat data sendiri) • QA manual: uji setiap FR (FR1-FR8) per role, uji validasi form, uji akses lintas-role (Sales tidak bisa lihat data Sales lain) • Perbaikan bug dari hasil QA |
| **Hari 7** | Finalisasi & Deploy | Rapikan kode & optimasi performa UI • Update README (instalasi, screenshot, kode penting) • Deploy ke Vercel • Uji coba versi live production |

### 5.1 Risiko & Mitigasi
| Risiko | Mitigasi |
|---|---|
| RLS salah konfigurasi → data bocor antar sales | Testing manual per role sebelum Hari 7, tulis test case akses data |
| Drag-and-drop Kanban lambat/buggy di data besar | Gunakan optimistic UI update + library drag-drop teruji (dnd-kit) |
| Waktu 7 hari mepet untuk fitur PDF quotation | Jadikan prioritas terakhir; jika waktu tidak cukup, geser ke fase 2 |
| Scope creep dari stakeholder | Rujuk ke bagian "Out of Scope" di PRD sebagai batasan resmi MVP |