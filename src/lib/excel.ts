import * as XLSX from "xlsx";
import type { Customer, CustomerStatus, PipelineStage } from "@/types/database";

// Kolom Excel -> Database
const COLUMN_MAP: Record<string, keyof Customer> = {
  "Nama": "name",
  "Perusahaan": "company",
  "Email": "email",
  "Telepon": "phone",
  "WhatsApp": "whatsapp",
  "Industri": "industry",
  "Kota": "city",
  "Alamat": "address",
  "Website": "website",
  "Sumber Lead": "source",
  "Status": "status",
  "Pipeline Stage": "pipeline_stage",
};

const VALID_STATUSES: CustomerStatus[] = ["lead", "prospect", "active", "inactive", "archived"];
const VALID_PIPELINES: PipelineStage[] = ["lead", "qualified", "contacted", "meeting", "proposal", "negotiation", "won", "lost"];

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
  data: Partial<Customer>[];
}

// Export customers to Excel
export function exportCustomersToExcel(customers: Customer[]): Blob {
  const rows = customers.map((c) => ({
    "Nama": c.name,
    "Perusahaan": c.company || "",
    "Email": c.email || "",
    "Telepon": c.phone || "",
    "WhatsApp": c.whatsapp || "",
    "Industri": c.industry || "",
    "Kota": c.city || "",
    "Alamat": c.address || "",
    "Website": c.website || "",
    "Sumber Lead": c.source || "",
    "Status": c.status,
    "Pipeline Stage": c.pipeline_stage,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 25 }, // Nama
    { wch: 25 }, // Perusahaan
    { wch: 25 }, // Email
    { wch: 18 }, // Telepon
    { wch: 18 }, // WhatsApp
    { wch: 20 }, // Industri
    { wch: 15 }, // Kota
    { wch: 30 }, // Alamat
    { wch: 25 }, // Website
    { wch: 15 }, // Sumber Lead
    { wch: 12 }, // Status
    { wch: 15 }, // Pipeline
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customers");
  return XLSX.write(wb, { bookType: "xlsx", type: "blob" });
}

// Download template Excel
export function downloadTemplate(): Blob {
  const template = [
    {
      "Nama": "John Doe",
      "Perusahaan": "PT Contoh",
      "Email": "john@contoh.com",
      "Telepon": "08123456789",
      "WhatsApp": "08123456789",
      "Industri": "Teknologi",
      "Kota": "Jakarta",
      "Alamat": "Jl. Contoh No. 1",
      "Website": "https://contoh.com",
      "Sumber Lead": "Website",
      "Status": "lead",
      "Pipeline Stage": "lead",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  ws["!cols"] = [
    { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 18 },
    { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 30 },
    { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  return XLSX.write(wb, { bookType: "xlsx", type: "blob" });
}

// Parse & validate imported Excel
export function parseImportExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

        const errors: ImportResult["errors"] = [];
        const validData: Partial<Customer>[] = [];

        rows.forEach((row, idx) => {
          const rowNum = idx + 2; // +2 because row 1 is header, 0-indexed
          const name = row["Nama"] || row["name"] || "";
          const status = (row["Status"] || row["status"] || "lead").toLowerCase();
          const pipeline = (row["Pipeline Stage"] || row["pipeline_stage"] || "lead").toLowerCase();

          if (!name.trim()) {
            errors.push({ row: rowNum, message: "Nama wajib diisi" });
            return;
          }

          if (!VALID_STATUSES.includes(status as CustomerStatus)) {
            errors.push({ row: rowNum, message: `Status tidak valid: ${status}` });
            return;
          }

          if (!VALID_PIPELINES.includes(pipeline as PipelineStage)) {
            errors.push({ row: rowNum, message: `Pipeline tidak valid: ${pipeline}` });
            return;
          }

          validData.push({
            name: name.trim(),
            company: row["Perusahaan"] || row["company"] || "",
            email: row["Email"] || row["email"] || "",
            phone: row["Telepon"] || row["phone"] || "",
            whatsapp: row["WhatsApp"] || row["whatsapp"] || "",
            industry: row["Industri"] || row["industry"] || "",
            city: row["Kota"] || row["city"] || "",
            address: row["Alamat"] || row["address"] || "",
            website: row["Website"] || row["website"] || "",
            source: row["Sumber Lead"] || row["source"] || "",
            status: status as CustomerStatus,
            pipeline_stage: pipeline as PipelineStage,
          });
        });

        resolve({
          total: rows.length,
          success: validData.length,
          failed: errors.length,
          errors,
          data: validData,
        });
      } catch {
        resolve({
          total: 0,
          success: 0,
          failed: 1,
          errors: [{ row: 0, message: "Gagal membaca file Excel" }],
          data: [],
        });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
