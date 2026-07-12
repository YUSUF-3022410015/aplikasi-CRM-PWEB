import { hasPermission, getAccessibleRoutes, roleNames } from "../permissions";

describe("Permissions", () => {
  describe("hasPermission", () => {
    it("admin has access to all features", () => {
      expect(hasPermission("admin", "customer", "viewAll")).toBe(true);
      expect(hasPermission("admin", "user", "view")).toBe(true);
      expect(hasPermission("admin", "settings", "edit")).toBe(true);
    });

    it("manager can view all customers but not manage users", () => {
      expect(hasPermission("manager", "customer", "viewAll")).toBe(true);
      expect(hasPermission("manager", "user", "view")).toBe(false);
      expect(hasPermission("manager", "settings", "edit")).toBe(false);
    });

    it("sales can only view own customers", () => {
      expect(hasPermission("sales", "customer", "viewOwn")).toBe(true);
      expect(hasPermission("sales", "customer", "viewAll")).toBe(false);
      expect(hasPermission("sales", "customer", "create")).toBe(true);
      expect(hasPermission("sales", "customer", "edit")).toBe(false);
    });

    it("returns false for invalid module", () => {
      expect(hasPermission("admin", "invalidModule" as any, "view")).toBe(false);
    });

    it("returns false for invalid action", () => {
      expect(hasPermission("admin", "customer", "invalidAction")).toBe(false);
    });
  });

  describe("getAccessibleRoutes", () => {
    it("admin can access all routes", () => {
      const routes = getAccessibleRoutes("admin");
      expect(routes).toContain("/dashboard");
      expect(routes).toContain("/customers");
      expect(routes).toContain("/users");
      expect(routes).toContain("/settings");
      expect(routes).toContain("/reports");
    });

    it("manager can access most routes except user management", () => {
      const routes = getAccessibleRoutes("manager");
      expect(routes).toContain("/dashboard");
      expect(routes).toContain("/customers");
      expect(routes).toContain("/reports");
      expect(routes).not.toContain("/users");
      expect(routes).not.toContain("/settings");
    });

    it("sales has limited routes", () => {
      const routes = getAccessibleRoutes("sales");
      expect(routes).toContain("/dashboard");
      expect(routes).toContain("/customers");
      expect(routes).toContain("/pipeline");
      expect(routes).not.toContain("/users");
      expect(routes).not.toContain("/settings");
      expect(routes).not.toContain("/reports");
    });

    it("always includes profile route", () => {
      const adminRoutes = getAccessibleRoutes("admin");
      const managerRoutes = getAccessibleRoutes("manager");
      const salesRoutes = getAccessibleRoutes("sales");
      
      expect(adminRoutes).toContain("/profile");
      expect(managerRoutes).toContain("/profile");
      expect(salesRoutes).toContain("/profile");
    });
  });

  describe("roleNames", () => {
    it("has correct display names", () => {
      expect(roleNames.admin).toBe("Administrator");
      expect(roleNames.manager).toBe("Manager");
      expect(roleNames.sales).toBe("Sales");
    });
  });
});
