"use client";
import {useHydrated} from '@/components/hooks/use-hydrated';
import { useRef, useState } from "react";
import { contactTopics } from "../config/contact";
import { validateContactMessage, type ContactMessage } from "../utils/contact-message";
import {submitContact} from '../services/contact-api';
import {errorMessage} from '@/lib/http';
const initialMessage: ContactMessage = { name: "", email: "", phone: "", store: "", topic: "store", message: "", consent: false };
export function ContactForm() {
  const ready=useHydrated(),writing=useRef(false);
  const [values, setValues] = useState(initialMessage);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactMessage, string>>>({});
  const [isPrepared, setPrepared] = useState(false);
  const [pending,setPending]=useState(false),[submissionError,setSubmissionError]=useState(''),[submissionId,setSubmissionId]=useState('');
  const formRef = useRef<HTMLFormElement>(null);
  function update<K extends keyof ContactMessage>(key: K, value: ContactMessage[K]) {
    setValues(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
    setPrepared(false);
  }
  return <form ref={formRef} id="contact-form" className="contact-card contact-form" inert={!ready?true:undefined} aria-busy={!ready||pending} noValidate onSubmit={async event => {
    event.preventDefault();
    const nextErrors = validateContactMessage(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    if(!ready||writing.current)return;writing.current=true;setPending(true);setSubmissionError('');try{const result=await submitContact(values);setSubmissionId(result.id);setPrepared(true);}catch(error){setSubmissionError(errorMessage(error));}finally{writing.current=false;setPending(false);}
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
    <button className="public-button contact-submit" disabled={!ready||pending||isPrepared} type="submit">{pending?'Gönderiliyor…':'Mesajı Gönder'} <span aria-hidden="true">→</span></button>
    <small className="contact-muted contact-demo">Talebiniz kaydedilir ve destek ekibinin incelemesini bekler.</small>
    {submissionError&&<p role="alert" className="contact-error">{submissionError}</p>}
    {isPrepared && <div className="contact-prepared" role="status"><b>Mesajınız kaydedildi.</b><p>Talep numarası: {submissionId}. E-posta teslimi veya yanıt süresi bu kayıtla garanti edilmez.</p><button type="button" onClick={() => { setPrepared(false); formRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus(); }}>Mesajı Düzenle</button></div>}
  </form>;
}
