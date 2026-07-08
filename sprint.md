# Sprint 3 - Import Export Excel

**Sprint:** 3

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 3 hari

**Tujuan Sprint**

Membangun fitur Import dan Export Excel pada modul Customer sehingga pengguna dapat mengunduh data customer ke Excel dan mengimport data customer dari file Excel secara massal.

---

# Sprint Goal

Pada akhir sprint:

* User dapat export data customer ke file Excel (.xlsx).
* User dapat import data customer dari file Excel (.xlsx).
* User dapat download template Excel untuk import.
* Validasi data saat import berfungsi.
* Error handling jika data tidak valid.

---

# Product Backlog yang Masuk Sprint

## Epic - Import Export Excel

### US-010

Sebagai Sales, saya dapat mengexport data customer ke Excel.

Acceptance Criteria:

* Tombol Export tersedia di halaman Customer List.
* Data yang diexport sesuai filter yang aktif (search + status).
* File .xlsx berhasil didownload.
* Kolom sesuai dengan data customer.

Story Point:

3

---

### US-011

Sebagai Sales, saya dapat mengimport data customer dari Excel.

Acceptance Criteria:

* Tombol Import tersedia di halaman Customer List.
* Dialog upload file muncul.
* File .xlsx dan .xls diterima.
* Validasi data: nama wajib, status valid, pipeline valid.
* Preview jumlah data valid dan error sebelum import.
* Data berhasil masuk ke database.
* Notifikasi hasil import (berhasil/gagal).

Story Point:

5

---

### US-012

Sebagai Sales, saya dapat download template Excel untuk import.

Acceptance Criteria:

* Tombol Download Template tersedia di dialog Import.
* Template berisi header yang benar.
* Template berisi contoh data.
* File .xlsx berhasil didownload.

Story Point:

2

---

# Task Breakdown

## Install Library

* Install package `xlsx` untuk handling Excel

## Utility

* Buat `src/lib/excel.ts` dengan fungsi:
  * `exportCustomersToExcel()` - export data ke blob
  * `downloadTemplate()` - generate template
  * `parseImportExcel()` - parse & validasi file Excel

## Components

* Buat `ImportCustomersDialog` - dialog untuk import

## Integration

* Update halaman Customer List:
  * Tambah tombol Export
  * Tambah tombol Import
  * Integrasi ImportCustomersDialog

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Build berhasil.
* Export Excel berfungsi.
* Import Excel berfungsi.
* Template download berfungsi.
* Validasi import berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* `src/lib/excel.ts` - utility Excel
* `src/components/import-customers-dialog.tsx` - komponen import
* Update `src/app/(dashboard)/customers/page.tsx` - tombol import/export
* Package `xlsx` terinstall

---

# Sprint 4 - Reports Export PDF & Excel

**Sprint:** 4

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Menambahkan fitur Export PDF dan Export Excel pada halaman Reports sehingga pengguna dapat mengunduh laporan dalam format PDF dan Excel.

---

# Sprint Goal

Pada akhir sprint:

* User dapat export laporan ke PDF melalui browser print.
* User dapat export laporan ke Excel (.xlsx).
* Print styles berfungsi (sidebar & navbar tersembunyi).
* File Excel berisi 4 sheet: Ringkasan, Revenue, Customer, Aktivitas.

---

# Product Backlog yang Masuk Sprint

## Epic - Reports Export

### US-013

Sebagai Manager, saya dapat mengexport laporan ke PDF.

Acceptance Criteria:

* Tombol "Export PDF" tersedia di halaman Reports.
* Klik tombol -> browser print dialog muncul.
* Sidebar dan navbar tidak tercetak.
* Charts dan data tercetak dengan benar.

Story Point:

3

---

### US-014

Sebagai Manager, saya dapat mengexport laporan ke Excel.

Acceptance Criteria:

* Tombol "Export Excel" tersedia di halaman Reports.
* File .xlsx berhasil didownload.
* Berisi sheet Ringkasan (summary stats).
* Berisi sheet Revenue Bulanan.
* Berisi sheet Customer by Status.
* Berisi sheet Aktivitas per Tipe.

Story Point:

3

---

# Task Breakdown

## Utility

* Buat `src/lib/export-reports.ts` dengan fungsi:
  * `exportReportToExcel()` - export 4 sheet ke blob
  * `exportReportToPDF()` - trigger browser print

