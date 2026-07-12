import { formatPhoneForWhatsApp, messageTemplates } from "../whatsapp";

describe("WhatsApp utilities", () => {
  describe("formatPhoneForWhatsApp", () => {
    it("converts Indonesian phone starting with 0", () => {
      expect(formatPhoneForWhatsApp("08123456789")).toBe("628123456789");
    });

    it("keeps phone already starting with 62", () => {
      expect(formatPhoneForWhatsApp("628123456789")).toBe("628123456789");
    });

    it("adds 62 prefix for other formats", () => {
      expect(formatPhoneForWhatsApp("8123456789")).toBe("628123456789");
    });

    it("removes non-numeric characters", () => {
      expect(formatPhoneForWhatsApp("0812-345-6789")).toBe("628123456789");
      expect(formatPhoneForWhatsApp("+62 812 345 6789")).toBe("62628123456789");
    });
  });

  describe("messageTemplates", () => {
    it("greeting template includes customer name", () => {
      const msg = messageTemplates.greeting("Budi");
      expect(msg).toContain("Budi");
      expect(msg).toContain("Halo");
    });

    it("followUp template includes customer name and note", () => {
      const msg = messageTemplates.followUp("Siti", "Mohon follow up proposal");
      expect(msg).toContain("Siti");
      expect(msg).toContain("Mohon follow up proposal");
    });

    it("quotation template includes all parameters", () => {
      const msg = messageTemplates.quotation("Ahmad", "Q-001", "Rp 1.500.000");
      expect(msg).toContain("Ahmad");
      expect(msg).toContain("Q-001");
      expect(msg).toContain("Rp 1.500.000");
    });

    it("reminder template includes customer name and due date", () => {
      const msg = messageTemplates.reminder("Dewi", "15 Juli 2026");
      expect(msg).toContain("Dewi");
      expect(msg).toContain("15 Juli 2026");
    });
  });
});
