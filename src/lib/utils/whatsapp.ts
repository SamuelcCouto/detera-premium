import { site } from "@/config/site";

/**
 * Monta o link do WhatsApp com a mensagem já escrita. O cliente só aperta
 * enviar — cada CTA do site manda um texto diferente, então a conversa já
 * começa sabendo de onde a pessoa veio e sobre o que quer falar.
 */
export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
