# CRM Manajemen Pelanggan

Sistem manajemen pelanggan (CRM) untuk mengelola data pelanggan, aktivitas sales, follow-up, pipeline penjualan, dan laporan performa dalam satu platform terpusat.

## Tech Stack

- **Frontend:** Next.js 16 (App Router + TypeScript)
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table

## Fitur

- **Authentication** - Login, Logout, Session Management
- **Dashboard** - KPI widgets, grafik revenue & deals
- **Customer** - CRUD, search, filter, pagination, detail timeline
- **Activities** - Log aktivitas komunikasi (call, WhatsApp, email, meeting, dll)
- **Follow-up** - Jadwal, reminder, status tracking
- **Pipeline** - Drag & drop Kanboard view
- **Products** - Manajemen produk & harga
- **Quotations** - Buat & kelola penawaran harga
- **Reports** - Laporan revenue, customer, aktivitas
- **User Management** - Invite user, role-based access
- **Settings** - Company profile, konfigurasi

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (database + auth)

### Installation

```bash
git clone https://github.com/YUSUF-3022410015/aplikasi-CRM-PWEB.git
cd aplikasi-CRM-PWEB
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Database Schema

Tables:
- `profiles` - User profiles (fullname, email, role)
- `customers` - Customer data
- `activities` - Communication activities
- `followups` - Follow-up schedules
- `products` - Product catalog
- `quotations` - Quotation headers
- `quotation_items` - Quotation line items
- `settings` - Application settings

## Deployment

Deploy ke Vercel:

```bash
vercel deploy
```

## License

Private - Untuk keperluan tugas kuliah
