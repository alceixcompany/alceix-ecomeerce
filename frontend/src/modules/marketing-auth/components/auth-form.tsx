"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { routes } from "@/config/routes";
import {referralIssue} from "../utils/auth-validation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [referral,setReferral]=useState("");
  const [referralError,setReferralError]=useState("");
  useEffect(()=>{if(!register)return;const code=new URLSearchParams(window.location.search).get('ref')||'';if(code&&!referralIssue(code))setReferral(code.trim().toUpperCase());},[register]);
  const confirm = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (register) {
      const issue=referralIssue(referral);setReferralError(issue);if(issue)return;
      const password = form.elements.namedItem("password") as HTMLInputElement;
      const matches = password.value === confirm.current?.value;
      confirm.current?.setCustomValidity(matches ? "" : "Şifreler eşleşmiyor. Lütfen aynı şifreyi girin.");
      if (!matches) { form.reportValidity(); return; }
    }
    setMessage(register ? "Kayıt sistemi henüz aktif değil. Hesabınız oluşturulmadı. Başlangıç için destek ekibimize ulaşabilirsiniz." : "Giriş sistemi henüz aktif değil. Oturum açılmadı. Hesabınızla ilgili destek ekibimize ulaşabilirsiniz.");
  }

  return <div className="auth-card">
    <nav className="auth-tabs" aria-label="Hesap işlemleri"><Link href={routes.login} aria-current={!register ? "page" : undefined}>Giriş Yap</Link><Link href={routes.register} aria-current={register ? "page" : undefined}>Kayıt Ol</Link></nav>
    <h2>{register ? "Birlikte başlayalım." : "Tekrar hoş geldiniz."}</h2>
    <p className="auth-subtitle">{register ? "Bilgilerinizi girin, e-ticaret yolculuğunuzun ilk adımını atın." : "Mağazanızı ve iş birliklerinizi yönetmek için giriş yapın."}</p>
    <form className="auth-form" onSubmit={handleSubmit}>
      {register && <><div className="auth-field"><label htmlFor="auth-name">Ad Soyad</label><div className="auth-input"><input id="auth-name" name="name" autoComplete="name" required placeholder="Adınız ve soyadınız" /></div></div><div className="auth-field"><label htmlFor="auth-store">Mağaza Adı</label><div className="auth-input"><input id="auth-store" name="store" autoComplete="organization" required placeholder="Markanızın veya mağazanızın adı" /></div></div></>}
      <div className="auth-field"><label htmlFor="auth-email">E-posta Adresi</label><div className="auth-input"><input id="auth-email" name="email" type="email" autoComplete="email" required placeholder="ornek@eposta.com" /></div></div>
      <div className="auth-field"><label htmlFor="auth-password">Şifre</label><div className="auth-input"><input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength={register ? 8 : undefined} required aria-describedby={register ? "auth-password-hint" : undefined} placeholder={register ? "En az 8 karakter" : "Şifrenizi girin"} onChange={() => confirm.current?.setCustomValidity("")} /><button type="button" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><span className="material-symbols-outlined text-[20px]" aria-hidden="true">{showPassword ? "visibility_off" : "visibility"}</span></button></div>{register && <small id="auth-password-hint">Şifreniz en az 8 karakterden oluşmalıdır.</small>}</div>
      {register && <div className="auth-field"><label htmlFor="auth-confirm">Şifre Tekrarı</label><div className="auth-input"><input ref={confirm} id="auth-confirm" name="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" required placeholder="Şifrenizi tekrar girin" onChange={(event) => event.currentTarget.setCustomValidity("")} /></div></div>}
      {register&&<div className="auth-field"><label htmlFor="auth-referral">Referans Kodu <span className="auth-optional">(İsteğe bağlı)</span></label><div className="auth-input"><input id="auth-referral" name="referral" maxLength={32} autoComplete="off" placeholder="Örn. ALCEIX-2026" value={referral} aria-invalid={!!referralError} aria-describedby={referralError?'auth-referral-error':'auth-referral-hint'} onChange={event=>{setReferral(event.target.value);setReferralError('');setMessage('');}} onBlur={()=>{setReferral(referral.trim().toUpperCase());setReferralError(referralIssue(referral));}}/></div>{referralError?<small id="auth-referral-error" className="auth-error" role="alert">{referralError}</small>:<small id="auth-referral-hint">Size Alceix’i öneren kişinin kodu varsa ekleyebilirsiniz.</small>}</div>}
      {!register && <Link className="auth-forgot" href={routes.forgotPassword}>Şifremi Unuttum</Link>}
      <button className="public-button w-full mt-1" type="submit">{register ? "Ücretsiz Hesap Oluştur" : "Giriş Yap"}<span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span></button>
      {message && <div className="auth-message" role="status">{message} <a href="mailto:destek@alceix.com">Destek ekibine yazın</a></div>}
    </form>
    <p className="auth-card-foot">{register ? "Zaten hesabınız var mı? " : "Henüz hesabınız yok mu? "}<Link href={register ? routes.login : routes.register}>{register ? "Giriş yapın" : "Ücretsiz kayıt olun"}</Link></p>
  </div>;
}