## Print Styles

* Tambah CSS `@media print` di `globals.css`
* Sembunyikan sidebar & navbar saat print
* Tambah class `no-print` di Sidebar dan Navbar

## Integration

* Update halaman Reports:
  * Tambah tombol Export Excel
  * Tambah tombol Export PDF
  * Import utility functions

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Export PDF berfungsi.
* Export Excel berfungsi.
* Print styles berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* `src/lib/export-reports.ts` - utility export reports
* Update `src/app/(dashboard)/reports/page.tsx` - tombol export
* Update `src/app/globals.css` - print styles
* Update `src/components/sidebar.tsx` - no-print class
* Update `src/components/navbar.tsx` - no-print class

---

# Sprint 5 - Forgot & Reset Password

**Sprint:** 5

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Membangun fitur Lupa Password dan Reset Password sehingga pengguna dapat mengatur ulang password mereka melalui email.

---

# Sprint Goal

Pada akhir sprint:

* User dapat klik "Lupa Password?" di halaman login.
* User menerima email reset password dari Supabase.
* User dapat membuat password baru setelah klik link di email.
* Password berhasil diubah dan user dapat login dengan password baru.

---

# Product Backlog yang Masuk Sprint

## Epic - Authentication

### US-015

Sebagai pengguna, saya dapat melakukan reset password jika lupa password.

Acceptance Criteria:

* Link "Lupa Password?" tersedia di halaman Login.
* Halaman Forgot Password menampilkan form input email.
* Setelah submit, muncul notifikasi email telah dikirim.
* Email berisi link reset password.
* Halaman Reset Password menampilkan form password baru.
* Password berhasil diubah.
* User dialihkan ke halaman Login.

Story Point:

5

---

# Task Breakdown

## Login Page

* Tambah link "Lupa Password?" di bawah form login

## Forgot Password Page

* Buat halaman `/forgot-password`
* Form input email
* Kirim reset password email via Supabase
* Tampilkan success message

## Reset Password Page

* Buat halaman `/reset-password`
* Validasi token dari URL
* Form input password baru + konfirmasi
* Update password via Supabase
* Redirect ke login setelah berhasil

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Link "Lupa Password?" berfungsi.
* Email reset password terkirim.
* Reset password berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* Update `src/app/(auth)/login/page.tsx` - link forgot password
* `src/app/(auth)/forgot-password/page.tsx` - halaman forgot password
* `src/app/(auth)/reset-password/page.tsx` - halaman reset password

---

# Sprint 6 - Quotation PDF Export

**Sprint:** 6

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Menambahkan fitur Print/Export PDF pada Quotation sehingga pengguna dapat mencetak atau menyimpan penawaran harga dalam format PDF.

---

# Sprint Goal

Pada akhir sprint:

* Tombol "Print PDF" tersedia di detail quotation.
* Klik tombol -> browser print dialog muncul.
* Quotation tercetak dengan format profesional.
* Header perusahaan, customer info, items, totals tersedia.
* Ruang tanda tangan tersedia.

---

# Product Backlog yang Masuk Sprint

## Epic - Quotation Export

### US-016

Sebagai Sales, saya dapat mencetak quotation ke PDF.

Acceptance Criteria:

* Tombol "Print PDF" tersedia di dialog detail quotation.
* Klik tombol -> browser print dialog muncul.
* Format quotation profesional: header, customer info, items table, totals.
* Sidebar dan navbar tidak tercetak.
* Ruang tanda tangan tersedia.

Story Point:

5

---

# Task Breakdown

## Components

* Buat `src/components/quotation-print.tsx`:
  * Komponen printable quotation
  * Header perusahaan
  * Info customer
  * Tabel items
  * Totals (subtotal, tax, diskon, total)
  * Catatan
  * Ruang tanda tangan
  * Fungsi `printQuotation()` untuk trigger print

## Integration

* Update halaman Quotations:
  * Import QuotationPrint component
  * Tambah tombol "Print PDF" di detail dialog
  * Sembunyikan komponen saat normal, tampilkan saat print

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Tombol Print PDF berfungsi.
* Format quotation profesional.
* Print styles berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* `src/components/quotation-print.tsx` - komponen printable quotation
* Update `src/app/(dashboard)/quotations/page.tsx` - tombol Print PDF

---

# Sprint 7 - Customer Detail Enhancement & Dashboard KPI Real Data

