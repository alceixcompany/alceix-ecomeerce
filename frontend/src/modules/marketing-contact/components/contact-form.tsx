"use client";
import { useRef, useState } from "react";
import { contactTopics } from "../config/contact";
import { contactMailto, validateContactMessage, type ContactMessage } from "../utils/contact-message";
const initialMessage: ContactMessage = { name: "", email: "", phone: "", store: "", topic: "store", message: "", consent: false };
export function ContactForm() {
  const [values, setValues] = useState(initialMessage);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactMessage, string>>>({});
  const [isPrepared, setPrepared] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  function update<K extends keyof ContactMessage>(key: K, value: ContactMessage[K]) {
    setValues(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
    setPrepared(false);
  }
  return <form ref={formRef} id="contact-form" className="contact-card contact-form" noValidate onSubmit={event => {
    event.preventDefault();
    const nextErrors = validateContactMessage(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setPrepared(true);
  }}>
    <span className="contact-tag">Doğru ekiple iletişime geçin</span><h2>Bize Mesaj Gönderin</h2><p>Hedeflerinizi paylaşın, ilk adımı birlikte planlayalım.</p>
    <div className="contact-fields">{([
      ["name", "Ad & Soyad", "Adınız ve soyadınız", "text", 100],
      ["email", "E-posta Adresi", "ornek@firma.com", "email", 254],
      ["phone", "Telefon Numarası (isteğe bağlı)", "+90 5•• ••• •• ••", "tel", 25],
      ["store", "Mağaza Adresi (isteğe bağlı)", "Mağazanızın adı veya web adresi", "text", 200],
    ] as const).map(([key, label, placeholder, type, maxLength]) => <label key={key} htmlFor={`contact-${key}`}>{label}{(key === "name" || key === "email") && <span className="contact-required"> *</span>}<input id={`contact-${key}`} name={key} type={type} maxLength={maxLength} placeholder={placeholder} value={values[key]} autoComplete={key === "name" ? "name" : key === "email" ? "email" : key === "phone" ? "tel" : "url"} onChange={event => update(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} />{errors[key] && <small className="contact-error" id={`error-${key}`}>{errors[key]}</small>}</label>)}</div>
    <fieldset><legend>İletişim Konusu</legend><div className="contact-topics">{contactTopics.map(topic => <label key={topic.value} className={values.topic === topic.value ? "is-selected" : ""}><input type="radio" name="topic" value={topic.value} checked={values.topic === topic.value} onChange={() => update("topic", topic.value)} /><span><b>{topic.label}</b><small>İlgili ekibe yönlendirin</small></span></label>)}</div></fieldset>
    <label htmlFor="contact-message">Mesajınız <span className="contact-required">*</span><textarea id="contact-message" name="message" rows={5} maxLength={3000} placeholder="İhtiyacınızı, hedefinizi veya yaşadığınız sorunu anlatın…" value={values.message} onChange={event => update("message", event.target.value)} aria-invalid={!!errors.message} aria-describedby="message-help" /><small id="message-help" className={errors.message ? "contact-error" : "contact-muted"}>{errors.message || `${values.message.length} / 3000 · Şifre veya ödeme bilgisi paylaşmayın.`}</small></label>
    <label className="contact-consent"><input type="checkbox" checked={values.consent} onChange={event => update("consent", event.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "error-consent" : undefined} /><span>Talebim hakkında verdiğim iletişim bilgileri üzerinden benimle iletişim kurulmasını onaylıyorum.</span></label>{errors.consent && <small id="error-consent" className="contact-error">{errors.consent}</small>}
    <button className="public-button contact-submit" type="submit">Mesaj Taslağını Hazırla <span aria-hidden="true">→</span></button>
    <small className="contact-muted contact-demo">Form otomatik gönderim yapmaz; taslağınızı e-posta uygulamanızda gönderebilirsiniz.</small>
    {isPrepared && <div className="contact-prepared" role="status"><b>Mesaj taslağınız hazır.</b><p>Henüz gönderilmedi. E-posta uygulamanızda kontrol ederek gönderin.</p><a href={contactMailto(values)} className="public-button">E-posta Uygulamasında Aç ↗</a><button type="button" onClick={() => { setPrepared(false); formRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus(); }}>Mesajı Düzenle</button></div>}
  </form>;
}
