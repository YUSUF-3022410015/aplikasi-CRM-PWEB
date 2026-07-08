"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Loader2 } from "lucide-react";
import { sendWhatsAppMessage, messageTemplates } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  phone: string;
  customerName: string;
  quotationNumber?: string;
  quotationTotal?: string;
  onSend?: (message: string) => void;
}

const templates = [
  { value: "custom", label: "Pesan Custom" },
  { value: "greeting", label: "Sapaan" },
  { value: "followUp", label: "Follow-up" },
  { value: "quotation", label: "Quotation" },
  { value: "reminder", label: "Pengingat" },
];

export function WhatsAppButton({
  phone,
  customerName,
  quotationNumber,
  quotationTotal,
  onSend,
}: WhatsAppButtonProps) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState("custom");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    switch (value) {
      case "greeting":
        setMessage(messageTemplates.greeting(customerName));
        break;
      case "followUp":
        setMessage(messageTemplates.followUp(customerName, "Mohon update terkait progres yang sedang berjalan."));
        break;
      case "quotation":
        if (quotationNumber && quotationTotal) {
          setMessage(messageTemplates.quotation(customerName, quotationNumber, quotationTotal));
        }
        break;
      case "reminder":
        setMessage(messageTemplates.reminder(customerName, new Date().toLocaleDateString("id-ID")));
        break;
      default:
        setMessage("");
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !phone) return;

    setLoading(true);

    // Send via WhatsApp Web URL
    sendWhatsAppMessage(phone, message);

    // Callback for activity logging
    if (onSend) {
      onSend(message);
    }

    setLoading(false);
    setOpen(false);
    setMessage("");
    setTemplate("custom");
  };

  if (!phone) {
    return null;
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <MessageSquare className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Kirim WhatsApp
            </DialogTitle>
            <DialogDescription>
              Kirim pesan ke {customerName} ({phone})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pesan</label>
              <Textarea
                placeholder="Tulis pesan Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {message.length} karakter
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
              )}
              Kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
