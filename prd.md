# Product Requirements Document (PRD)

# CRM Manajemen Pelanggan

**Versi:** 1.0

**Tanggal:** 7 Juli 2026

**Status:** Draft MVP

---

# 1. Executive Summary

CRM Manajemen Pelanggan adalah aplikasi berbasis web yang membantu perusahaan mengelola data pelanggan, aktivitas sales, proses follow-up, pipeline penjualan, hingga laporan performa dalam satu sistem terpusat.

Aplikasi dibangun menggunakan:

* Frontend : Next.js (App Router + TypeScript)
* UI : Tailwind CSS + shadcn/ui
* Database : Supabase PostgreSQL
* Authentication : Supabase Auth
* Storage : Supabase Storage
* Hosting : Vercel
* Version Control : GitHub

---

# 2. Latar Belakang

Banyak bisnis masih menyimpan data pelanggan pada Excel, WhatsApp, atau Google Sheets sehingga muncul masalah seperti:

* Data pelanggan tersebar
* Tidak ada histori komunikasi
* Follow-up sering terlambat
* Sulit memonitor performa sales
* Laporan dibuat manual
* Sulit mengetahui peluang closing

CRM ini bertujuan menjadi pusat pengelolaan pelanggan dan aktivitas penjualan.

---

# 3. Tujuan Produk

Menyediakan platform CRM yang:

* Mudah digunakan
* Responsif
* Aman
* Real-time
* Skalabel
* Siap dikembangkan menjadi SaaS

---

# 4. Target Pengguna

## Administrator

Tugas:

* Mengelola seluruh sistem
* Mengelola user
* Melihat seluruh data

Hak akses:

* Full Access

---

## Manager

Tugas:

* Monitoring tim sales
* Melihat dashboard
* Analisis penjualan

Hak akses:

* Read seluruh data
* Approval tertentu

---

## Sales

Tugas:

* Mengelola pelanggan
* Follow-up
* Membuat quotation

Hak akses:

* Data milik sendiri

---

# 5. Tujuan Bisnis

* Meningkatkan closing rate
* Mengurangi lost customer
* Mempercepat proses follow-up
* Mempermudah monitoring sales
* Otomatisasi laporan

---

# 6. Scope MVP

Modul:

* Authentication
* Dashboard
* Customer
* Activity
* Follow-up
* Pipeline
* Product
* Quotation
* User Management
* Reports
* Settings

---

# 7. User Flow

Login

↓

Dashboard

↓

Tambah Customer

↓

Tambah Aktivitas

↓

Jadwalkan Follow-up

↓

Update Pipeline

↓

Buat Quotation

↓

Deal

↓

Laporan

---

# 8. Functional Requirements

## Authentication

Fitur:

* Login
* Logout
* Forgot Password
* Reset Password
* Session Management

Role:

* Admin
* Manager
* Sales

---

## Dashboard

Widget:

* Total Customer
* Customer Baru
* Deal
* Lost
* Omzet
* Follow-up Hari Ini
* Reminder
* Grafik Penjualan
* Pipeline Summary

---

## Customer Module

Data:

* Nama
* Perusahaan
* Email
* Telepon
* WhatsApp
* Alamat
* Kota
* Industri
* Website
* Sumber Lead
* Assigned Sales
* Status

Fitur:

* CRUD
* Search
* Filter
* Sort
* Pagination
* Import Excel
* Export Excel

---

## Customer Timeline

Setiap customer memiliki histori.

Jenis aktivitas:

* Call
* WhatsApp
* Meeting
* Email
* Visit
* Demo
* Proposal
* Closing

Data:

* Tanggal
* User
* Catatan
* Attachment

---

## Follow-up

Fitur:

* Tambah jadwal
* Reminder
* Overdue
* Kalender
* Status

Status:

* Pending
* Done
* Cancel

---

## Sales Pipeline

Tahapan:

Lead

↓

Qualified

↓

Contacted

↓

Meeting

↓

Proposal

↓

Negotiation

↓

Won

↓

Lost

Fitur:

* Drag & Drop
* Filter
* Statistik

---

## Product

Field:

* SKU
* Nama
* Kategori
* Harga
* Deskripsi
* Status

---

## Quotation

Data:

* Nomor
* Customer
* Item
* Qty
* Harga
* Diskon
* Pajak
* Total

Output:

* PDF

---

## Reports

Laporan:

Customer

Sales

Activity

Follow-up

Deal

Lost

Revenue

Pipeline

Export:

* PDF
* Excel

---

## User Management

Role

Admin

Manager

Sales

Fitur:

* Invite User
* Disable User
* Reset Password

---

## Settings

* Company Profile
* Logo
* Currency
* Timezone
* Email Template

---

# 9. Non Functional Requirements

Performance

* Loading < 2 detik

Availability

* 99%

Security

* HTTPS
* JWT
* RLS
* Password Hash

Responsive

* Desktop
* Tablet
* Mobile

Accessibility

* WCAG Basic

---

# 10. Database

users

* id
* fullname
* email
* role

customers

* id
* name
* company
* email
* phone
* whatsapp
* industry
* city
* address
* website
* source
* assigned_to
* status
* created_at

activities

* id
* customer_id
* user_id
* type
* note
* attachment
* created_at

followups

* id
* customer_id
* assigned_to
* due_date
* reminder
* status

products

* id
* sku
* name
* category
* price

quotations

* id
* customer_id
* quotation_number
* subtotal
* tax
* discount
* total
* status

quotation_items

* id
* quotation_id
* product_id
* qty
* price

---

# 11. Dashboard KPI

Total Customer

Customer Baru

Pipeline Value

Revenue

Deal Rate

Lost Rate

Aktivitas Hari Ini

Follow-up Overdue

---

# 12. Halaman Aplikasi

* Login
* Forgot Password
* Dashboard
* Customer List
* Customer Detail
* Add Customer
* Edit Customer
* Activity Timeline
* Follow-up
* Pipeline
* Products
* Quotations
* Reports
* User Management
* Profile
* Settings

---

# 13. Teknologi

Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui

Backend

* Supabase
* PostgreSQL
* Edge Functions (opsional)

Authentication

* Supabase Auth

Storage

* Supabase Storage

Charts

* Recharts

Table

* TanStack Table

Form

* React Hook Form
* Zod

Deployment

* Vercel

Repository

* GitHub

---

# 14. Struktur Folder

app/
(auth)/
(dashboard)/

components/

features/

lib/

hooks/

services/

types/

utils/

supabase/

public/

---

# 15. Roadmap

Versi 1.0

* Login
* Dashboard
* Customer
* Activity
* Follow-up

Versi 1.1

* Pipeline
* Product
* Quotation

Versi 1.2

* Reports
* Import Excel
* Export PDF

Versi 2.0

* WhatsApp API
* Email Automation
* Notification
* Calendar

Versi 3.0

* Mobile App
* AI Assistant
* Forecast Revenue
* Customer Segmentation
* Multi Company (Multi Tenant)

---

# 16. Success Metrics

* Waktu pencarian customer < 3 detik
* 100% aktivitas pelanggan tercatat
* Tidak ada follow-up yang terlewat tanpa notifikasi
* Dashboard diperbarui secara real-time
* Laporan dapat dibuat dalam waktu kurang dari 5 detik

---

# 17. Future Integrations

* WhatsApp Business API
* Gmail
* Outlook
* Google Calendar
* Stripe
* Midtrans
* Xendit
* Slack
* Telegram Bot
* OpenAI API
* Google Maps
* Microsoft 365
