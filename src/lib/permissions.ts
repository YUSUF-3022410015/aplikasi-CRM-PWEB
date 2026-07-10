// Role-Based Access Control (RBAC) Utility

export type Role = "admin" | "manager" | "sales";

// Permission definitions
export const permissions = {
  // Customer
  customer: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "manager", "sales"] as Role[],
    edit: ["admin", "manager"] as Role[],
    delete: ["admin"] as Role[],
    import: ["admin", "manager"] as Role[],
    export: ["admin", "manager", "sales"] as Role[],
    print: ["admin", "manager", "sales"] as Role[],
    whatsapp: ["admin", "manager", "sales"] as Role[],
  },
  // Activity
  activity: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "manager", "sales"] as Role[],
    edit: ["admin", "manager"] as Role[],
    delete: ["admin"] as Role[],
  },
  // Follow-up
  followup: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "manager", "sales"] as Role[],
    edit: ["admin", "manager", "sales"] as Role[],
    delete: ["admin", "manager"] as Role[],
  },
  // Pipeline
  pipeline: {
    view: ["admin", "manager", "sales"] as Role[],
    edit: ["admin", "manager", "sales"] as Role[],
  },
  // Product
  product: {
    view: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "manager"] as Role[],
    edit: ["admin", "manager"] as Role[],
    delete: ["admin"] as Role[],
  },
  // Quotation
  quotation: {
    viewAll: ["admin", "manager"] as Role[],
    viewOwn: ["admin", "manager", "sales"] as Role[],
    create: ["admin", "manager", "sales"] as Role[],
    edit: ["admin", "manager", "sales"] as Role[],
    delete: ["admin", "manager"] as Role[],
    print: ["admin", "manager", "sales"] as Role[],
    sendEmail: ["admin", "manager", "sales"] as Role[],
  },
  // Report
  report: {
    view: ["admin", "manager"] as Role[],
    export: ["admin", "manager"] as Role[],
  },
  // Notification
  notification: {
    view: ["admin", "manager", "sales"] as Role[],
  },
  // User Management
  user: {
    view: ["admin"] as Role[],
    invite: ["admin"] as Role[],
    editRole: ["admin"] as Role[],
    delete: ["admin"] as Role[],
  },
  // Settings
  settings: {
    view: ["admin"] as Role[],
    edit: ["admin"] as Role[],
  },
  // Activity Log
  activityLog: {
    view: ["admin", "manager"] as Role[],
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
  if (hasPermission(role, "activity", "viewAll") || hasPermission(role, "activity", "viewOwn")) {
    routes.push("/activities");
  }
  if (hasPermission(role, "followup", "viewAll") || hasPermission(role, "followup", "viewOwn")) {
    routes.push("/followups");
  }
  if (hasPermission(role, "calendar", "view")) {
    routes.push("/calendar");
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
  if (hasPermission(role, "activityLog", "view")) {
    routes.push("/activity-log");
  }
  if (hasPermission(role, "report", "view")) {
    routes.push("/reports");
  }
  if (hasPermission(role, "user", "view")) {
    routes.push("/users");
  }
  if (hasPermission(role, "settings", "view")) {
    routes.push("/settings");
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

// Role descriptions
export const roleDescriptions: Record<Role, string[]> = {
  admin: [
    "Akses penuh ke semua fitur",
    "Kelola user (invite, edit, hapus)",
    "Kelola pengaturan sistem",
    "Lihat semua data dan laporan",
  ],
  manager: [
    "Lihat semua data customer",
    "Lihat semua laporan",
    "Edit customer dan follow-up",
    "Kelola product dan quotation",
    "Akses activity log",
  ],
  sales: [
    "Kelola customer sendiri",
    "Buat dan edit aktivitas",
    "Buat dan edit follow-up",
    "Buat quotation",
    "Kirim WhatsApp dan email",
  ],
};
