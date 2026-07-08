"use client";

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
import type { Customer } from "@/types/database";

const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  company: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  source: z.string().optional(),
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

interface CustomerFormProps {
  customer?: Customer;
  mode: "create" | "edit";
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter();
  const supabase = createClient();

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
      status: customer?.status || "lead",
      pipeline_stage: customer?.pipeline_stage || "lead",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
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
    } else {
      const { error } = await supabase
        .from("customers")
        .update({
          ...data,
          email: data.email || null,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          industry: data.industry || null,
          city: data.city || null,
          address: data.address || null,
          website: data.website || null,
          source: data.source || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer!.id);
      if (error) {
        console.error(error);
        return;
      }
    }
    router.push("/customers");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nama *</Label>
            <Input id="name" {...register("name")} placeholder="Nama customer" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Perusahaan</Label>
            <Input id="company" {...register("company")} placeholder="Nama perusahaan" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="email@perusahaan.com" />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input id="phone" {...register("phone")} placeholder="08xxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" {...register("whatsapp")} placeholder="628xxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industri</Label>
            <Input id="industry" {...register("industry")} placeholder="Teknologi, Retail, dll" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input id="city" {...register("city")} placeholder="Jakarta" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("website")} placeholder="https://..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea id="address" {...register("address")} placeholder="Alamat lengkap" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Sumber Lead</Label>
            <Input id="source" {...register("source")} placeholder="Referral, Website, dll" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as CustomerFormData["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline_stage">Pipeline Stage</Label>
            <Select
              value={watch("pipeline_stage")}
              onValueChange={(v) => setValue("pipeline_stage", v as CustomerFormData["pipeline_stage"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : mode === "create" ? (
            "Tambah Customer"
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </form>
  );
}
