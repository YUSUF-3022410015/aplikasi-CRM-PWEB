"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { Customer } from "@/types/database";

interface CustomerFormProps {
  customer?: Customer;
  mode: "create" | "edit";
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  const [salesUsers, setSalesUsers] = useState<{ id: string; fullname: string }[]>([]);

  const customerSchema = z.object({
    name: z.string().min(1, t("common.required")),
    company: z.string().optional(),
    email: z.string().email(t("common.invalidEmail")).optional().or(z.literal("")),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    industry: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    website: z.string().optional(),
    source: z.string().optional(),
    assigned_to: z.string().optional(),
    status: z.enum(["lead", "prospect", "active", "inactive", "archived"]),
    pipeline_stage: z.enum([
      "lead",
      "qualified",
      "contacted",
      "meeting",
      "proposal",
      "negotiation",
      "won",
      "lost",
    ]),
  });

  type CustomerFormData = z.infer<typeof customerSchema>;

  useEffect(() => {
    supabase.from("profiles").select("id, fullname").order("fullname").then(({ data }) => {
      setSalesUsers(data || []);
    });
  }, [supabase]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || "",
      company: customer?.company || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      whatsapp: customer?.whatsapp || "",
      industry: customer?.industry || "",
      city: customer?.city || "",
      address: customer?.address || "",
      website: customer?.website || "",
      source: customer?.source || "",
      assigned_to: customer?.assigned_to || "",
      status: customer?.status || "lead",
      pipeline_stage: customer?.pipeline_stage || "lead",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (mode === "create") {
      const { error } = await supabase.from("customers").insert({
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        industry: data.industry || null,
        city: data.city || null,
        address: data.address || null,
        website: data.website || null,
        source: data.source || null,
      });
      if (error) {
        console.error(error);
        return;
      }
      // Create notification (non-blocking)
      if (user) {
        try {
          await supabase.from("notifications").insert({
            user_id: user.id,
            title: "Pelanggan Baru",
            message: `Pelanggan ${data.name} berhasil ditambahkan`,
            type: "activity_added",
            link: "/customers",
          });
        } catch {}
      }
    } else {
      const { error } = await supabase
        .from("customers")
        .update({
          name: data.name,
          company: data.company || null,
          email: data.email || null,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          industry: data.industry || null,
          city: data.city || null,
          address: data.address || null,
          website: data.website || null,
          source: data.source || null,
          assigned_to: data.assigned_to || null,
          status: data.status,
          pipeline_stage: data.pipeline_stage,
        })
        .eq("id", customer!.id);
      if (error) {
        console.error(error);
        return;
      }
      // Create notification (non-blocking)
      if (user) {
        try {
          await supabase.from("notifications").insert({
            user_id: user.id,
            title: "Pelanggan Diperbarui",
            message: `Data pelanggan ${data.name} telah diperbarui`,
            type: "activity_added",
            link: `/customers/${customer!.id}`,
          });
        } catch {}
      }
    }
    router.push("/customers");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("customers.info")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("customers.name")} *</Label>
            <Input id="name" {...register("name")} placeholder={t("customers.namePlaceholder")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">{t("customers.company")}</Label>
            <Input id="company" {...register("company")} placeholder={t("customers.companyPlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("customers.email")}</Label>
            <Input id="email" type="email" {...register("email")} placeholder={t("customers.emailPlaceholder")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("customers.phone")}</Label>
            <Input id="phone" {...register("phone")} placeholder={t("customers.phonePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">{t("customers.whatsapp")}</Label>
            <Input id="whatsapp" {...register("whatsapp")} placeholder={t("customers.whatsappPlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">{t("customers.industry")}</Label>
            <Input id="industry" {...register("industry")} placeholder={t("customers.industryPlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("customers.city")}</Label>
            <Input id="city" {...register("city")} placeholder={t("customers.cityPlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">{t("customers.website")}</Label>
            <Input id="website" {...register("website")} placeholder={t("customers.websitePlaceholder")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">{t("customers.address")}</Label>
            <Textarea id="address" {...register("address")} placeholder={t("customers.address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">{t("customers.source")}</Label>
            <Input id="source" {...register("source")} placeholder={t("customers.sourcePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label>{t("customers.assignedSales")}</Label>
            <Select value={watch("assigned_to") || "none"} onValueChange={(v) => setValue("assigned_to", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder={t("customers.assignedSales")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("customers.notAssigned")}</SelectItem>
                {salesUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.fullname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t("customers.status")}</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as CustomerFormData["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">{t("customers.lead")}</SelectItem>
                <SelectItem value="prospect">{t("customers.prospect")}</SelectItem>
                <SelectItem value="active">{t("common.active")}</SelectItem>
                <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                <SelectItem value="archived">{t("customers.archived")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline_stage">{t("customers.pipeline")}</Label>
            <Select
              value={watch("pipeline_stage")}
              onValueChange={(v) => setValue("pipeline_stage", v as CustomerFormData["pipeline_stage"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">{t("customers.lead")}</SelectItem>
                <SelectItem value="qualified">{t("customers.qualified")}</SelectItem>
                <SelectItem value="contacted">{t("customers.contacted")}</SelectItem>
                <SelectItem value="meeting">{t("customers.meeting")}</SelectItem>
                <SelectItem value="proposal">{t("customers.proposal")}</SelectItem>
                <SelectItem value="negotiation">{t("customers.negotiation")}</SelectItem>
                <SelectItem value="won">{t("customers.won")}</SelectItem>
                <SelectItem value="lost">{t("customers.lost")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.saving")}
            </>
          ) : mode === "create" ? (
            t("customers.addCustomer")
          ) : (
            t("customers.saveChanges")
          )}
        </Button>
      </div>
    </form>
  );
}