**Sprint:** 7

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Meng-enhance halaman Customer Detail dengan Timeline aktivitas dan memastikan Dashboard menggunakan data real dari database.

---

# Sprint Goal

Pada akhir sprint:

* Customer Detail menampilkan info lengkap (company, email, phone, whatsapp, kota, website, alamat, status, pipeline).
* Activity Timeline dengan 8 tipe aktivitas (Call, WhatsApp, Email, Meeting, Visit, Demo, Proposal, Closing).
* User dapat menambah aktivitas baru dari Customer Detail.
* Follow-up CRUD berfungsi (create, edit, delete, status change).
* Dashboard menampilkan data real dari Supabase.

---

# Status

**ALREADY DONE** - Fitur ini sudah terbangun di Sprint sebelumnya.

---

# Fitur yang Sudah Ada

## Customer Detail

* Info customer lengkap
* Status & Pipeline badges
* Tabs: Aktivitas & Follow-up

## Activity Timeline

* 8 tipe: Call, WhatsApp, Email, Meeting, Visit, Demo, Proposal, Closing
* Icon & warna berbeda per tipe
* Tanggal & user pembuat
* Catatan aktivitas

## Add Activity Form

* Pilih tipe aktivitas
* Input catatan
* Simpan ke database

## Follow-up CRUD

* Tambah follow-up baru
* Edit follow-up
* Hapus follow-up
* Ubah status (Pending/Done/Cancelled)

## Dashboard KPI Real Data

* Total Customer
* Customer Baru (bulan ini)
* Revenue (dari approved quotations)
* Deal Won & Lost
* Follow-up Hari Ini & Overdue
* Pipeline Value
* Revenue Bulanan chart
* Deals Bulanan chart

---

# Deliverables (Sudah Ada)

* `src/app/(dashboard)/customers/[id]/page.tsx` - Customer Detail
* `src/components/activity-timeline.tsx` - Timeline aktivitas
* `src/components/add-activity-form.tsx` - Form tambah aktivitas
* `src/components/followup-list.tsx` - Follow-up CRUD
* `src/app/(dashboard)/dashboard/page.tsx` - Dashboard real data
* `src/components/dashboard-charts.tsx` - Dashboard charts

---

# Sprint 8 - Email Notification

**Sprint:** 8

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 3 hari

**Tujuan Sprint**

Membangun sistem notifikasi dalam aplikasi sehingga pengguna mendapat pemberitahuan saat ada aktivitas penting seperti quotation baru dan follow-up reminder.

---

# Sprint Goal

Pada akhir sprint:

* Notification bell tersedia di navbar.
* Notifikasi real-time saat ada quotation baru.
* Notifikasi muncul saat follow-up overdue.
* User dapat melihat daftar notifikasi.
* User dapat tandai notifikasi sebagai sudah dibaca.

---

# Product Backlog yang Masuk Sprint

## Epic - Notification System

### US-017

Sebagai pengguna, saya dapat melihat notifikasi di navbar.

Acceptance Criteria:

* Icon bell di navbar dengan badge jumlah unread.
* Klik bell -> dropdown notifikasi muncul.
* Notifikasi terbaru di atas.
* Klik notifikasi -> tandai sudah dibaca.
* Tombol "Tandai semua dibaca".

Story Point:

5

---

### US-018

Sebagai pengguna, saya mendapat notifikasi saat quotation baru dibuat.

Acceptance Criteria:

* Saat buat quotation -> notifikasi otomatis dibuat.
* Judul: "Quotation Baru".
* Pesan: "Quotation [nomor] untuk [customer] telah dibuat".

Story Point:

3

---

# Task Breakdown

## Database

* Buat migration `migration_sprint8.sql`:
  * Tabel notifications
  * Index user_id, read
  * RLS policies

## Utility

* Buat `src/lib/notifications.ts`:
  * createNotification()
  * getUserNotifications()
  * markNotificationRead()
  * markAllNotificationsRead()
  * getUnreadCount()

## Components

* Buat `src/components/notification-bell.tsx`:
  * Icon bell dengan badge
  * Dropdown notifikasi
  * Real-time subscription
  * Mark as read

## Integration

