// Role-Based Access Control (RBAC) Utility
// Sesuai PRD §3.3: Manager = READ-ONLY (hanya memantau, bukan mengedit)

export type Role = "admin" | "manager" | "sales";

// Permission definitions - sesuai PRD §3.3 Role & Permission Matrix
export const permissions = {
  // Customer - Manager hanya lihat, tidak bisa CRUD
  customer: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "sales"] as Role[],      // Manager TIDAK boleh buat
    edit: ["admin", "sales"] as Role[],         // Manager TIDAK boleh edit
    delete: ["admin"] as Role[],                // Hanya Admin
  },
  // Activity - Manager hanya lihat
  activity: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "sales"] as Role[],       // Manager TIDAK boleh buat
    edit: ["admin", "sales"] as Role[],         // Manager TIDAK boleh edit
    delete: ["admin"] as Role[],                // Hanya Admin
  },
  // Follow-up - Manager hanya lihat
  followup: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "sales"] as Role[],       // Manager TIDAK boleh buat
    edit: ["admin", "sales"] as Role[],         // Manager TIDAK boleh edit
    delete: ["admin"] as Role[],                // Hanya Admin
  },
  // Pipeline - Manager hanya lihat
  pipeline: {
    view: ["admin", "manager", "sales"] as Role[],
    edit: ["admin", "sales"] as Role[],         // Manager TIDAK boleh edit
  },
  // Product - Manager hanya lihat
  product: {
    view: ["admin", "manager", "sales"] as Role[],
    create: ["admin"] as Role[],                // Manager TIDAK boleh buat
    edit: ["admin"] as Role[],                  // Manager TIDAK boleh edit
    delete: ["admin"] as Role[],                // Hanya Admin
  },
  // Quotation - Manager hanya lihat
  quotation: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "sales"] as Role[],       // Manager TIDAK boleh buat
    edit: ["admin", "sales"] as Role[],         // Manager TIDAK boleh edit
    delete: ["admin"] as Role[],                // Hanya Admin
    print: ["admin", "manager", "sales"] as Role[],
  },
  // Report
  report: {
    view: ["admin", "manager"] as Role[],
    export: ["admin", "manager"] as Role[],
  },
  // User Management - Hanya Admin (PRD §3.3)
  user: {
    view: ["admin"] as Role[],                  // Manager TIDAK boleh kelola user
    invite: ["admin"] as Role[],
    editRole: ["admin"] as Role[],
    deactivate: ["admin"] as Role[],
  },
  // Settings - Hanya Admin
  settings: {
    view: ["admin"] as Role[],
    edit: ["admin"] as Role[],
  },
  // Activity Log - Hanya Admin (PRD §3.3)
  activityLog: {
    view: ["admin"] as Role[],                  // Manager TIDAK boleh lihat audit log
  },
  // Calendar
  calendar: {
    view: ["admin", "manager", "sales"] as Role[],
  },
} as const;

// Check if role has permission
export function hasPermission(role: Role, module: keyof typeof permissions, action: string): boolean {
  const modulePermissions = permissions[module];
  if (!modulePermissions) return false;

  const allowedRoles = modulePermissions[action as keyof typeof modulePermissions] as readonly Role[] | undefined;
  if (!allowedRoles) return false;

  return allowedRoles.includes(role);
}

// Get all accessible routes for a role
export function getAccessibleRoutes(role: Role): string[] {
  const routes: string[] = ["/dashboard"];

  if (hasPermission(role, "customer", "viewAll") || hasPermission(role, "customer", "viewOwn")) {
    routes.push("/customers");
  }
  if (hasPermission(role, "pipeline", "view")) {
    routes.push("/pipeline");
  }
  if (hasPermission(role, "product", "view")) {
    routes.push("/products");
  }
  if (hasPermission(role, "quotation", "viewAll") || hasPermission(role, "quotation", "viewOwn")) {
    routes.push("/quotations");
  }
  if (hasPermission(role, "user", "view")) {
    routes.push("/users");
  }
  routes.push("/profile");

  return routes;
}

// Role display names
export const roleNames: Record<Role, string> = {
  admin: "Administrator",
  manager: "Manager",
  sales: "Sales",
};

// Role descriptions - sesuai PRD §1.3 & §3.3
export const roleDescriptions: Record<Role, string[]> = {
  admin: [
    "Akses penuh ke semua fitur",
    "Kelola user (invite, nonaktifkan)",
    "Kelola pengaturan sistem",
    "Hapus data (soft delete)",
    "Lihat audit log",
  ],
  manager: [
    "Lihat semua data customer & deal (read-only)",
    "Lihat dashboard performa tim",
    "Tidak bisa mengubah/menghapus data",
  ],
  sales: [
    "Kelola customer sendiri (CRUD)",
    "Buat & edit aktivitas",
    "Buat & edit follow-up",
    "Buat quotation",
    "Gunakan pipeline (drag & drop)",
  ],
};
