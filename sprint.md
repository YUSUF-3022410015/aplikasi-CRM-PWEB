# Sprint 1 - Project Foundation

**Sprint:** 1

**Tanggal Mulai:** Selasa, 7 Juli 2026, 21.00 WIB

**Durasi:** 5 hari

**Tujuan Sprint**

Membangun fondasi aplikasi CRM sehingga dapat diakses melalui Vercel, terhubung ke Supabase, memiliki autentikasi, layout dashboard, dan modul Customer CRUD dasar.

---

# Sprint Goal

Pada akhir sprint:

* Aplikasi berhasil di-deploy ke Vercel.
* Login menggunakan Supabase Auth berfungsi.
* Dashboard dapat diakses setelah login.
* CRUD Customer berjalan.
* Database dan Row Level Security (RLS) sudah dikonfigurasi.
* Repository GitHub siap untuk pengembangan berikutnya.

---

# Product Backlog yang Masuk Sprint

## Epic 1 - Project Setup

### US-001

Sebagai developer, saya ingin membuat repository GitHub agar source code dapat dikelola.

Acceptance Criteria:

* Repository dibuat.
* Branch `main` tersedia.
* Branch `develop` tersedia.
* `.gitignore` dikonfigurasi.

Priority:

High

Story Point:

2

---

### US-002

Sebagai developer, saya ingin membuat project Next.js agar aplikasi dapat dijalankan.

Acceptance Criteria:

* Next.js App Router.
* TypeScript aktif.
* Tailwind CSS aktif.
* ESLint aktif.
* Struktur folder dibuat.

Priority:

High

Story Point:

3

---

### US-003

Sebagai developer, saya ingin menghubungkan aplikasi ke Supabase.

Acceptance Criteria:

* Environment Variable dibuat.
* Client Supabase dapat digunakan.
* Koneksi berhasil.

Priority:

High

Story Point:

2

---

## Epic 2 - Authentication

### US-004

Sebagai pengguna, saya dapat login menggunakan email dan password.

Acceptance Criteria:

* Login berhasil.
* Logout berhasil.
* Session tersimpan.
* Route terlindungi.

Priority:

High

Story Point:

5

---

### US-005

Sebagai Admin, saya dapat melihat Dashboard setelah login.

Acceptance Criteria:

* Dashboard muncul.
* Sidebar tampil.
* Header tampil.
* Nama pengguna tampil.

Story Point:

3

---

## Epic 3 - Customer

### US-006

Sebagai Sales, saya dapat melihat daftar customer.

Acceptance Criteria:

* Tabel customer tampil.
* Pagination.
* Search.
* Filter status.

Story Point:

5

---

### US-007

Sebagai Sales, saya dapat menambahkan customer.

Acceptance Criteria:

* Form validasi.
* Data tersimpan.
* Notifikasi sukses.

Story Point:

5

---

### US-008

Sebagai Sales, saya dapat mengubah data customer.

Acceptance Criteria:

* Form edit.
* Update berhasil.

Story Point:

3

---

### US-009

Sebagai Sales, saya dapat menghapus customer.

Acceptance Criteria:

* Dialog konfirmasi.
* Soft delete.

Story Point:

3

---

# Task Breakdown

## Setup

* Membuat repository GitHub
* Membuat project Next.js
* Install Tailwind
* Install shadcn/ui
* Install Supabase SDK
* Install React Hook Form
* Install Zod
* Install TanStack Table
* Install Recharts
* Konfigurasi environment
* Deploy ke Vercel

---

## Database

Tabel:

* profiles
* customers

Konfigurasi:

* Foreign Key
* Index
* RLS
* Trigger update timestamp

---

## Authentication

* Login
* Logout
* Middleware
* Protected Route

---

## Dashboard

* Sidebar
* Navbar
* Breadcrumb
* Dashboard Layout

---

## Customer Module

Halaman:

* Customer List
* Add Customer
* Edit Customer
* Detail Customer

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Build berhasil.
* Deploy Vercel berhasil.
* Login berfungsi.
* CRUD Customer berjalan.
* Tidak ada error kritis.
* Kode telah di-review.
* Branch `develop` telah digabung ke `main`.

---

# Deliverables

* Repository GitHub
* Project Next.js
* Project Supabase
* Deployment Vercel
* Modul Login
* Dashboard
* Customer CRUD
* Dokumentasi README
