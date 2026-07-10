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
import { useLanguage } from "@/components/language-provider";

interface WhatsAppButtonProps {
  phone: string;
  customerName: string;
  quotationNumber?: string;
  quotationTotal?: string;
  onSend?: (message: string) => void;
}

export function WhatsAppButton({
  phone,
  customerName,
  quotationNumber,
  quotationTotal,
  onSend,
}: WhatsAppButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState("custom");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const templates = [
    { value: "custom", label: t("whatsapp.customMessage") },
    { value: "greeting", label: t("whatsapp.greeting") },
    { value: "followUp", label: t("whatsapp.followUp") },
    { value: "quotation", label: t("whatsapp.quotation") },
    { value: "reminder", label: t("whatsapp.reminder") },
  ];

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    switch (value) {
      case "greeting":
        setMessage(messageTemplates.greeting(customerName));
        break;
      case "followUp":
        setMessage(messageTemplates.followUp(customerName, ""));
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
              {t("whatsapp.sendWhatsApp")}
            </DialogTitle>
            <DialogDescription>
              {t("whatsapp.sendMessageTo")} {customerName} ({phone})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("whatsapp.template")}</label>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("whatsapp.selectTemplate")} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((tp) => (
                    <SelectItem key={tp.value} value={tp.value}>
                      {tp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("whatsapp.message")}</label>
              <Textarea
                placeholder={t("whatsapp.writeMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {message.length} {t("common.characters")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
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
              {t("common.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