* Update navbar: tambah NotificationBell
* Update quotation page: kirim notifikasi saat buat quotation

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Notification bell berfungsi.
* Notifikasi quotation baru berfungsi.
* Real-time updates berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* `supabase/migration_sprint8.sql` - tabel notifications
* `src/lib/notifications.ts` - notification utility
* `src/components/notification-bell.tsx` - komponen bell
* Update `src/components/navbar.tsx` - tambah bell
* Update `src/app/(dashboard)/quotations/page.tsx` - kirim notifikasi

---

# Sprint 9 - Customer Export PDF

**Sprint:** 9

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Menambahkan fitur Print/Export PDF pada halaman Customer Detail sehingga pengguna dapat mencetak atau menyimpan data customer lengkap dalam format PDF.

---

# Sprint Goal

Pada akhir sprint:

* Tombol "Print PDF" tersedia di halaman Customer Detail.
* Klik tombol -> browser print dialog muncul.
* Data customer lengkap tercetak: info, aktivitas, follow-up.
* Sidebar dan navbar tidak tercetak.

---

# Product Backlog yang Masuk Sprint

## Epic - Customer Export

### US-019

Sebagai Sales, saya dapat mencetak detail customer ke PDF.

Acceptance Criteria:

* Tombol "Print PDF" tersedia di halaman Customer Detail.
* Klik tombol -> browser print dialog muncul.
* Format profesional: header, info customer, tabel aktivitas, tabel follow-up.
* Sidebar dan navbar tidak tercetak.

Story Point:

3

---

# Task Breakdown

## Components

* Buat `src/components/customer-print.tsx`:
  * Komponen printable customer detail
  * Header perusahaan & customer name
  * Info customer lengkap (12 field)
  * Tabel riwayat aktivitas
  * Tabel follow-up
  * Fungsi `printCustomer()` untuk trigger print

## Integration

* Update halaman Customer Detail:
  * Import CustomerPrint component
  * Tambah tombol "Print PDF"
  * Sembunyikan komponen saat normal, tampilkan saat print

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Tombol Print PDF berfungsi.
* Format customer detail profesional.
* Print styles berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* `src/components/customer-print.tsx` - komponen printable customer
* Update `src/app/(dashboard)/customers/[id]/page.tsx` - tombol Print PDF

---

# Sprint 10 - WhatsApp API Integration

**Sprint:** 10

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Durasi:** 3 hari

**Tujuan Sprint**

Mengintegrasikan WhatsApp ke dalam CRM sehingga pengguna dapat mengirim pesan WhatsApp langsung dari halaman Customer Detail.

---

# Sprint Goal

Pada akhir sprint:

* Tombol "WhatsApp" tersedia di halaman Customer Detail.
* Klik tombol -> dialog kirim pesan muncul.
* Pilih template pesan (sapaan, follow-up, quotation, pengingat).
* Kirim pesan -> buka WhatsApp Web dengan pesan siap kirim.
* Pesan otomatis tercatat di Activity Timeline.

---

# Product Backlog yang Masuk Sprint

## Epic - WhatsApp Integration

### US-020

Sebagai Sales, saya dapat mengirim pesan WhatsApp dari Customer Detail.

Acceptance Criteria:

* Tombol "WhatsApp" tersedia di Customer Detail.
* Dialog menampilkan form pesan dengan template.
* Template: Sapaan, Follow-up, Quotation, Pengingat.
* Kirim pesan -> buka WhatsApp Web.
* Pesan tercatat di Activity Timeline.

Story Point:

8

---

# Task Breakdown

## Utility

* Buat `src/lib/whatsapp.ts`:
  * `formatPhoneForWhatsApp()` - format nomor HP
  * `sendWhatsAppMessage()` - buka WhatsApp Web
  * `sendWhatsAppAPI()` - kirim via API (opsional)
  * `messageTemplates` - template pesan

## Components

* Buat `src/components/whatsapp-button.tsx`:
  * Tombol WhatsApp
  * Dialog kirim pesan
  * Pilih template
  * Form input pesan

## Integration

* Update halaman Customer Detail:
  * Import WhatsAppButton
  * Tambah tombol WhatsApp

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Tombol WhatsApp berfungsi.
* Template pesan berfungsi.
* WhatsApp Web terbuka dengan benar.
* Tidak ada error kritis.

---

# Deliverables

* `src/lib/whatsapp.ts` - utility WhatsApp
* `src/components/whatsapp-button.tsx` - komponen WhatsApp
* Update `src/app/(dashboard)/customers/[id]/page.tsx` - tambah tombol WhatsApp
