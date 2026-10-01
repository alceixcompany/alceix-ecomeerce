"use client";
import { useHydrated } from "@/components/hooks/use-hydrated";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { submitAuth, forgotPassword } from "../services/auth-api";
import { errorMessage } from "@/lib/http";
import { routes } from "@/config/routes";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const ready=useHydrated();
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirm = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    if (register) {
      const password = form.elements.namedItem("password") as HTMLInputElement;
      const matches = password.value === confirm.current?.value;
      confirm.current?.setCustomValidity(matches ? "" : "Şifreler eşleşmiyor. Lütfen aynı şifreyi girin.");
      if (!matches) { form.reportValidity(); return; }
    }
    setIsSubmitting(true); setMessage("");
    try {
      const values = new FormData(form);
      const result = await submitAuth(register, { email: String(values.get("email") || ""), password: String(values.get("password") || ""), ...(register ? { name: String(values.get("name") || ""), store: String(values.get("store") || "") } : {}) });
      const next = new URLSearchParams(window.location.search).get("next");
      const allowed = next && result.stores.some(store => next === `/${store.slug}/admin` || next.startsWith(`/${store.slug}/admin/`)) && !next.includes("\\") && !next.includes("..") && !next.includes("?") && !next.includes("#");
      window.location.assign(allowed ? next : result.stores[0] ? `/${encodeURIComponent(result.stores[0].slug)}/admin` : "/");
    } catch (error) { setMessage(errorMessage(error)); } finally { setIsSubmitting(false); }
  }

  return <div className="auth-card">
    <nav className="auth-tabs" aria-label="Hesap işlemleri"><Link href={routes.login} aria-current={!register ? "page" : undefined}>Giriş Yap</Link><Link href={routes.register} aria-current={register ? "page" : undefined}>Kayıt Ol</Link></nav>
    <h2>{register ? "Birlikte başlayalım." : "Tekrar hoş geldiniz."}</h2>
    <p className="auth-subtitle">{register ? "Bilgilerinizi girin, e-ticaret yolculuğunuzun ilk adımını atın." : "Mağazanızı ve iş birliklerinizi yönetmek için giriş yapın."}</p>
    <form ref={formRef} inert={!ready} className="auth-form" onSubmit={handleSubmit}>
      {register && <><div className="auth-field"><label htmlFor="auth-name">Ad Soyad</label><div className="auth-input"><input id="auth-name" name="name" autoComplete="name" required placeholder="Adınız ve soyadınız" /></div></div><div className="auth-field"><label htmlFor="auth-store">Mağaza Adı</label><div className="auth-input"><input id="auth-store" name="store" autoComplete="organization" required placeholder="Markanızın veya mağazanızın adı" /></div></div></>}
      <div className="auth-field"><label htmlFor="auth-email">E-posta Adresi</label><div className="auth-input"><input id="auth-email" name="email" type="email" autoComplete="email" required placeholder="ornek@eposta.com" /></div></div>
      <div className="auth-field"><label htmlFor="auth-password">Şifre</label><div className="auth-input"><input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength={register ? 8 : undefined} required aria-describedby={register ? "auth-password-hint" : undefined} placeholder={register ? "En az 8 karakter" : "Şifrenizi girin"} onChange={() => confirm.current?.setCustomValidity("")} /><button type="button" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><span className="material-symbols-outlined text-[20px]" aria-hidden="true">{showPassword ? "visibility_off" : "visibility"}</span></button></div>{register && <small id="auth-password-hint">Şifreniz en az 8 karakterden oluşmalıdır.</small>}</div>
      {register && <div className="auth-field"><label htmlFor="auth-confirm">Şifre Tekrarı</label><div className="auth-input"><input ref={confirm} id="auth-confirm" name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" required placeholder="Şifrenizi tekrar girin" onChange={(event) => event.currentTarget.setCustomValidity("")} /></div></div>}
      {!register && <button className="auth-forgot" type="button" disabled={isSubmitting} onClick={async () => { const field = formRef.current?.elements.namedItem("email"); if (!(field instanceof HTMLInputElement) || !field.reportValidity()) return; setIsSubmitting(true); try { setMessage((await forgotPassword(field.value)).message); } catch(error) { setMessage(errorMessage(error)); } finally { setIsSubmitting(false); } }}>Şifremi Unuttum</button>}
      <button className="public-button w-full mt-1" type="submit" disabled={isSubmitting}>{register ? "Ücretsiz Hesap Oluştur" : "Giriş Yap"}<span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span></button>
      {message && <div className="auth-message" role="status">{message} <a href="mailto:destek@alceix.com">Destek ekibine yazın</a></div>}
    </form>
    <p className="auth-card-foot">{register ? "Zaten hesabınız var mı? " : "Henüz hesabınız yok mu? "}<Link href={register ? routes.login : routes.register}>{register ? "Giriş yapın" : "Ücretsiz kayıt olun"}</Link></p>
  </div>;
}
