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
import { Plus, UserCog, Shield, Pencil, Trash2, Loader2, KeyRound } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { resetUserPassword, inviteUser, editUserRole } from "@/app/actions/admin";
import { deleteUser } from "@/app/actions/delete-user";
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
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
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

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setDeleteLoading(true);

    const result = await deleteUser(deleteUserId);

    if (result.success) {
      setDeleteUserId(null);
      fetchUsers();
    } else {
      console.error("Gagal menghapus user:", result.error);
    }

    setDeleteLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t("users.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("users.subtitle")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-primary text-primary-foreground shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("users.inviteUser")}
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-semibold">{t("customers.name")}</TableHead>
                <TableHead className="font-semibold">{t("customers.email")}</TableHead>
                <TableHead className="font-semibold">{t("auth.role")}</TableHead>
                <TableHead className="w-[100px] font-semibold">{t("common.edit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">{t("common.loading")}</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">{t("common.noData")}</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.fullname}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleColors[u.role] || "default"}>
                      <Shield className="mr-1 h-3 w-3" />
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {canManageUser(u.role) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
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
                            className="h-8 w-8"
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
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteUserId(u.id)}
                            disabled={isManager && u.role === "admin"}
                            title={isManager && u.role === "admin" ? "Manager tidak dapat menghapus Admin" : ""}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              {t("users.inviteUser")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("auth.fullname")}</Label>
              <Input value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder={t("profile.fullNamePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("customers.emailPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.password")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.password")} />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.role")}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="admin">{t("auth.admin")}</SelectItem>}
                  <SelectItem value="manager">{t("auth.manager")}</SelectItem>
                  <SelectItem value="sales">{t("auth.sales")}</SelectItem>
                </SelectContent>
              </Select>
              {isManager && (
                <p className="text-xs text-muted-foreground">Manager tidak dapat membuat akun Admin</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleInvite} disabled={inviteLoading || !email || !fullname || !password}>
              {inviteLoading ? t("common.loading") : t("users.inviteUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              {t("users.editRole")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("nav.users")}</p>
              <p className="font-medium">{editUser?.fullname} ({editUser?.email})</p>
              {isManager && editUser?.role === "admin" && (
                <p className="text-xs text-destructive mt-1">Manager tidak dapat mengubah role Admin</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("auth.role")}</Label>
              <Select
                value={editRole}
                onValueChange={setEditRole}
                disabled={isManager && editUser?.role === "admin"}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isAdmin && <SelectItem value="admin">{t("auth.admin")}</SelectItem>}
                  <SelectItem value="manager">{t("auth.manager")}</SelectItem>
                  <SelectItem value="sales">{t("auth.sales")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
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

      {/* Delete User Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => { if (!open && !deleteLoading) setDeleteUserId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteUser")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("customers.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>{t("common.cancel")}</AlertDialogCancel>
            <Button
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.delete")}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <p className="font-medium">{resetUser?.fullname} ({resetUser?.email})</p>
            </div>
            {resetSuccess ? (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Password berhasil direset!
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru (min 6 karakter)"
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="text-xs text-destructive">Password minimal 6 karakter</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
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
