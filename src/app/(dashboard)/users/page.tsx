"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UserCog, Shield, Pencil, Trash2, Loader2, KeyRound, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { resetUserPassword, inviteUser, editUserRole } from "@/app/actions/admin";
import { deactivateUser } from "@/app/actions/delete-user";
import { usePermissions } from "@/hooks/use-permissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  role: string;
  created_at: string;
}

const roleColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  admin: "destructive",
  manager: "warning",
  sales: "default",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sales");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const { t } = useLanguage();
  const [deactivateUserId, setDeactivateUserId] = useState<string | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [resetUser, setResetUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [supabase] = useState(() => createClient());
  const { role: currentRole, isAdmin, isManager } = usePermissions();

  // PRD §3.3: Hanya Admin yang bisa kelola user
  const canManageUser = (targetRole: string) => {
    return isAdmin;
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleInvite = async () => {
    if (!email || !fullname || !password) return;
    setInviteLoading(true);

    const result = await inviteUser(email, fullname, password, role);

    if (!result.success) {
      console.error("Gagal mengundang user:", result.error);
    }

    setDialogOpen(false);
    setFullname("");
    setEmail("");
    setPassword("");
    setRole("sales");
    setInviteLoading(false);
    fetchUsers();
  };

  const handleEditRole = async () => {
    if (!editUser || !editRole) return;
    setEditLoading(true);

    const result = await editUserRole(editUser.id, editRole);

    if (!result.success) {
      console.error("Gagal mengubah role:", result.error);
    }

    setEditUser(null);
    setEditRole("");
    setEditLoading(false);
    fetchUsers();
  };

  const handleDeactivateUser = async () => {
    if (!deactivateUserId) return;
    setDeactivateLoading(true);

    const result = await deactivateUser(deactivateUserId);

    if (result.success) {
      setDeactivateUserId(null);
      fetchUsers();
    } else {
      console.error("Gagal menonaktifkan user:", result.error);
    }

    setDeactivateLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetUser || !newPassword || newPassword.length < 6) return;
    setResetLoading(true);

    const result = await resetUserPassword(resetUser.id, newPassword);

    if (result.success) {
      setResetSuccess(true);
      setTimeout(() => {
        setResetUser(null);
        setNewPassword("");
        setResetSuccess(false);
      }, 2000);
    } else {
      console.error("Gagal:", result.error);
    }

    setResetLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <ShieldAlert className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">{t("unauthorized.title")}</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">{t("unauthorized.description")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl tracking-tight">{t("users.title")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("users.subtitle")}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("users.inviteUser")}
          </Button>
        )}
      </div>

      {/* Table Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("customers.name")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("customers.email")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">{t("auth.role")}</TableHead>
                <TableHead className="w-[120px] font-semibold text-xs uppercase tracking-wider">{t("common.edit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">{t("common.loading")}</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="font-semibold">{u.fullname}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleColors[u.role] || "default"} className="font-medium capitalize">
                      <Shield className="mr-1 h-3 w-3" />
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {canManageUser(u.role) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            title="Reset Password"
                            onClick={() => {
                              setResetUser(u);
                              setNewPassword("");
                              setResetSuccess(false);
                            }}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              setEditUser(u);
                              setEditRole(u.role);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeactivateUserId(u.id)}
                            disabled={isManager && u.role === "admin"}
                            title={isManager && u.role === "admin" ? "Manager tidak dapat menonaktifkan Admin" : ""}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <UserCog className="h-5 w-5" />
              </div>
              {t("users.inviteUser")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("auth.fullname")}</Label>
              <Input value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder={t("profile.fullNamePlaceholder")} className="bg-muted/50 focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("auth.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("customers.emailPlaceholder")} className="bg-muted/50 focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("auth.password")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.password")} className="bg-muted/50 focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("auth.role")}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-muted/50 focus:bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="admin">{t("auth.admin")}</SelectItem>}
                  <SelectItem value="manager">{t("auth.manager")}</SelectItem>
                  <SelectItem value="sales">{t("auth.sales")}</SelectItem>
                </SelectContent>
              </Select>
              {isManager && (
                <p className="text-xs text-muted-foreground mt-1">Manager tidak dapat membuat akun Admin</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleInvite} disabled={inviteLoading || !email || !fullname || !password}>
              {inviteLoading ? t("common.loading") : t("users.inviteUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <UserCog className="h-5 w-5" />
              </div>
              {t("users.editRole")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("nav.users")}</p>
              <p className="font-semibold mt-1">{editUser?.fullname}</p>
              <p className="text-sm text-muted-foreground">{editUser?.email}</p>
              {isManager && editUser?.role === "admin" && (
                <p className="text-xs text-destructive mt-2 font-medium">Manager tidak dapat mengubah role Admin</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("auth.role")}</Label>
              <Select
                value={editRole}
                onValueChange={setEditRole}
                disabled={isManager && editUser?.role === "admin"}
              >
                <SelectTrigger className="bg-muted/50 focus:bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="admin">{t("auth.admin")}</SelectItem>}
                  <SelectItem value="manager">{t("auth.manager")}</SelectItem>
                  <SelectItem value="sales">{t("auth.sales")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>{t("common.cancel")}</Button>
            <Button
              onClick={handleEditRole}
              disabled={editLoading || !editRole || (isManager && editUser?.role === "admin")}
            >
              {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Dialog — PRD §3.4: nonaktifkan, bukan hard delete */}
      <AlertDialog open={!!deactivateUserId} onOpenChange={(open) => { if (!open && !deactivateLoading) setDeactivateUserId(null); }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-lg">Nonaktifkan Pengguna?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Pengguna tidak akan bisa login lagi. Data pelanggan dan deal miliknya tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel disabled={deactivateLoading} className="sm:w-32">{t("common.cancel")}</AlertDialogCancel>
            <Button
              onClick={handleDeactivateUser}
              variant="destructive"
              className="sm:w-32"
              disabled={deactivateLoading}
            >
              {deactivateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Nonaktifkan
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onOpenChange={() => {
        setResetUser(null);
        setNewPassword("");
        setResetSuccess(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <KeyRound className="h-5 w-5" />
              </div>
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">User</p>
              <p className="font-semibold mt-1">{resetUser?.fullname}</p>
              <p className="text-sm text-muted-foreground">{resetUser?.email}</p>
            </div>
            {resetSuccess ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 text-center font-medium animate-scale-in">
                Password berhasil direset!
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Password Baru</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru (min 6 karakter)"
                  className="bg-muted/50 focus:bg-background"
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="text-xs text-destructive font-medium">Password minimal 6 karakter</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setResetUser(null);
              setNewPassword("");
              setResetSuccess(false);
            }}>
              {t("common.close")}
            </Button>
            {!resetSuccess && (
              <Button
                onClick={handleResetPassword}
                disabled={resetLoading || newPassword.length < 6}
              >
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
