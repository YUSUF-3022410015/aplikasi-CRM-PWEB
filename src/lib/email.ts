// Email Automation Utility
// Uses Resend API (https://resend.com)

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// Default config from environment
const getEmailConfig = (): EmailConfig => ({
  apiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.EMAIL_FROM || "noreply@crm.com",
  fromName: process.env.EMAIL_FROM_NAME || "CRM System",
});

// Send email via Resend API
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig();

  if (!config.apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.message || "Gagal mengirim email" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim email",
    };
  }
}

// Email Templates
export const emailTemplates = {
  // Quotation email
  quotation: (params: {
    customerName: string;
    quotationNumber: string;
    total: string;
    items: { name: string; qty: number; price: string }[];
    notes?: string;
  }) => ({
    subject: `Penawaran Harga ${params.quotationNumber} - CRM`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; border: 1px solid #e5e7eb; text-align: left; }
          th { background: #e5e7eb; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PENAWARAN HARGA</h1>
          </div>
          <div class="content">
            <p>Halo ${params.customerName},</p>
            <p>Berikut kami kirimkan penawaran harga untuk Anda:</p>
            
            <p><strong>Nomor:</strong> ${params.quotationNumber}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Qty</th>
                  <th>Harga</th>
                </tr>
              </thead>
              <tbody>
                ${params.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.price}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            
            <div class="total">Total: ${params.total}</div>
            
            ${params.notes ? `<p><strong>Catatan:</strong> ${params.notes}</p>` : ""}
            
            <p>Silakan hubungi kami jika ada pertanyaan.</p>
            <p>Terima kasih.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh CRM System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Follow-up reminder
  followUpReminder: (params: {
    customerName: string;
    dueDate: string;
    note?: string;
  }) => ({
    subject: `Pengingat Follow-up: ${params.customerName} - CRM`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PENGINGAT FOLLOW-UP</h1>
          </div>
          <div class="content">
            <p>Halo,</p>
            <p>Anda memiliki follow-up yang perlu ditindaklanjuti:</p>
            
            <div class="highlight">
              <p><strong>Customer:</strong> ${params.customerName}</p>
              <p><strong>Jatuh Tempo:</strong> ${params.dueDate}</p>
              ${params.note ? `<p><strong>Catatan:</strong> ${params.note}</p>` : ""}
            </div>
            
            <p>Silakan lakukan follow-up sebelum jatuh tempo.</p>
            <p>Terima kasih.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh CRM System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Welcome email
  welcome: (params: {
    userName: string;
    email: string;
  }) => ({
    subject: `Selamat Datang di CRM - ${params.userName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SELAMAT DATANG!</h1>
          </div>
          <div class="content">
            <p>Halo ${params.userName},</p>
            <p>Selamat datang di CRM System!</p>
            <p>Akun Anda telah berhasil dibuat dengan email: ${params.email}</p>
            <p>Anda dapat login menggunakan email dan password yang telah didaftarkan.</p>
            <p>Terima kasih telah bergabung.</p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh CRM System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Helper functions for sending specific emails
export async function sendQuotationEmail(params: {
  to: string;
  customerName: string;
  quotationNumber: string;
  total: string;
  items: { name: string; qty: number; price: string }[];
  notes?: string;
}) {
  const template = emailTemplates.quotation(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html });
}

export async function sendFollowUpReminder(params: {
  to: string;
  customerName: string;
  dueDate: string;
  note?: string;
}) {
  const template = emailTemplates.followUpReminder(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html });
}

export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
  email: string;
}) {
  const template = emailTemplates.welcome(params);
  return sendEmail({ to: params.to, subject: template.subject, html: template.html });
}
