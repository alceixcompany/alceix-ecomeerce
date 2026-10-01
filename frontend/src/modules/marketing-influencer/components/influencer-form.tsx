"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export function InfluencerForm({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Başvuru sistemi henüz aktif değil. Başvurunuz gönderilmedi. Influencer ekibimize influencer@alceix.com adresinden ulaşabilirsiniz.");
  }

  return <form id={id} className={className} onSubmit={handleSubmit}>
    {children}
    {message && <p role="status" className="rounded-xl bg-surface-container p-4 text-body-sm text-on-surface">{message} <a className="font-semibold underline" href="mailto:influencer@alceix.com">E-posta ile iletişime geçin</a></p>}
  </form>;
}
