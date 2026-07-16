# Sprint 3 - Import Export Excel

**Sprint:** 3

**Tanggal Mulai:** Rabu, 8 Juli 2026

**Tanggal Selesai:** Jumat, 11 Juli 2026

**Durasi:** 4 hari

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

**Tanggal Mulai:** Senin, 14 Juli 2026

**Tanggal Selesai:** Selasa, 15 Juli 2026

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

**Tanggal Mulai:** Rabu, 16 Juli 2026

**Tanggal Selesai:** Kamis, 17 Juli 2026

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

**Tanggal Mulai:** Jumat, 18 Juli 2026

**Tanggal Selesai:** Senin, 21 Juli 2026

**Durasi:** 4 hari

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

**Tanggal Mulai:** Selasa, 22 Juli 2026

**Tanggal Selesai:** Rabu, 23 Juli 2026

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

**Tanggal Mulai:** Kamis, 24 Juli 2026

**Tanggal Selesai:** Senin, 28 Juli 2026

**Durasi:** 5 hari

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

**Tanggal Mulai:** Rabu, 30 Juli 2026

**Tanggal Selesai:** Kamis, 31 Juli 2026

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

**Tanggal Mulai:** Senin, 3 Agustus 2026

**Tanggal Selesai:** Rabu, 5 Agustus 2026

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

---

# Sprint 11 - Email Automation

**Sprint:** 11

**Tanggal Mulai:** Kamis, 6 Agustus 2026

**Tanggal Selesai:** Senin, 10 Agustus 2026

**Durasi:** 3 hari

**Tujuan Sprint**

Membangun sistem email otomatis sehingga pengguna dapat mengirim email penawaran (quotation) dan pengingat follow-up langsung dari CRM.

---

# Sprint Goal

Pada akhir sprint:

* Tombol "Send Email" tersedia di detail quotation.
* Klik tombol -> email penawaran terkirim ke customer.
* Email template profesional untuk quotation.
* Email template untuk pengingat follow-up.
* Activity log otomatis setelah email terkirim.

---

# Product Backlog yang Masuk Sprint

## Epic - Email Automation

### US-021

Sebagai Sales, saya dapat mengirim email penawaran dari quotation.

Acceptance Criteria:

* Tombol "Send Email" tersedia di dialog detail quotation.
* Klik tombol -> email terkirim ke customer.
* Email berisi: nomor quotation, daftar item, total, catatan.
* Activity log otomatis dicatat.

Story Point:

5

---

### US-022

Sebagai Manager, saya dapat mengirim email pengingat follow-up.

Acceptance Criteria:

* Fungsi kirim email pengingat tersedia.
* Email berisi: nama customer, jatuh tempo, catatan.
* Dapat dikirim manual dari follow-up page.

Story Point:

3

---

# Task Breakdown

## Utility

* Buat `src/lib/email.ts`:
  * `sendEmail()` - kirim email via Resend API
  * `emailTemplates` - template quotation, follow-up, welcome
  * Helper functions untuk setiap jenis email

## Server Actions

* Buat `src/app/actions/email.ts`:
  * `sendQuotationEmailAction()` - kirim email quotation
  * `sendFollowUpReminderAction()` - kirim email follow-up

## Integration

* Update halaman Quotations:
  * Import sendQuotationEmailAction
  * Tambah tombol "Send Email" di detail dialog

## Configuration

* Update `.env.local` dengan Resend API key

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Tombol Send Email berfungsi.
* Email template profesional.
* Activity log tercatat.
* Tidak ada error kritis.

---

# Deliverables

* `src/lib/email.ts` - utility email
* `src/app/actions/email.ts` - server actions
* Update `src/app/(dashboard)/quotations/page.tsx` - tombol Send Email
* Update `.env.local` - Resend API config

---

# Sprint 12 - Calendar View

**Sprint:** 12

**Tanggal Mulai:** Selasa, 11 Agustus 2026

**Tanggal Selesai:** Kamis, 13 Agustus 2026

**Durasi:** 3 hari

**Tujuan Sprint**

Membangun halaman Kalender sehingga pengguna dapat melihat jadwal follow-up dan meetings dalam tampilan bulanan yang interaktif.

---

# Sprint Goal

Pada akhir sprint:

* Halaman Calendar tersedia di sidebar.
* Tampilan bulanan dengan semua follow-up.
* Klik tanggal -> lihat detail follow-up.
* Indikator follow-up pending (warna orange).
* Indikator follow-up done (warna hijau).
* Navigasi bulan sebelumnya/selanjutnya.

