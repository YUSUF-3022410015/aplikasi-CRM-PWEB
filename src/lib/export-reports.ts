import * as XLSX from "xlsx";

interface ReportStats {
  totalCustomers: number;
  totalRevenue: number;
  dealsWon: number;
  dealsLost: number;
  totalActivities: number;
  followUpsPending: number;
  followUpsDone: number;
  customersByStatus: { name: string; value: number }[];
  revenueByMonth: { name: string; revenue: number }[];
  activitiesByType: { name: string; value: number }[];
}

// Export report data to Excel
export function exportReportToExcel(stats: ReportStats): Blob {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    { "Metrik": "Total Customer", "Nilai": stats.totalCustomers },
    { "Metrik": "Total Revenue", "Nilai": stats.totalRevenue },
    { "Metrik": "Deals Won", "Nilai": stats.dealsWon },
    { "Metrik": "Deals Lost", "Nilai": stats.dealsLost },
    { "Metrik": "Total Aktivitas", "Nilai": stats.totalActivities },
    { "Metrik": "Follow-up Pending", "Nilai": stats.followUpsPending },
    { "Metrik": "Follow-up Selesai", "Nilai": stats.followUpsDone },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

  // Sheet 2: Revenue Bulanan
  const wsRevenue = XLSX.utils.json_to_sheet(
    stats.revenueByMonth.map((r) => ({ "Bulan": r.name, "Revenue": r.revenue }))
  );
  wsRevenue["!cols"] = [{ wch: 10 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsRevenue, "Revenue");

  // Sheet 3: Customer by Status
  const wsCust = XLSX.utils.json_to_sheet(
    stats.customersByStatus.map((c) => ({ "Status": c.name, "Jumlah": c.value }))
  );
  wsCust["!cols"] = [{ wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsCust, "Customer");

  // Sheet 4: Activities
  const wsAct = XLSX.utils.json_to_sheet(
    stats.activitiesByType.map((a) => ({ "Tipe Aktivitas": a.name, "Jumlah": a.value }))
  );
  wsAct["!cols"] = [{ wch: 18 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsAct, "Aktivitas");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// Trigger browser print dialog for PDF export
export function exportReportToPDF() {
  window.print();
}
