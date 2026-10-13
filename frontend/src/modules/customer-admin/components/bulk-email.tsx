"use client";
import { useEffect, useRef, useState } from "react";
import type { AdminStore } from "../mocks/dashboard";
import type { CustomerSegment } from "../types/customer";
import { errorMessage } from "@/lib/http";
import { useHydrated } from "@/components/hooks/use-hydrated";
import {
  createCommunicationDraft,
  loadCommunicationDrafts,
  loadCommunicationRecipients,
  type CommunicationDraft,
} from "../services/crm-api";
export function BulkEmail({ store }: { store: AdminStore }) {
  const ready = useHydrated(),
    dialog = useRef<HTMLDialogElement>(null),
    writing = useRef(false),
    request = useRef<{ payload: string; id: string } | null>(null);
  const [opened, setOpened] = useState(false),
    [jobs, setJobs] = useState<CommunicationDraft[]>([]),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [loaded, setLoaded] = useState(false);
  const [segment, setSegment] = useState<CustomerSegment>("cart"),
    [subject, setSubject] = useState("Sepetiniz sizi bekliyor!"),
    [body, setBody] = useState(
      "Merhaba {{ad}},\n{{magaza}} mağazamızdaki {{sepet}} tutarındaki sepetiniz sizi bekliyor. Ürünlerinizi inceleyip alışverişinizi tamamlayabilirsiniz.",
    ),
    [notice, setNotice] = useState("");
  const [audience, setAudience] = useState<Awaited<
    ReturnType<typeof loadCommunicationRecipients>
  > | null>(null);
  useEffect(() => {
    if (!opened) return;
    const controller = new AbortController();
    setLoaded(false);
    loadCommunicationDrafts(store.slug, "email", controller.signal)
      .then((result) => {
        setJobs(result.items);
        setLoaded(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, [store.slug, opened]);
  useEffect(() => {
    if (!opened) return;
    const controller = new AbortController();
    setAudience(null);
    loadCommunicationRecipients(store.slug, segment, controller.signal)
      .then(setAudience)
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, [store.slug, segment, opened]);
  const preview = audience?.items[0];
  const personalized = preview
    ? body
        .replaceAll("{{ad}}", preview.name)
        .replaceAll("{{magaza}}", store.name)
        .replaceAll("{{sepet}}", "—")
    : "";
  return (
    <>
      <button
        className="co-secondary"
        disabled={!ready}
        onClick={() => {
          setOpened(true);
          dialog.current?.showModal();
        }}
      >
        Toplu E-posta · Sepet Kurtarma
      </button>
      <dialog
        ref={dialog}
        className="ad-dialog co-dialog"
        aria-labelledby="email-heading"
        onClose={() => setOpened(false)}
      >
        <div className="ad-dialog-heading">
          <h2 id="email-heading">Toplu E-posta Kampanyası</h2>
          <button
            autoFocus
            aria-label="E-posta penceresini kapat"
            disabled={pending}
            onClick={() => dialog.current?.close()}
          >
            ✕
          </button>
        </div>
        <p className="co-muted">
          İletişim izni bulunan müşteriler için kişiselleştirilmiş satış
          hatırlatmaları hazırlayın.
        </p>
        <form
          inert={pending}
          className="co-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (writing.current) return;
            writing.current = true;
            setPending(true);
            setError("");
            setNotice("");
            const input = {
                kind: "email" as const,
                segment,
                subject: subject.trim(),
                message: body.trim(),
              },
              payload = JSON.stringify(input);
            if (request.current?.payload !== payload)
              request.current = { payload, id: crypto.randomUUID() };
            try {
              const saved = await createCommunicationDraft(
                store.slug,
                input,
                request.current.id,
              );
              setJobs((current) =>
                [saved, ...current.filter((job) => job.id !== saved.id)].slice(
                  0,
                  5,
                ),
              );
              request.current = null;
              setNotice(
                "E-posta taslağı MongoDB’ye kaydedildi. Gönderim yapılmadı.",
              );
            } catch (error) {
              setError(errorMessage(error));
            } finally {
              writing.current = false;
              setPending(false);
            }
          }}
        >
          <label>
            Alıcı segmenti
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as CustomerSegment)}
            >
              <option value="cart">Sepetini Terk Edenler</option>
              <option value="vip">VIP Müşteriler</option>
              <option value="all">İzinli Tüm Müşteriler</option>
            </select>
          </label>
          <label>
            Konu
            <input
              maxLength={150}
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
          <label>
            E-posta metni
            <textarea
              rows={5}
              maxLength={3000}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <small className="co-muted">
            Kişiselleştirme: {"{{ad}}"} · {"{{magaza}}"} · {"{{sepet}}"}
          </small>
          <details open>
            <summary>
              {audience?.available ? audience.total : "—"} izinli alıcı ·
              Alıcıları İncele
            </summary>
            {!audience ? (
              <p role="status">Alıcılar yükleniyor…</p>
            ) : !audience.available ? (
              <p className="co-muted">
                Bu segment için sipariş ve sepet verileri henüz bağlı değil.
                Taslak kaydedilebilir.
              </p>
            ) : (
              audience.items.map((c) => (
                <div className="co-recipient" key={c.id}>
                  <strong>{c.name}</strong> · {c.email}
                  <small> · Sepet: —</small>
                </div>
              ))
            )}
            {audience?.available && (
              <small className="co-muted">
                İlk 10 izinli alıcı önizlenir; toplam sayı mağazanın tüm
                kayıtlarından hesaplanır.
              </small>
            )}
          </details>
          {preview && (
            <div className="co-summary">
              <h3>E-posta Önizlemesi · {preview.name}</h3>
              <strong style={{ fontSize: 16 }}>{subject}</strong>
              <p className="co-preview">{personalized}</p>
            </div>
          )}
          {error && (
            <p className="co-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="co-success" role="status">
              {notice}
            </p>
          )}
          <button className="ad-button" disabled={!ready || !loaded || pending}>
            {pending ? "Kaydediliyor…" : "E-posta Taslağını Kaydet"}
          </button>
          <div className="co-demo">
            İzin vermeyen kişiler önizlemeye dahil edilmez. Taslak kaydı bir
            gönderim kuyruğu oluşturmaz. Gerçek teslim, abonelikten çıkma ve
            sepet bağlantıları e-posta servisi bağlantısıyla çalışacak.
          </div>
        </form>
        <h3>Son E-posta Taslakları</h3>
        {jobs.map((j) => (
          <div className="co-row" key={j.id}>
            <div>
              <strong>{j.subject}</strong>
              <small>
                {j.segment} · {new Date(j.createdAt).toLocaleString("tr-TR")}
              </small>
            </div>
            <span className="co-badge">Taslak</span>
          </div>
        ))}
      </dialog>
    </>
  );
}