---

# Product Backlog yang Masuk Sprint

## Epic - Calendar

### US-023

Sebagai Sales, saya dapat melihat jadwal follow-up di kalender.

Acceptance Criteria:

* Halaman Calendar tersedia di sidebar.
* Tampilan bulanan dengan hari-hari.
* Follow-up tampil di tanggal yang sesuai.
* Klik tanggal -> dialog detail follow-up.
* Navigasi bulan sebelumnya/selanjutnya.

Story Point:

5

---

# Task Breakdown

## Components

* Buat `src/components/calendar-view.tsx`:
  * Calendar grid (7 kolom x 5-6 baris)
  * Header bulan & tahun
  * Navigasi bulan (prev/next)
  * Indikator follow-up per tanggal
  * Dialog detail saat klik tanggal

## Pages

* Buat `src/app/(dashboard)/calendar/page.tsx`:
  * Fetch follow-ups dari Supabase
  * Render CalendarView component

## Navigation

* Update sidebar: tambah link Calendar

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Halaman Calendar berfungsi.
* Follow-up tampil di kalender.
* Navigasi bulan berfungsi.
* Dialog detail berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* `src/components/calendar-view.tsx` - komponen kalender
* `src/app/(dashboard)/calendar/page.tsx` - halaman kalender
* Update `src/components/sidebar.tsx` - tambah link Calendar

---

# Sprint 13 - Enhanced Dashboard

**Sprint:** 13

**Tanggal Mulai:** Jumat, 14 Agustus 2026

**Tanggal Selesai:** Sabtu, 15 Agustus 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Meng-enhance Dashboard dengan charts lebih detail dan data tambahan untuk analisis performa bisnis.

---

# Sprint Goal

Pada akhir sprint:

* Dashboard menampilkan 3 charts: Revenue, Deals, Activities.
* Chart Aktivitas per Tipe (Pie Chart).
* Chart Customer per Status (Pie Chart).
* Data real dari database.

---

# Product Backlog yang Masuk Sprint

## Epic - Dashboard Enhancement

### US-024

Sebagai Manager, saya dapat melihat charts lebih detail di dashboard.

Acceptance Criteria:

* Chart Revenue Bulanan (Bar Chart).
* Chart Deals Bulanan (Line Chart).
* Chart Aktivitas per Tipe (Pie Chart).
* Chart Customer per Status (Pie Chart).
* Semua data real dari database.

Story Point:

3

---

# Task Breakdown

## Components

* Update `src/components/dashboard-charts.tsx`:
  * Tambah prop `activitiesByType`
  * Tambah prop `customersByStatus`
  * Tambah Pie Chart untuk activities
  * Tambah Pie Chart untuk customers

## Pages

* Update `src/app/(dashboard)/dashboard/page.tsx`:
  * Hitung activitiesByType
  * Hitung customersByStatus
  * Pass data ke DashboardCharts

---

# Definition of Done

Sprint dinyatakan selesai jika:

* 4 charts berfungsi.
* Data real dari database.
* Tidak ada error kritis.

---

# Deliverables

* Update `src/components/dashboard-charts.tsx` - tambah charts
* Update `src/app/(dashboard)/dashboard/page.tsx` - tambah data

---

# Sprint 14 - User Management Pro

**Sprint:** 14

**Tanggal Mulai:** Senin, 18 Agustus 2026

**Tanggal Selesai:** Selasa, 19 Agustus 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Meng-enhance halaman User Management sehingga Admin dan Manager dapat mengelola user. Manager terbatas hanya untuk user dengan role Sales & Manager, tidak bisa mengubah/menghapus Admin.

---

# Sprint Goal

Pada akhir sprint:

* Admin dapat mengedit role user (admin/manager/sales).
* Admin dapat menghapus user (semua role).
* Manager dapat mengedit role user (sales/manager saja, tidak bisa admin).
* Manager dapat menghapus user (hanya role sales/manager).
* Dialog konfirmasi untuk hapus user.
* Loading state untuk setiap aksi.

---

# Product Backlog yang Masuk Sprint

## Epic - User Management

### US-025

Sebagai Admin & Manager, saya dapat mengedit role user.

Acceptance Criteria:

