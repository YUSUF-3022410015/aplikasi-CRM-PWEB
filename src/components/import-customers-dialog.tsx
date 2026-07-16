"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseImportExcel, downloadTemplate } from "@/lib/excel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface ImportCustomersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type ImportState = "idle" | "parsing" | "preview" | "importing" | "done";

export function ImportCustomersDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportCustomersDialogProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<ImportState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: { row: number; message: string }[];
    data: Record<string, unknown>[];
  } | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [supabase] = useState(() => createClient());

  const handleDownloadTemplate = () => {
    const blob = downloadTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_customer.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setState("parsing");

    try {
      const result = await parseImportExcel(selected);
      setPreview({
        total: result.total,
        success: result.success,
        failed: result.failed,
        errors: result.errors,
        data: result.data as Record<string, unknown>[],
      });
      setState("preview");
    } catch (err) {
      console.error("Excel parse error:", err);
      setState("idle");
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!preview?.data.length) return;

    setState("importing");
    let imported = 0;
    let errors = 0;

    // Import in batches of 50
    for (let i = 0; i < preview.data.length; i += 50) {
      const batch = preview.data.slice(i, i + 50);
      const { error } = await supabase.from("customers").insert(batch);
      if (error) {
        errors += batch.length;
      } else {
        imported += batch.length;
      }
    }

    setResult({ imported, errors });
    setState("done");
    onSuccess();
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setState("idle");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("common.importFromExcel")}</DialogTitle>
          <DialogDescription>
            {t("common.importDescription")}
          </DialogDescription>
        </DialogHeader>

        {state === "idle" && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("common.clickToSelect")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("common.formatXlsx")}</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("common.downloadTemplate")}
            </Button>
          </div>
        )}

        {state === "parsing" && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{t("common.processing")}</p>
          </div>
        )}

        {state === "preview" && preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold">{preview.total}</p>
                <p className="text-xs text-muted-foreground">{t("common.totalRows")}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold text-green-600">{preview.success}</p>
                <p className="text-xs text-muted-foreground">{t("common.valid")}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold text-red-600">{preview.failed}</p>
                <p className="text-xs text-muted-foreground">{t("common.error")}</p>
              </div>
            </div>

            {preview.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-lg border p-3 space-y-1">
                {preview.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t("common.row")} {err.row}: {err.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {state === "importing" && (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{t("common.importing")}</p>
          </div>
        )}

        {state === "done" && result && (
          <div className="py-4 text-center space-y-3">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <p className="font-medium">{t("common.importDone")}</p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-green-600">{result.imported} {t("common.success")}</span>
              {result.errors > 0 && (
                <span className="text-red-600">{result.errors} {t("common.failed")}</span>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {state === "preview" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleImport} disabled={preview?.success === 0}>
                <Upload className="mr-2 h-4 w-4" />
                {t("common.import")} {preview?.success} Data
              </Button>
            </>
          )}
          {state === "done" && (
            <Button onClick={handleClose}>{t("common.close")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
