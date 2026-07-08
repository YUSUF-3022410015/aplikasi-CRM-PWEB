// WhatsApp API Utility
// Supports: WhatsApp Web URL (default) or WhatsApp Business API

interface WhatsAppConfig {
  useApi: boolean;
  apiUrl?: string;
  apiKey?: string;
}

// Default config - use WhatsApp Web URL
const config: WhatsAppConfig = {
  useApi: false,
};

// Format phone number for WhatsApp
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle Indonesian phone numbers
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("62")) {
    // already correct
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

// Send WhatsApp message via Web URL (opens WhatsApp)
export function sendWhatsAppMessage(phone: string, message: string): void {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(url, "_blank");
}

// Send WhatsApp message via API (requires API provider)
export async function sendWhatsAppAPI(
  phone: string,
  message: string,
  apiKey: string,
  apiUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedPhone = formatPhoneForWhatsApp(phone);

    // Example using Fonnte API (Indonesian WhatsApp API provider)
    // Change this to match your API provider
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
      }),
    });

    const data = await response.json();

    if (data.status === true || data.success === true) {
      return { success: true };
    } else {
      return { success: false, error: data.message || "Gagal mengirim pesan" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim pesan",
    };
  }
}

// Pre-defined message templates
export const messageTemplates = {
  greeting: (customerName: string) =>
    `Halo ${customerName},\n\nSemoga dalam keadaan baik. Saya ingin menghubungi Anda terkait kerja sama yang telah kita diskusikan.\n\nTerima kasih.`,

  followUp: (customerName: string, note: string) =>
    `Halo ${customerName},\n\n${note}\n\nSilakan balas pesan ini jika ada yang perlu diklarifikasi.\n\nTerima kasih.`,

  quotation: (customerName: string, quotationNumber: string, total: string) =>
    `Halo ${customerName},\n\nBerikut kami kirimkan penawaran harga dengan nomor: ${quotationNumber}\nTotal: ${total}\n\nSilakan di-review dan hubungi kami jika ada pertanyaan.\n\nTerima kasih.`,

  reminder: (customerName: string, dueDate: string) =>
    `Halo ${customerName},\n\nIni adalah pengingat untuk follow-up yang dijadwalkan pada ${dueDate}.\n\nTerima kasih.`,
};
