"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useOperations } from "../components/operations-provider";
import { Empty, Field, Heading, useFilters } from "../components/ui";
import { errorMessage } from "@/lib/http";
import {
  loadPlatformTickets,
  loadPlatformTicket,
  replyPlatformTicket,
  statusPlatformTicket,
  downloadPlatformAttachment,
  type PlatformTicket,
} from "../services/support-api";
const sourceLabels = {
  store: "Mağaza",
  supplier: "Tedarikçi",
  creator: "Influencer",
  buyer: "Alışveriş Müşterisi",
};
export function PlatformSupport() {
  const { params } = useFilters(),
    [tickets, setTickets] = useState<PlatformTicket[]>([]),
    [selected, setSelected] = useState<PlatformTicket | null>(null),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [ready, setReady] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [reload, setReload] = useState(0);
  const writing = useRef(false),
    attempt = useRef<{ ticket: string; text: string; id: string } | null>(null);
  const queryString = params.toString(),
    q = params.get("q") || "",
    status = params.get("status") || "all";
  useEffect(() => {
    const controller = new AbortController();
    setReady(false);
    const timer = setTimeout(() => {
      const input = new URLSearchParams(queryString),
        query = new URLSearchParams({ limit: "8" });
      for (const key of ["q", "status", "page"]) {
        const value = input.get(key);
        if (value) query.set(key, value);
      }
      loadPlatformTickets(query, controller.signal)
        .then(async (result) => {
          const id = input.get("ticket"),
            storeId = input.get("store");
          const ticket = id
            ? (result.items.find((item) => item.id === id) ??
              (storeId
                ? await loadPlatformTicket(storeId, id, controller.signal)
                : null))
            : (result.items[0] ?? null);
          if (controller.signal.aborted) return;
          setTickets(result.items);
          setSelected(ticket);
          setTotal(result.total);
          setPage(result.page);
          setPages(result.pages);
          setReady(true);
          setError("");
        })
        .catch((error) => {
          if (!controller.signal.aborted) setError(errorMessage(error));
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [queryString, reload]);
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    next.delete("ticket");
    next.delete("store");
    if (key !== "page") next.delete("page");
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (next.size ? `?${next}` : ""),
    );
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || writing.current) return;
    const form = event.currentTarget,
      fields = new FormData(form),
      text = String(fields.get("reply") || "").trim(),
      status = String(fields.get("status")) as PlatformTicket["status"];
    writing.current = true;
    setPending(true);
    setError("");
    setNotice("");
    let current = selected;
    try {
      if (text) {
        if (
          attempt.current?.ticket !== selected.id ||
          attempt.current.text !== text
        )
          attempt.current = {
            ticket: selected.id,
            text,
            id: crypto.randomUUID(),
          };
        current = await replyPlatformTicket(current, text, attempt.current.id);
        setSelected(current);
        setTickets((items) =>
          items.map((item) => (item.id === current.id ? current : item)),
        );
        attempt.current = null;
        (form.elements.namedItem("reply") as HTMLTextAreaElement).value = "";
      }
      if (status !== selected.status) {
        current = await statusPlatformTicket(current, status);
        setSelected(current);
        setTickets((items) =>
          items.map((item) => (item.id === current.id ? current : item)),
        );
      }
      setNotice("Yanıt ve durum destek kaydına işlendi.");
      setReload((value) => value + 1);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      writing.current = false;
      setPending(false);
    }
  }
  async function download(ticket: PlatformTicket, id: string, name: string) {
    try {
      const file = await downloadPlatformAttachment(ticket, id),
        url = URL.createObjectURL(file),
        link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <>
      <Heading
        title="Destek Talepleri & Şikayet Merkezi"
        description="Mağazaların platform destek taleplerini gerçek kayıtlar üzerinden yönet."
      >
        <Link className="ad-button" href="/admin/canli-destek">
          Canlı Destek Masası →
        </Link>
      </Heading>
      <div className="pa-stats-compact">
        <b>{total}</b> Filtrelenen Platform Talebi{" "}
        <b>{tickets.filter((ticket) => ticket.status !== "resolved").length}</b>{" "}
        Bu Sayfada Açık / Bekleyen <b>—</b> Alışveriş Müşterisi
      </div>
      <div className="pa-toolbar">
        <input
          aria-label="Destek ara"
          placeholder="Talep, müşteri veya konu…"
          value={q}
          onChange={(event) => filter("q", event.target.value)}
        />
        <select aria-label="Talep kaynağı" value="store" disabled>
          <option value="store">Mağaza Platform Talepleri</option>
        </select>
        <select
          aria-label="Talep durumu"
          value={status}
          onChange={(event) => filter("status", event.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="open">Açık</option>
          <option value="waiting">Bekliyor</option>
          <option value="resolved">Çözüldü</option>
        </select>
      </div>
      {error && (
        <p className="pa-error" role="alert">
          {error}{" "}
          <button onClick={() => setReload((value) => value + 1)}>
            Yeniden Dene
          </button>
        </p>
      )}
      {notice && (
        <p role="status" className="pa-note">
          {notice}
        </p>
      )}
      {!ready ? (
        <Empty>Talepler yükleniyor…</Empty>
      ) : (
        <div className="pa-support-grid">
          <section>
            <div className="ad-card pa-panel">
              {tickets.map((ticket) => (
                <button
                  className={`pa-ticket ${selected?.id === ticket.id ? "selected" : ""}`}
                  key={ticket.id}
                  onClick={() => {
                    const query = new URLSearchParams(params.toString());
                    query.set("ticket", ticket.id);
                    query.set("store", ticket.storeId);
                    window.history.replaceState(
                      null,
                      "",
                      window.location.pathname + `?${query}`,
                    );
                  }}
                >
                  <span className="pa-small">
                    Mağaza ·{" "}
                    {ticket.priority === "high" ? "Yüksek Öncelik" : "Normal"}
                  </span>
                  <strong>{ticket.subject}</strong>
                  <span>
                    {ticket.requester} ·{" "}
                    {ticket.status === "resolved"
                      ? "Çözüldü"
                      : ticket.status === "waiting"
                        ? "Bekliyor"
                        : "Açık"}
                  </span>
                </button>
              ))}
              {!tickets.length && <Empty>Bu filtrelerde talep yok.</Empty>}
            </div>
            <div className="pa-pagination">
              <span>
                {total} kayıt · Sayfa {page} / {pages}
              </span>
              <button
                className="ad-button light"
                disabled={page <= 1}
                onClick={() => filter("page", String(page - 1))}
              >
                Önceki
              </button>
              <button
                className="ad-button light"
                disabled={page >= pages}
                onClick={() => filter("page", String(page + 1))}
              >
                Sonraki
              </button>
            </div>
          </section>
          {selected && (
            <section
              className="ad-card pa-panel"
              key={`${selected.id}:${selected.version}`}
            >
              <h2>{selected.subject}</h2>
              <p className="pa-muted">
                {selected.requester} · {selected.category}
              </p>
              <p className="pa-note">Mağaza kimliği: {selected.storeId}</p>
              <div role="log" aria-label="Talep yazışmaları">
                {selected.messages.map((message) => (
                  <article className="pa-message" key={message.id}>
                    <strong>{message.name}</strong>
                    <p>{message.text}</p>
                    {message.attachments.map((file) => (
                      <button
                        key={file.id}
                        className="ad-button light"
                        onClick={() => download(selected, file.id, file.name)}
                      >
                        {file.name} ↓
                      </button>
                    ))}
                  </article>
                ))}
              </div>
              <form onSubmit={save}>
                <fieldset className="pa-form-fields" disabled={pending}>
                  <div className="pa-grid">
                    <Field label="Talep Durumu">
                      <select name="status" defaultValue={selected.status}>
                        <option value="open">Açık</option>
                        <option value="waiting">Bekliyor</option>
                        <option value="resolved">Çözüldü</option>
                      </select>
                    </Field>
                    <Field label="Öncelik">
                      <select
                        name="priority"
                        value={selected.priority}
                        disabled
                      >
                        <option value="normal">Normal</option>
                        <option value="high">Yüksek</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Sorumlu Çalışan">
                    <select disabled>
                      <option>Atama servisi henüz bağlı değil</option>
                    </select>
                  </Field>
                  <Field label="Dahili Not">
                    <textarea
                      disabled
                      placeholder="Dahili not kaydı henüz bağlı değil"
                    />
                  </Field>
                  <Field label="Destek Yanıtı">
                    <textarea
                      name="reply"
                      maxLength={4000}
                      disabled={selected.status === "resolved"}
                      placeholder={
                        selected.status === "resolved"
                          ? "Önce talebi yeniden açın."
                          : "Talebe verilecek yanıtı yaz…"
                      }
                    />
                  </Field>
                  <button className="ad-button">Yanıt & Durumu Kaydet</button>
                </fieldset>
              </form>
              <p className="pa-note">
                Yanıtlar MongoDB’ye kaydedilir ve mağazanın destek ekranında
                görünür. E-posta bildirimi, görev ataması ve dahili not servisi
                henüz bağlı değildir.
              </p>
            </section>
          )}
        </div>
      )}
    </>
  );
}
export function PlatformLive() {
  const { operations, commit, can, staff } = useOperations(),
    { params, set } = useFilters(),
    sessions = operations.live,
    session =
      sessions.find((s) => s.id === params.get("session")) ||
      sessions.find((s) => s.status === "waiting") ||
      sessions[0];
  function update(status: typeof session.status, reply = "") {
    if (!session || (session.status === "closed" && status !== "waiting"))
      return false;
    const next = {
      ...session,
      status,
      assignee: status === "active" ? staff.id : session.assignee,
      messages: [
        ...session.messages,
        ...(reply.trim()
          ? [
              {
                id: crypto.randomUUID(),
                sender: staff.name,
                body: reply.trim(),
              },
            ]
          : []),
      ],
    };
    return commit(
      {
        ...operations,
        live: sessions.map((s) => (s.id === session.id ? next : s)),
      },
      "live",
      `${session.name} canlı destek: ${status}`,
    );
  }
  return (
    <>
      <Heading
        title="Canlı Destek Masası"
        description="Gelen görüşmeleri sıraya al, operatöre bağla ve destek geçmişini takip et."
      />
      <div className="pa-stats-compact">
        <b>{sessions.filter((s) => s.status === "waiting").length}</b> Sırada{" "}
        <b>{sessions.filter((s) => s.status === "active").length}</b> Aktif{" "}
        <b>{sessions.filter((s) => s.status === "closed").length}</b> Kapatıldı
      </div>
      <div className="pa-support-grid">
        <section className="ad-card pa-panel">
          <h2>Görüşme Kuyruğu</h2>
          {sessions.map((s) => (
            <button
              className={`pa-ticket ${session?.id === s.id ? "selected" : ""}`}
              key={s.id}
              onClick={() => set("session", s.id)}
            >
              <strong>{s.name}</strong>
              <span>
                {sourceLabels[s.source]} ·{" "}
                {s.status === "waiting"
                  ? "Sırada"
                  : s.status === "active"
                    ? "Görüşmede"
                    : "Kapatıldı"}
              </span>
              <span>{s.subject}</span>
            </button>
          ))}
        </section>
        {session && (
          <section className="ad-card pa-panel">
            <h2>
              {session.name} · {session.subject}
            </h2>
            <p className="pa-muted">
              Operatör:{" "}
              {operations.staff.find((s) => s.id === session.assignee)?.name ||
                "Atanmamış"}
            </p>
            <div className="pa-actions">
              <button
                className="ad-button"
                disabled={!can("live", true) || session.status !== "waiting"}
                onClick={() => update("active")}
              >
                Görüşmeyi Üstlen
              </button>
              <button
                className="ad-button light"
                disabled={!can("live", true) || session.status !== "active"}
                onClick={() => update("closed")}
              >
                Görüşmeyi Kapat
              </button>
              {session.status === "closed" && (
                <button
                  className="ad-button light"
                  disabled={!can("live", true)}
                  onClick={() => update("waiting")}
                >
                  Yeniden Sıraya Al
                </button>
              )}
            </div>
            <div role="log" aria-label="Canlı destek mesajları">
              {session.messages.map((m) => (
                <article className="pa-message" key={m.id}>
                  <strong>{m.sender}</strong>
                  <p>{m.body}</p>
                </article>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (update("active", String(f.get("message") || "")))
                  e.currentTarget.reset();
              }}
            >
              <Field label="Canlı Destek Yanıtı">
                <textarea
                  name="message"
                  maxLength={4000}
                  required
                  disabled={session.status !== "active" || !can("live", true)}
                  placeholder="Yanıtınızı yazın…"
                />
              </Field>
              <button
                className="ad-button"
                disabled={session.status !== "active" || !can("live", true)}
              >
                Demo Yanıtı Kaydet
              </button>
            </form>
            <p className="pa-note">
              Bu bir görüşme akışı demosudur. Gerçek ziyaretçi bağlantısı, anlık
              mesaj iletimi ve çevrimiçi operatör servisi bağlı değildir.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
