"use client";
import { useState, type FormEvent, type ReactNode } from "react";
export function ApplicationForm({ children, className }: { children: ReactNode; className?: string }) {
 const [message, setMessage] = useState("");
 function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage("Başvuru sistemi henüz aktif değil. Bilgi almak için destek@alceix.com adresinden bize ulaşabilirsiniz."); }
 return <form className={className} onSubmit={handleSubmit}>{children}{message && <p role="status" className="rounded-xl bg-surface-container p-3 text-body-sm text-on-surface">{message}</p>}</form>;
}
