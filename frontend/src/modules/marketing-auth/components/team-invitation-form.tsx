"use client";
import { useHydrated } from "@/components/hooks/use-hydrated";
import Link from "next/link";
import { useRef, useState } from "react";
import { acceptTeamInvitation } from "@/modules/customer-admin";
import { ApiError, errorMessage } from "@/lib/http";
export function TeamInvitationForm({ token }: { token: string }) {
  const ready = useHydrated();
  const [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [storeSlug, setStoreSlug] = useState(""),
    [login, setLogin] = useState(false);
  const writing = useRef(false);
  const valid = /^[a-f0-9]{64}$/.test(token);
  const path = `/ekip-daveti?${new URLSearchParams({ token })}`;
  return (
    <div className="auth-card">
      <h2>Mağaza Ekip Daveti</h2>
      {storeSlug ? (
        <div className="auth-message" role="status">
          Davet kabul edildi.{" "}
          <Link href={`/${encodeURIComponent(storeSlug)}/admin`}>
            Mağaza Yönetimini Aç
          </Link>
        </div>
      ) : (
        <>
          <p className="auth-subtitle">
            Davet edilen e-posta adresine ait hesabınızla giriş yaptıktan sonra
            daveti kabul edin.
          </p>
          {!valid && (
            <p className="auth-error" role="alert">
              Davet bağlantısı geçersiz.
            </p>
          )}
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          {login && (
            <div><Link href={`/giris-yap?${new URLSearchParams({ next: path })}`}>
              Giriş Yap
            </Link>{" · "}<Link href={`/kayit-ol?${new URLSearchParams({next: path})}`}>Mağaza açmadan kayıt ol</Link></div>
          )}
          <button
            className="public-button w-full"
            disabled={!ready || !valid || pending}
            onClick={async () => {
              if (writing.current) return;
              writing.current = true;
              setPending(true);
              try {
                const result = await acceptTeamInvitation(token);
                setStoreSlug(result.slug);
              } catch (error) {
                setError(errorMessage(error));
                setLogin(error instanceof ApiError && error.status === 401);
              } finally {
                writing.current = false;
                setPending(false);
              }
            }}
          >
            {pending ? "İşleniyor…" : "Daveti Kabul Et"}
          </button>
        </>
      )}
    </div>
  );
}
