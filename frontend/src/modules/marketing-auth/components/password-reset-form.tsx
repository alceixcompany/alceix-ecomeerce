"use client";
import { useHydrated } from "@/components/hooks/use-hydrated";
import Link from "next/link";
import { useRef, useState } from "react";
import { resetPassword } from "../services/auth-api";
import { errorMessage } from "@/lib/http";
import { routes } from "@/config/routes";
export function PasswordResetForm({ token }: { token: string }) {
  const ready = useHydrated();
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [done, setDone] = useState(false);
  const writing = useRef(false);
  const valid = /^[a-f0-9]{64}$/.test(token);
  return (
    <div className="auth-card">
      <Link className="auth-back" href={routes.login}>
        Girişe Dön
      </Link>
      <h2>Şifrenizi yenileyin</h2>
      {done ? (
        <div className="auth-message" role="status">
          Şifreniz yenilendi. Tüm eski oturumlar kapatıldı.{" "}
          <Link href={routes.login}>Giriş yapın</Link>
        </div>
      ) : valid ? (
        <form
          className="auth-form"
          inert={!ready ? true : undefined}
          onSubmit={async (event) => {
            event.preventDefault();
            if (writing.current) return;
            if (password.length < 8 || password.length > 128) {
              setError("Şifre 8–128 karakter olmalıdır.");
              return;
            }
            if (password !== confirm) {
              setError("Şifreler eşleşmiyor.");
              return;
            }
            writing.current = true;
            setPending(true);
            try {
              await resetPassword(token, password);
              setDone(true);
              setPassword("");
              setConfirm("");
            } catch (error) {
              setError(errorMessage(error));
            } finally {
              writing.current = false;
              setPending(false);
            }
          }}
        >
          <div className="auth-field">
            <label htmlFor="reset-password">Yeni şifre</label>
            <div className="auth-input">
              <input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="reset-confirm">Yeni şifre tekrar</label>
            <div className="auth-input">
              <input
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button className="public-button w-full" disabled={!ready || pending}>
            {pending ? "Kaydediliyor…" : "Şifreyi Yenile"}
          </button>
        </form>
      ) : (
        <p className="auth-error" role="alert">
          Bağlantı geçersiz.{" "}
          <Link href="/sifremi-unuttum">Yeni bağlantı isteyin.</Link>
        </p>
      )}
    </div>
  );
}
