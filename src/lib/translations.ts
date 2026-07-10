// Translations for Indonesia & English

export type Locale = "id" | "en";

export const translations = {
  // Common
  common: {
    save: { id: "Simpan", en: "Save" },
    cancel: { id: "Batal", en: "Cancel" },
    delete: { id: "Hapus", en: "Delete" },
    edit: { id: "Edit", en: "Edit" },
    add: { id: "Tambah", en: "Add" },
    search: { id: "Cari", en: "Search" },
    filter: { id: "Filter", en: "Filter" },
    loading: { id: "Memuat...", en: "Loading..." },
    noData: { id: "Tidak ada data", en: "No data" },
    confirm: { id: "Konfirmasi", en: "Confirm" },
    back: { id: "Kembali", en: "Back" },
    next: { id: "Selanjutnya", en: "Next" },
    previous: { id: "Sebelumnya", en: "Previous" },
    print: { id: "Cetak", en: "Print" },
    export: { id: "Export", en: "Export" },
    import: { id: "Import", en: "Import" },
    send: { id: "Kirim", en: "Send" },
    close: { id: "Tutup", en: "Close" },
    yes: { id: "Ya", en: "Yes" },
    no: { id: "Tidak", en: "No" },
    all: { id: "Semua", en: "All" },
  },
  // Navigation
  nav: {
    dashboard: { id: "Dashboard", en: "Dashboard" },
    customers: { id: "Customers", en: "Customers" },
    activities: { id: "Activities", en: "Activities" },
    followups: { id: "Follow-ups", en: "Follow-ups" },
    calendar: { id: "Calendar", en: "Calendar" },
    pipeline: { id: "Pipeline", en: "Pipeline" },
    products: { id: "Products", en: "Products" },
    quotations: { id: "Quotations", en: "Quotations" },
    activityLog: { id: "Activity Log", en: "Activity Log" },
    reports: { id: "Reports", en: "Reports" },
    users: { id: "Users", en: "Users" },
    settings: { id: "Settings", en: "Settings" },
    profile: { id: "Profile", en: "Profile" },
    logout: { id: "Keluar", en: "Logout" },
  },
  // Products
  products: {
    title: { id: "Products", en: "Products" },
    subtitle: { id: "Daftar produk dan layanan", en: "Product and service list" },
    addProduct: { id: "Tambah Product", en: "Add Product" },
    sku: { id: "SKU", en: "SKU" },
    name: { id: "Nama", en: "Name" },
    category: { id: "Kategori", en: "Category" },
    price: { id: "Harga", en: "Price" },
    status: { id: "Status", en: "Status" },
    actions: { id: "Aksi", en: "Actions" },
    noProducts: { id: "Belum ada produk", en: "No products yet" },
    editProduct: { id: "Edit Product", en: "Edit Product" },
    description: { id: "Deskripsi", en: "Description" },
  },
  // Pipeline
  pipeline: {
    title: { id: "Pipeline", en: "Pipeline" },
    subtitle: { id: "Visualisasi alur penjualan pelanggan", en: "Customer sales flow visualization" },
    empty: { id: "Kosong", en: "Empty" },
    noCompany: { id: "Tanpa perusahaan", en: "No company" },
  },
  // Dashboard
  dashboard: {
    title: { id: "Dashboard", en: "Dashboard" },
    subtitle: { id: "Ringkasan aktivitas dan performa penjualan", en: "Activity summary and sales performance" },
    totalCustomers: { id: "Total Customer", en: "Total Customers" },
    newCustomers: { id: "Customer Baru", en: "New Customers" },
    revenue: { id: "Revenue", en: "Revenue" },
    dealsWon: { id: "Deal Won", en: "Deals Won" },
    dealsLost: { id: "Deal Lost", en: "Deals Lost" },
    followUpsToday: { id: "Follow-up Hari Ini", en: "Follow-ups Today" },
    followUpsOverdue: { id: "Follow-up Overdue", en: "Overdue Follow-ups" },
    pipelineValue: { id: "Pipeline Value", en: "Pipeline Value" },
    monthlyRevenue: { id: "Revenue Bulanan", en: "Monthly Revenue" },
    monthlyDeals: { id: "Deals Bulanan", en: "Monthly Deals" },
    activitiesByType: { id: "Aktivitas per Tipe", en: "Activities by Type" },
    customersByStatus: { id: "Customer per Status", en: "Customers by Status" },
  },
  // Customers
  customers: {
    title: { id: "Customers", en: "Customers" },
    subtitle: { id: "Kelola data pelanggan Anda", en: "Manage your customer data" },
    addCustomer: { id: "Tambah Customer", en: "Add Customer" },
    name: { id: "Nama", en: "Name" },
    company: { id: "Perusahaan", en: "Company" },
    email: { id: "Email", en: "Email" },
    phone: { id: "Telepon", en: "Phone" },
    whatsapp: { id: "WhatsApp", en: "WhatsApp" },
    industry: { id: "Industri", en: "Industry" },
    city: { id: "Kota", en: "City" },
    address: { id: "Alamat", en: "Address" },
    website: { id: "Website", en: "Website" },
    source: { id: "Sumber Lead", en: "Lead Source" },
    status: { id: "Status", en: "Status" },
    pipeline: { id: "Pipeline", en: "Pipeline" },
    createdAt: { id: "Dibuat", en: "Created" },
    updatedAt: { id: "Diupdate", en: "Updated" },
    searchPlaceholder: { id: "Cari nama, perusahaan, atau email...", en: "Search name, company, or email..." },
    filterStatus: { id: "Filter Status", en: "Filter Status" },
    allStatus: { id: "Semua Status", en: "All Status" },
    deleteConfirm: { id: "Hapus Customer?", en: "Delete Customer?" },
    deleteDescription: { id: "Tindakan ini tidak dapat dibatalkan. Data customer akan dihapus permanen.", en: "This action cannot be undone. Customer data will be permanently deleted." },
    detail: { id: "Detail", en: "Detail" },
    info: { id: "Informasi Customer", en: "Customer Information" },
    activities: { id: "Aktivitas", en: "Activities" },
    followupsTab: { id: "Follow-up", en: "Follow-up" },
    printPdf: { id: "Print PDF", en: "Print PDF" },
    noCompany: { id: "Tanpa perusahaan", en: "No company" },
  },
  // Activities
  activities: {
    title: { id: "Activities", en: "Activities" },
    subtitle: { id: "Kelola aktivitas dengan pelanggan", en: "Manage customer activities" },
    addActivity: { id: "Tambah Aktivitas", en: "Add Activity" },
    type: { id: "Tipe", en: "Type" },
    note: { id: "Catatan", en: "Note" },
    date: { id: "Tanggal", en: "Date" },
    user: { id: "User", en: "User" },
    call: { id: "Call", en: "Call" },
    whatsapp: { id: "WhatsApp", en: "WhatsApp" },
    email: { id: "Email", en: "Email" },
    meeting: { id: "Meeting", en: "Meeting" },
    visit: { id: "Visit", en: "Visit" },
    demo: { id: "Demo", en: "Demo" },
    proposal: { id: "Proposal", en: "Proposal" },
    closing: { id: "Closing", en: "Closing" },
  },
  // Follow-ups
  followups: {
    title: { id: "Follow-ups", en: "Follow-ups" },
    subtitle: { id: "Kelola jadwal follow-up", en: "Manage follow-up schedules" },
    addFollowup: { id: "Tambah Follow-up", en: "Add Follow-up" },
    dueDate: { id: "Tanggal Jatuh Tempo", en: "Due Date" },
    status: { id: "Status", en: "Status" },
    pending: { id: "Pending", en: "Pending" },
    done: { id: "Selesai", en: "Done" },
    cancelled: { id: "Dibatalkan", en: "Cancelled" },
  },
  // Quotations
  quotations: {
    title: { id: "Quotations", en: "Quotations" },
    subtitle: { id: "Kelola penawaran harga", en: "Manage price quotations" },
    createQuotation: { id: "Buat Quotation", en: "Create Quotation" },
    number: { id: "Nomor", en: "Number" },
    customer: { id: "Customer", en: "Customer" },
    items: { id: "Items", en: "Items" },
    product: { id: "Produk", en: "Product" },
    qty: { id: "Qty", en: "Qty" },
    price: { id: "Harga", en: "Price" },
    subtotal: { id: "Subtotal", en: "Subtotal" },
    tax: { id: "Pajak", en: "Tax" },
    discount: { id: "Diskon", en: "Discount" },
    total: { id: "Total", en: "Total" },
    notes: { id: "Catatan", en: "Notes" },
    sendEmail: { id: "Kirim Email", en: "Send Email" },
    printPDF: { id: "Print PDF", en: "Print PDF" },
  },
  // Settings
  settings: {
    title: { id: "Settings", en: "Settings" },
    subtitle: { id: "Pengaturan aplikasi dan profil perusahaan", en: "Application settings and company profile" },
    companyProfile: { id: "Company Profile", en: "Company Profile" },
    general: { id: "Pengaturan Umum", en: "General Settings" },
    emailTemplate: { id: "Email Template", en: "Email Template" },
    companyName: { id: "Nama Perusahaan", en: "Company Name" },
    companyEmail: { id: "Email Perusahaan", en: "Company Email" },
    companyPhone: { id: "Telepon", en: "Phone" },
    companyWebsite: { id: "Website", en: "Website" },
    companyAddress: { id: "Alamat", en: "Address" },
    companyCity: { id: "Kota", en: "City" },
    companyCountry: { id: "Negara", en: "Country" },
    currency: { id: "Mata Uang", en: "Currency" },
    timezone: { id: "Timezone", en: "Timezone" },
    logo: { id: "Logo Perusahaan", en: "Company Logo" },
  },
  // Auth
  auth: {
    login: { id: "Masuk", en: "Login" },
    signup: { id: "Daftar", en: "Sign Up" },
    forgotPassword: { id: "Lupa Password?", en: "Forgot Password?" },
    resetPassword: { id: "Reset Password", en: "Reset Password" },
    email: { id: "Email", en: "Email" },
    password: { id: "Password", en: "Password" },
    confirmPassword: { id: "Konfirmasi Password", en: "Confirm Password" },
    fullname: { id: "Nama Lengkap", en: "Full Name" },
    role: { id: "Role", en: "Role" },
    admin: { id: "Administrator", en: "Administrator" },
    manager: { id: "Manager", en: "Manager" },
    sales: { id: "Sales (Karyawan)", en: "Sales (Employee)" },
    noAccount: { id: "Belum punya akun?", en: "Don't have an account?" },
    hasAccount: { id: "Sudah punya akun?", en: "Already have an account?" },
    passwordMismatch: { id: "Password tidak cocok", en: "Passwords do not match" },
    passwordMinLength: { id: "Password minimal 6 karakter", en: "Password must be at least 6 characters" },
  },
  // Reports
  reports: {
    title: { id: "Reports", en: "Reports" },
    subtitle: { id: "Laporan dan analisis performa bisnis", en: "Business performance reports and analytics" },
    exportExcel: { id: "Export Excel", en: "Export Excel" },
    exportPDF: { id: "Export PDF", en: "Export PDF" },
  },
  // User Management
  users: {
    title: { id: "User Management", en: "User Management" },
    subtitle: { id: "Kelola pengguna dan hak akses sistem", en: "Manage users and system access" },
    inviteUser: { id: "Invite User", en: "Invite User" },
    editRole: { id: "Edit Role", en: "Edit Role" },
    deleteUser: { id: "Hapus User", en: "Delete User" },
  },
  // Activity Log
  activityLog: {
    title: { id: "Activity Log", en: "Activity Log" },
    subtitle: { id: "Riwayat semua aktivitas dalam sistem", en: "History of all activities in the system" },
  },
  // Unauthorized
  unauthorized: {
    title: { id: "Akses Ditolak", en: "Access Denied" },
    description: { id: "Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika Anda membutuhkan akses.", en: "You don't have permission to access this page. Contact an administrator if you need access." },
    backToDashboard: { id: "Kembali ke Dashboard", en: "Back to Dashboard" },
  },
} as const;

// Helper function to get translation
export function t(key: string, locale: Locale = "id"): string {
  const keys = key.split(".");
  let value: any = translations;

  for (const k of keys) {
    value = value?.[k];
  }

  if (value && typeof value === "object" && locale in value) {
    return value[locale];
  }

  return key;
}
