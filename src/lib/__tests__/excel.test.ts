import { exportCustomersToExcel, downloadTemplate } from "../excel";
import type { Customer } from "@/types/database";

// Mock XLSX
jest.mock("xlsx", () => ({
  utils: {
    json_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(() => new Uint8Array([1, 2, 3])),
}));

describe("Excel utilities", () => {
  const mockCustomers: Customer[] = [
    {
      id: "1",
      name: "John Doe",
      company: "PT Contoh",
      email: "john@contoh.com",
      phone: "08123456789",
      whatsapp: "08123456789",
      industry: "Technology",
      city: "Jakarta",
      address: "Jl. Sudirman",
      website: "www.contoh.com",
      source: "Website",
      status: "active",
      pipeline_stage: "proposal",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  describe("exportCustomersToExcel", () => {
    it("returns a Blob", () => {
      const result = exportCustomersToExcel(mockCustomers);
      expect(result).toBeInstanceOf(Blob);
    });

    it("handles empty array", () => {
      const result = exportCustomersToExcel([]);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe("downloadTemplate", () => {
    it("returns a Blob", () => {
      const result = downloadTemplate();
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