* Tombol Edit tersedia di tabel user.
* Dialog edit role muncul.
* Admin: pilih role admin, manager, sales.
* Manager: pilih role manager atau sales saja (admin tidak muncul).
* Role tersimpan ke database.

Story Point:

3

---

### US-026

Sebagai Admin & Manager, saya dapat menghapus user.

Acceptance Criteria:

* Tombol Hapus tersedia di tabel user.
* Dialog konfirmasi muncul.
* Admin: dapat hapus semua role.
* Manager: hanya dapat hapus user dengan role sales/manager (admin tidak bisa dihapus).
* User terhapus dari profiles.
* Loading state saat menghapus.

Story Point:

3

---

# Task Breakdown

## Pages

* Update `src/app/(dashboard)/users/page.tsx`:
  * Tambah state edit & delete
  * Tambah fungsi handleEditRole & handleDeleteUser
  * Tambah pengecekan role: jika manager, filter opsi role & target user
  * Tambah tombol Edit & Hapus di tabel (sembunyikan untuk admin jika user adalah manager)
  * Tambah Edit Role Dialog
  * Tambah Delete User AlertDialog

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Edit role berfungsi (dengan batasan role masing-masing).
* Hapus user berfungsi (dengan batasan role masing-masing).
* Dialog konfirmasi berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* Update `src/app/(dashboard)/users/page.tsx` - edit role & hapus user

---

# Sprint 15 - Settings Enhancement

**Sprint:** 15

**Tanggal Mulai:** Rabu, 20 Agustus 2026

**Tanggal Selesai:** Kamis, 21 Agustus 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Meng-enhance halaman Settings dengan logo upload, pilihan mata uang/timezone, dan email template.

---

# Sprint Goal

Pada akhir sprint:

* Settings menggunakan tab navigation (Company, General, Email).
* Logo perusahaan dapat diupload (via URL).
* Pilihan mata uang dengan dropdown.
* Pilihan timezone dengan dropdown.
* Email template untuk quotation dan follow-up.

---

# Product Backlog yang Masuk Sprint

## Epic - Settings

### US-027

Sebagai Admin, saya dapat mengatur profil perusahaan.

Acceptance Criteria:

* Tab Company Profile.
* Input logo URL dengan preview.
* Input nama, email, telepon, website, alamat, kota, negara.

Story Point:

3

---

### US-028

Sebagai Admin, saya dapat mengatur mata uang dan timezone.

Acceptance Criteria:

* Tab Pengaturan Umum.
* Dropdown mata uang (IDR, USD, SGD, MYR).
* Dropdown timezone (Asia/Jakarta, etc).

Story Point:

2

---

### US-029

Sebagai Admin, saya dapat mengatur email template.

Acceptance Criteria:

* Tab Email Template.
* Input subject dan body untuk quotation.
* Input subject dan body untuk follow-up.
* Support variabel: {customer}, {number}, {total}.

Story Point:

3

---

# Task Breakdown

## Pages

* Update `src/app/(dashboard)/settings/page.tsx`:
  * Tambah Tabs navigation
  * Tambah logo URL input dengan preview
  * Tambah dropdown mata uang
  * Tambah dropdown timezone
  * Tambah email template settings

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Tab navigation berfungsi.
* Logo preview berfungsi.
* Dropdown mata uang & timezone berfungsi.
* Email template tersimpan.
* Tidak ada error kritis.

---

# Deliverables

* Update `src/app/(dashboard)/settings/page.tsx` - enhanced settings

---

# Sprint 16 - Activity Log Center

**Sprint:** 16

**Tanggal Mulai:** Jumat, 22 Agustus 2026

**Tanggal Selesai:** Senin, 25 Agustus 2026

**Durasi:** 2 hari

**Tujuan Sprint**

Membangun halaman Activity Log yang menampilkan semua aktivitas dari semua modul dalam satu tempat.

---

# Sprint Goal

Pada akhir sprint:

* Halaman Activity Log tersedia di sidebar.
* Menampilkan semua aktivitas: customer, quotation, follow-up, notification.
* Filter berdasarkan module.
* Sorting by date (terbaru di atas).

---

# Product Backlog yang Masuk Sprint

## Epic - Activity Log

### US-030

Sebagai Manager, saya dapat melihat semua aktivitas dalam satu halaman.

Acceptance Criteria:

* Halaman Activity Log tersedia di sidebar.
* Menampilkan activities, quotations, follow-ups, notifications.
* Setiap item menampilkan: icon, tipe, deskripsi, module, tanggal.
* Sorting by date (terbaru di atas).

