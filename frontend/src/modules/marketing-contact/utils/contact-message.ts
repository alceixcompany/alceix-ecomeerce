import { contact, contactTopics } from "../config/contact";
export type ContactMessage = { name: string; email: string; phone: string; store: string; topic: string; message: string; consent: boolean };
export function validateContactMessage(values: ContactMessage) {
  const errors: Partial<Record<keyof ContactMessage, string>> = {};
  if (values.name.trim().length < 2 || values.name.trim().length > 100) errors.name = "Adınızı ve soyadınızı yazın (2–100 karakter).";
  if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Geçerli bir e-posta adresi yazın.";
  if (values.phone.trim() && !/^\+?[\d\s()-]{7,25}$/.test(values.phone.trim())) errors.phone = "Geçerli bir telefon numarası yazın veya alanı boş bırakın.";
  if (values.store.length > 200) errors.store = "Mağaza adresi en fazla 200 karakter olabilir.";
  if (!contactTopics.some(topic => topic.value === values.topic)) errors.topic = "Bir iletişim konusu seçin.";
  if (values.message.trim().length < 20 || values.message.length > 3000) errors.message = "Mesajınızı 20–3000 karakter arasında yazın.";
  if (!values.consent) errors.consent = "Talebiniz için sizinle iletişim kurulmasını onaylayın.";
  return errors;
}
export function contactMailto(values: ContactMessage) {
  const topic = contactTopics.find(topic => topic.value === values.topic)?.label ?? "İletişim";
  const body = [`Ad Soyad: ${values.name.trim()}`, `E-posta: ${values.email.trim()}`, `Telefon: ${values.phone.trim() || "Belirtilmedi"}`, `Mağaza: ${values.store.trim() || "Belirtilmedi"}`, "", values.message.trim()].join("\n");
  return `mailto:${contact.email}?subject=${encodeURIComponent(`Alceix · ${topic}`)}&body=${encodeURIComponent(body)}`;
}