Story Point:

5

---

# Task Breakdown

## Components

* Buat `src/components/activity-log-list.tsx`:
  * Komponen list activity log
  * Icon & warna per tipe
  * Badge untuk module
  * Format tanggal

## Pages

* Buat `src/app/(dashboard)/activity-log/page.tsx`:
  * Fetch activities, quotations, follow-ups, notifications
  * Gabungkan & sort by date
  * Render ActivityLogList

## Navigation

* Update sidebar: tambah link Activity Log

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Halaman Activity Log berfungsi.
* Semua aktivitas tampil.
* Sorting berfungsi.
* Tidak ada error kritis.

---

# Deliverables

* `src/components/activity-log-list.tsx` - komponen activity log
* `src/app/(dashboard)/activity-log/page.tsx` - halaman activity log
* Update `src/components/sidebar.tsx` - tambah link Activity Log

---

# RBAC - Role-Based Access Control

**Feature:** Role-Based Access Control

**Tanggal:** 8 Juli 2026

**Tujuan**

Membatasi akses fitur berdasarkan role pengguna (Admin, Manager, Sales).

---

# Role Definitions

## Administrator
- Akses penuh ke semua fitur
- Kelola user (invite, edit role, delete)
- Kelola pengaturan sistem
- Lihat semua data dan laporan

## Manager
- Lihat semua data customer
- Lihat semua laporan
- Edit customer dan follow-up
- Kelola product dan quotation
- Akses activity log
- Kelola user dengan role Sales & Manager (tidak bisa mengubah/menghapus Admin)

## Sales (Karyawan)
- Kelola customer sendiri
- Buat dan edit aktivitas
- Buat dan edit follow-up
- Buat quotation
- Kirim WhatsApp dan email

---

# Permission Matrix

| Fitur | Admin | Manager | Sales |
|-------|-------|---------|-------|
| Customer View All | ✅ | ✅ | ❌ |
| Customer View Own | ✅ | ✅ | ✅ |
| Customer Create | ✅ | ✅ | ✅ |
| Customer Edit | ✅ | ✅ | ❌ |
| Customer Delete | ✅ | ❌ | ❌ |
| Customer Import | ✅ | ✅ | ❌ |
| Activity View All | ✅ | ✅ | ❌ |
| Activity Create | ✅ | ✅ | ✅ |
| Follow-up View All | ✅ | ✅ | ❌ |
| Follow-up Create | ✅ | ✅ | ✅ |
| Product View | ✅ | ✅ | ✅ |
| Product Create/Edit | ✅ | ✅ | ❌ |
| Quotation View All | ✅ | ✅ | ❌ |
| Quotation Create | ✅ | ✅ | ✅ |
| Report View | ✅ | ✅ | ❌ |
| User Management | ✅ | ✅* | ❌ |
| Settings | ✅ | ❌ | ❌ |
| Activity Log | ✅ | ✅ | ❌ |

---

\* Manager hanya dapat mengelola user dengan role Sales & Manager, tidak dapat mengubah/menghapus user dengan role Admin.

# Task Breakdown

## Utility

* Buat `src/lib/permissions.ts`:
  * Permission definitions per module
  * `hasPermission()` function
  * `getAccessibleRoutes()` function
  * Role display names & descriptions

## Hooks

* Buat `src/hooks/use-permissions.ts`:
  * Fetch user profile & role
  * `checkPermission()` function
  * `canAccess()` function
  * Role flags (isAdmin, isManager, isSales)

## Components

* Update `src/components/sidebar.tsx`:
  * Fetch user role
  * Filter nav items by accessible routes

* Update `src/components/navbar.tsx`:
  * Tampilkan role badge di dropdown

* Update `src/app/(auth)/signup/page.tsx`:
  * Tambah role selector (Sales/Manager/Admin)
  * Deskripsi per role

## Pages

* Buat `src/app/(dashboard)/unauthorized/page.tsx`:
  * Halaman akses ditolak
  * Link kembali ke dashboard

---

# Deliverables

* `src/lib/permissions.ts` - RBAC utility
* `src/hooks/use-permissions.ts` - permissions hook
* `src/app/(dashboard)/unauthorized/page.tsx` - unauthorized page
* Update `src/components/sidebar.tsx` - filter by role
* Update `src/components/navbar.tsx` - role badge
* Update `src/app/(auth)/signup/page.tsx` - role selection
