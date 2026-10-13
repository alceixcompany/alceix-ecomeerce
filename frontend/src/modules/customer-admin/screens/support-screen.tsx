"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { replaceLocalQuery } from "../utils/local-query";
import { AdminShell } from "../components/admin-shell";
import type { AdminStore } from "../mocks/dashboard";
import { supportCategories, supportGuides } from "../mocks/support";
import type { SupportAttachment, SupportTicket } from "../types/support";
import { attachmentIssue, canReply } from "../utils/support";
import { storeRoutes } from "@/config/store-routes";
import "../support.css";
function Icon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {name}
    </span>
  );
}
import {
  loadTickets,
  loadTicket,
  loadReplyDraft,
  saveReplyDraft,
  createTicket,
  replyTicket,
  statusTicket,
  uploadSupportAttachment,
  downloadSupportAttachment,
} from "../services/support-api";
import { errorMessage } from "@/lib/http";
const statusLabels = {
  open: "Açık",
  waiting: "Yanıt Bekliyor",
  resolved: "Çözüldü",
};
type Draft = { text: string; files: SupportAttachment[] };
type Mode =
  | "new"
  | "knowledge"
  | "guide"
  | "assistant"
  | "resolve"
  | "leave"
  | "whatsapp";
const date = (value: string) =>
  new Date(value).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export function SupportScreen({ store }: { store: AdminStore }) {
  const router = useRouter(),
    params = useSearchParams(),
    dialog = useRef<HTMLDialogElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]),
    [drafts, setDrafts] = useState<Record<string, Draft>>({}),
    [savedDrafts, setSavedDrafts] = useState<Record<string, Draft>>({}),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [loadingFile, setLoadingFile] = useState(false),
    [mode, setMode] = useState<Mode>("new"),
    [newDirty, setNewDirty] = useState(false),
    [discard, setDiscard] = useState(false),
    [guide, setGuide] = useState<(typeof supportGuides)[number]>(
      supportGuides[0],
    ),
    [guideQuery, setGuideQuery] = useState(""),
    [assistantQuestion, setAssistantQuestion] = useState(""),
    [assistantAnswer, setAssistantAnswer] = useState(""),
    [leaveHref, setLeaveHref] = useState("");
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: supportCategories[0],
    priority: "normal" as "normal" | "high",
    channel: "platform" as "platform" | "customer",
    requester: store.account?.name || store.name,
    text: "",
  });
  const [pending, setPending] = useState(false),
    [listPage, setListPage] = useState(1),
    [listPages, setListPages] = useState(1),
    [reload, setReload] = useState(0);
  const loadedDrafts = useRef(new Set<string>()),
    writing = useRef(false),
    replyAttempt = useRef<{
      ticket: string;
      text: string;
      files: string;
      id: string;
    } | null>(null);
  const [draftVersions, setDraftVersions] = useState<Record<string, number>>(
    {},
  );
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const queryString = params.toString();
  useEffect(() => {
    const controller = new AbortController();
    setReady(false);
    const timer = setTimeout(() => {
      const input = new URLSearchParams(queryString),
        query = new URLSearchParams();
      for (const field of ["channel", "q", "priority", "status", "page"]) {
        const value = input.get(field);
        if (value) query.set(field, value);
      }
      if (!query.has("channel")) query.set("channel", "platform");
      query.set("limit", "20");
      loadTickets(store.slug, query, controller.signal)
        .then(async (result) => {
          const ticketId = input.get("ticket");
          const detail = ticketId
            ? (result.items.find((ticket) => ticket.id === ticketId) ??
              (await loadTicket(store.slug, ticketId, controller.signal)))
            : null;
          if (controller.signal.aborted) return;
          setDetail(detail);
          setTickets(result.items);
          setListPage(result.page);
          setListPages(result.pages);
          setReady(true);
          setError("");
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setError(errorMessage(error));
            setNotice(errorMessage(error));
          }
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [store.slug, queryString, reload]);
  const dirty =
    JSON.stringify(drafts) !== JSON.stringify(savedDrafts) || newDirty;
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const channel = ["platform", "customer"].includes(params.get("channel") || "")
      ? params.get("channel")!
      : "platform",
    q = params.get("q") || "",
    priority = ["high", "normal"].includes(params.get("priority") || "")
      ? params.get("priority")!
      : "all",
    status = ["open", "waiting", "resolved"].includes(
      params.get("status") || "",
    )
      ? params.get("status")!
      : "all";
  const filtered = tickets,
    selected = params.get("ticket") ? (detail ?? undefined) : filtered[0],
    draft = selected
      ? drafts[selected.id] || { text: "", files: [] }
      : { text: "", files: [] };
  const selectedId = selected?.id;
  const draftReady = !!selectedId && draftVersions[selectedId] !== undefined;
  useEffect(() => {
    if (!ready || !selectedId || loadedDrafts.current.has(selectedId)) return;
    const id = selectedId,
      controller = new AbortController();
    loadReplyDraft(store.slug, id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        loadedDrafts.current.add(id);
        setDraftVersions((current) => ({ ...current, [id]: result.version }));
        const draft = { text: result.text, files: result.attachments };
        setDrafts((current) =>
          current[id] ? current : { ...current, [id]: draft },
        );
        setSavedDrafts((current) => ({ ...current, [id]: draft }));
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, [store.slug, selectedId, ready]);
  function filter(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(name, value);
    else next.delete(name);
    if (name !== "ticket") next.delete("ticket");
    if (name !== "page") next.delete("page");
    replaceLocalQuery(
      `${storeRoutes.support(store.slug)}${next.size ? `?${next}` : ""}`,
    );
  }
  async function persist(next = tickets, nextDrafts = drafts) {
    if (writing.current || !ready) return false;
    writing.current = true;
    setPending(true);
    try {
      const changed = next.find(
        (ticket) =>
          ticket.status !==
          (
            tickets.find((current) => current.id === ticket.id) ??
            (detail?.id === ticket.id ? detail : undefined)
          )?.status,
      );
      if (changed) {
        const saved = await statusTicket(
          store.slug,
          changed.id,
          changed.version ?? 0,
          changed.status,
        );
        setTickets((current) =>
          current.map((ticket) => (ticket.id === saved.id ? saved : ticket)),
        );
        setDetail((current) => (current?.id === saved.id ? saved : current));
      }
      for (const [id, draft] of Object.entries(nextDrafts)) {
        if (
          JSON.stringify(draft) ===
          JSON.stringify(savedDrafts[id] ?? { text: "", files: [] })
        )
          continue;
        if (draftVersions[id] === undefined)
          throw new Error(
            "Yanıt taslağı yükleniyor. Biraz sonra tekrar deneyin.",
          );
        const saved = await saveReplyDraft(
          store.slug,
          id,
          draftVersions[id],
          draft.text,
          draft.files.map((file) => file.id),
        );
        const local = { text: saved.text, files: saved.attachments };
        setDraftVersions((current) => ({ ...current, [id]: saved.version }));
        setDrafts((current) => ({ ...current, [id]: local }));
        setSavedDrafts((current) => ({ ...current, [id]: local }));
      }
      setError("");
      return true;
    } catch (error) {
      setError(errorMessage(error));
      return false;
    } finally {
      writing.current = false;
      setPending(false);
    }
  }

  function changeDraft(next: Draft) {
    if (selected)
      setDrafts((current) => ({
        ...current,
        [selected.id]: { ...next, text: next.text.slice(0, 4000) },
      }));
  }
  function open(next: Mode) {
    setMode(next);
    setError("");
    setDiscard(false);
    dialog.current?.showModal();
  }
  function close() {
    if (mode === "new" && newDirty) {
      setDiscard(true);
      return;
    }
    dialog.current?.close();
  }
  function navigate(e: React.MouseEvent<HTMLAnchorElement>) {
    if (loadingFile) {
      e.preventDefault();
      setNotice("Dosya okunurken bir an bekleyin.");
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (dirty) {
      e.preventDefault();
      setLeaveHref(
        e.currentTarget.getAttribute("href") || storeRoutes.support(store.slug),
      );
      open("leave");
    }
  }
  async function send() {
    if (
      !selected ||
      !canReply(selected, draft.text, draft.files.length) ||
      !ready ||
      writing.current
    )
      return;
    writing.current = true;
    setPending(true);
    const text = draft.text.trim();
    if (
      !replyAttempt.current ||
      replyAttempt.current.ticket !== selected.id ||
      replyAttempt.current.text !== text ||
      replyAttempt.current.files !==
        draft.files.map((file) => file.id).join(",")
    )
      replyAttempt.current = {
        ticket: selected.id,
        text,
        files: draft.files.map((file) => file.id).join(","),
        id: crypto.randomUUID(),
      };
    try {
      const saved = await replyTicket(
        store.slug,
        selected.id,
        selected.version ?? 0,
        replyAttempt.current.id,
        text,
        draft.files.map((file) => file.id),
      );
      setTickets((current) =>
        current.map((t) => (t.id === saved.id ? saved : t)),
      );
      setDetail((current) => (current?.id === saved.id ? saved : current));
      replyAttempt.current = null;
      setError("");
      setNotice("Yanıt destek talebine kaydedildi.");
      try {
        const serverDraft = await loadReplyDraft(store.slug, selected.id);
        const local = {
          text: serverDraft.text,
          files: serverDraft.attachments,
        };
        setDraftVersions((current) => ({
          ...current,
          [selected.id]: serverDraft.version,
        }));
        setDrafts((current) => ({ ...current, [selected.id]: local }));
        setSavedDrafts((current) => ({ ...current, [selected.id]: local }));
      } catch {
        // The reply is committed. Invalidate the unknown draft revision before retrying reads.
        loadedDrafts.current.delete(selected.id);
        setDraftVersions((current) => {
          const next = { ...current };
          delete next[selected.id];
          return next;
        });
        setDrafts((current) => {
          const next = { ...current };
          delete next[selected.id];
          return next;
        });
        setSavedDrafts((current) => {
          const next = { ...current };
          delete next[selected.id];
          return next;
        });
        setError(
          "Yanıt kaydedildi ancak yanıt taslağı yenilenemedi. Taslak yeniden yükleniyor.",
        );
        setReload((current) => current + 1);
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      writing.current = false;
      setPending(false);
    }
  }

  async function upload(file?: File) {
    if (!file || !selected || loadingFile || pending) return;
    const ticketId = selected.id;
    if (draft.files.length >= 3) {
      setError("En fazla 3 dosya eklenebilir.");
      return;
    }
    const issue = attachmentIssue(file.type, file.size);
    if (issue) {
      setError(issue);
      return;
    }
    setLoadingFile(true);
    try {
      const attachment = await uploadSupportAttachment(store.slug, file);
      setDrafts((current) => {
        const existing = current[ticketId] || { text: "", files: [] };
        return {
          ...current,
          [ticketId]: {
            ...existing,
            files: [...existing.files, attachment].slice(0, 3),
          },
        };
      });
      setError("");
      setNotice("Ek dosyası yüklendi. Yanıt gönderildiğinde talebe bağlanır.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoadingFile(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function download(a: SupportAttachment) {
    try {
      const blob = await downloadSupportAttachment(store.slug, a.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = a.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(errorMessage(error));
    }
  }

  function exportThread() {
    if (!selected) return;
    const text = [
      selected.subject,
      `#${selected.id} · ${statusLabels[selected.status]}`,
      ...selected.messages.map(
        (m) =>
          `${m.name} · ${date(m.createdAt)}\n${m.text}\n${m.attachments.map((a) => `Ek: ${a.name}`).join("\n")}`,
      ),
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selected.id}-konusma.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Konuşma dökümü indirme isteği oluşturuldu.");
  }
  const overlay = (
    <dialog
      ref={dialog}
      className="ad-dialog sd-dialog"
      aria-labelledby="support-dialog-title"
      onCancel={(e) => {
        if (mode === "new" && newDirty) {
          e.preventDefault();
          setDiscard(true);
        }
      }}
    >
      <div className="ad-dialog-heading">
        <span className="ad-icon-box blue">
          <Icon name="support_agent" />
        </span>
        <button autoFocus aria-label="Destek penceresini kapat" onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      <h2 id="support-dialog-title">
        {
          {
            new: "Yeni Destek Talebi",
            knowledge: "S.S.S. & Bilgi Bankası",
            guide: guide.title,
            assistant: "Canlı Asistan · Demo",
            resolve: "Talebi Çözüldü Olarak Kapat",
            leave: "Kaydedilmemiş Yanıt Taslakları",
            whatsapp: "WhatsApp Destek Bilgisi",
          }[mode]
        }
      </h2>
      <p className="sd-muted">
        Talepler ve yanıtlar sunucuda saklanır. E-posta ve WhatsApp bildirimi
        henüz bağlı değildir.
      </p>
      {error && (
        <p role="alert" className="sd-error">
          {error}
        </p>
      )}
      {discard && (
        <div className="sd-warning">
          <p>Yeni talep formundaki değişiklikler bırakılacak.</p>
          <button onClick={() => setDiscard(false)}>Düzenlemeye Dön</button>
          <button
            onClick={() => {
              setNewDirty(false);
              setNewTicket({ ...newTicket, subject: "", text: "" });
              dialog.current?.close();
            }}
          >
            Değişiklikleri Bırak
          </button>
        </div>
      )}
      {mode === "new" && (
        <form
          inert={pending}
          onChange={() => setNewDirty(true)}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!ready || writing.current) return;
            if (!newTicket.subject.trim() || !newTicket.text.trim()) {
              setError("Konu ve açıklamayı doldurun.");
              return;
            }
            writing.current = true;
            setPending(true);
            try {
              const ticket = await createTicket(store.slug, {
                channel: newTicket.channel,
                category: newTicket.category,
                subject: newTicket.subject.trim(),
                priority: newTicket.priority,
                text: newTicket.text.trim(),
              });
              setTickets((current) => [ticket, ...current]);
              setNewDirty(false);
              dialog.current?.close();
              replaceLocalQuery(
                `${storeRoutes.support(store.slug)}?${new URLSearchParams({ channel: ticket.channel, ticket: ticket.id })}`,
              );
              setNewTicket({ ...newTicket, subject: "", text: "" });
              setReload((n) => n + 1);
              setNotice("Destek talebi kaydedildi.");
            } catch (error) {
              setError(errorMessage(error));
            } finally {
              writing.current = false;
              setPending(false);
            }
          }}
        >
          <label>
            Konu
            <input
              required
              maxLength={160}
              value={newTicket.subject}
              onChange={(e) =>
                setNewTicket({ ...newTicket, subject: e.target.value })
              }
            />
          </label>
          <div className="sd-fields">
            <label>
              Talep Türü
              <select
                value={newTicket.channel}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    channel: e.target.value as "platform" | "customer",
                  })
                }
              >
                <option value="platform">Alceix Platform Desteği</option>
                <option value="customer">Müşteri Destek Talebi</option>
              </select>
            </label>
            <label>
              Öncelik
              <select
                value={newTicket.priority}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    priority: e.target.value as "normal" | "high",
                  })
                }
              >
                <option value="normal">Normal</option>
                <option value="high">Yüksek Öncelik</option>
              </select>
            </label>
          </div>
          <label>
            Kategori
            <select
              value={newTicket.category}
              onChange={(e) =>
                setNewTicket({ ...newTicket, category: e.target.value })
              }
            >
              {supportCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Talep Sahibi
            <input
              readOnly
              maxLength={80}
              required
              value={newTicket.requester}
              onChange={(e) =>
                setNewTicket({ ...newTicket, requester: e.target.value })
              }
            />
          </label>
          <label>
            Açıklama
            <textarea
              rows={5}
              required
              maxLength={4000}
              value={newTicket.text}
              onChange={(e) =>
                setNewTicket({ ...newTicket, text: e.target.value })
              }
            />
          </label>
          <button
            className="ad-button"
            disabled={pending || !ready}
            type="submit"
          >
            Talebi Oluştur
          </button>
        </form>
      )}
      {mode === "knowledge" && (
        <div className="sd-knowledge">
          <label>
            Rehber Ara
            <input
              value={guideQuery}
              onChange={(e) => setGuideQuery(e.target.value)}
              placeholder="Kargo, bakiye, tedarikçi…"
            />
          </label>
          {supportGuides
            .filter((g) =>
              `${g.title} ${g.text}`
                .toLocaleLowerCase("tr-TR")
                .includes(guideQuery.toLocaleLowerCase("tr-TR")),
            )
            .map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGuide(g);
                  setMode("guide");
                }}
              >
                <Icon name={g.icon} />
                {g.title}
                <Icon name="chevron_right" />
              </button>
            ))}
          <Link href="/sss" onClick={navigate}>
            Tüm Sıkça Sorulan Sorular
            <Icon name="arrow_outward" />
          </Link>
        </div>
      )}
      {mode === "guide" && (
        <>
          <p>{guide.text}</p>
          <div className="sd-dialog-actions">
            <button
              className="sd-secondary"
              onClick={() => setMode("knowledge")}
            >
              Tüm Rehberler
            </button>
            <Link
              className="ad-button"
              href={storeRoutes[guide.route](store.slug)}
              onClick={navigate}
            >
              İlgili Modülü Aç
            </Link>
          </div>
        </>
      )}
      {mode === "assistant" && (
        <div className="sd-assistant">
          <p>
            Bu asistan yerel yardım rehberlerinden örnek yanıt sunar. Canlı
            operatör veya yapay zekâ servisi bağlı değildir.
          </p>
          <div>
            {supportGuides.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setAssistantQuestion(g.title);
                  setAssistantAnswer(g.text);
                }}
              >
                {g.title}
              </button>
            ))}
          </div>
          <form
            inert={pending}
            onSubmit={(e) => {
              e.preventDefault();
              const q = assistantQuestion.toLocaleLowerCase("tr-TR");
              const g = supportGuides.find((g) =>
                q.includes(
                  g.id === "shipping"
                    ? "kargo"
                    : g.id === "finance"
                      ? "bakiye"
                      : g.id === "supplier"
                        ? "tedarik"
                        : "vitrin",
                ),
              );
              setAssistantAnswer(
                g?.text ||
                  "Bu konu için Yeni Destek Talebi düğmesinden bir demo talep oluşturabilirsiniz. Bu yanıt yerel yardım örneğidir.",
              );
            }}
          >
            <label>
              Sorunuz
              <input
                maxLength={300}
                required
                value={assistantQuestion}
                onChange={(e) => setAssistantQuestion(e.target.value)}
              />
            </label>
            <button className="ad-button">Örnek Yanıtı Gör</button>
          </form>
          {assistantAnswer && (
            <p className="sd-assistant-answer" role="status">
              {assistantAnswer}
            </p>
          )}
        </div>
      )}
      {mode === "resolve" && (
        <>
          <p>
            #{selected?.id} çözüldü durumuna alınacak. Yanıt göndermek için
            tekrar açabilirsiniz.
          </p>
          {(draft.text || draft.files.length > 0) && (
            <p className="sd-warning">Gönderilmemiş yanıt taslağı korunacak.</p>
          )}
          <div className="sd-dialog-actions">
            <button className="sd-secondary" onClick={close}>
              Vazgeç
            </button>
            <button
              className="ad-button"
              onClick={async () => {
                if (
                  selected &&
                  (await persist([
                    ...tickets.filter((t) => t.id !== selected.id),
                    { ...selected, status: "resolved" },
                  ]))
                ) {
                  dialog.current?.close();
                  setNotice("Talep çözüldü olarak kapatıldı.");
                }
              }}
            >
              Kapatmayı Onayla
            </button>
          </div>
        </>
      )}
      {mode === "leave" && (
        <>
          <p>
            Yanıt taslaklarınızı kaydedip devam edebilirsiniz. Yeni talep
            formundaki gönderilmemiş alanlar bırakılır.
          </p>
          <div className="sd-dialog-actions">
            <button className="sd-secondary" onClick={close}>
              Sayfada Kal
            </button>
            <button
              className="sd-secondary"
              onClick={() => {
                setNewDirty(false);
                setDrafts(savedDrafts);
                dialog.current?.close();
                router.push(leaveHref);
              }}
            >
              Kaydetmeden Devam Et
            </button>
            <button
              className="ad-button"
              onClick={async () => {
                if (await persist()) {
                  setNewDirty(false);
                  dialog.current?.close();
                  router.push(leaveHref);
                }
              }}
            >
              Taslakları Kaydet & Devam Et
            </button>
          </div>
        </>
      )}
      {mode === "whatsapp" && (
        <>
          <p>
            WhatsApp Business entegrasyonu henüz bağlı değil. Bu düğme gerçek
            bir numaraya mesaj göndermez.
          </p>
          <button
            className="ad-button"
            onClick={() => {
              setMode("new");
              setNewDirty(false);
            }}
          >
            Destek Talebi Hazırla
          </button>
        </>
      )}
    </dialog>
  );
  return (
    <AdminShell
      store={store}
      active="support"
      overlay={overlay}
      onNavigate={navigate}
      onNotice={setNotice}
    >
      <header className="sd-heading">
        <div>
          <small>Yardım & İletişim / Destek Talepleri & Yardım Masası</small>
          <h1>Destek Talepleri & Yardım Masası</h1>
          <p>
            Mağazanızla ilgili talepleri ve müşterilerinizin destek
            konuşmalarını tek merkezden yönetin.
          </p>
        </div>
        <div>
          <button className="sd-secondary" onClick={() => open("knowledge")}>
            <Icon name="menu_book" />
            S.S.S. & Bilgi Bankası
          </button>
          <button
            className="sd-secondary green"
            onClick={() => open("assistant")}
          >
            Canlı Asistan Başlat
          </button>
          <button
            className="ad-button"
            disabled={!ready}
            onClick={() => open("new")}
          >
            <Icon name="add" />
            Yeni Destek Talebi Oluştur
          </button>
        </div>
      </header>
      <section className="sd-stats" aria-label="Destek özeti">
        {[
          {
            label: "Açık Talepler",
            value: `${tickets.filter((t) => t.status !== "resolved").length} Aktif Talep`,
            note: "Yüklenen sayfadaki talepler",
            icon: "inbox",
          },
          {
            label: "Yanıt Süresi",
            value: "Ölçüm Bekliyor",
            note: "Gerçek SLA veya süre ölçümü yok",
            icon: "timer",
          },
          {
            label: "Çözülen Talepler",
            value: `${tickets.filter((t) => t.status === "resolved").length} Çözüldü`,
            note: "Yüklenen sayfadaki kayıtlar",
            icon: "verified",
          },
          {
            label: "WhatsApp & Entegrasyon",
            value: "Bağlantı Bekliyor",
            note: "Mesaj gönderimi henüz bağlı değil",
            icon: "forum",
          },
        ].map((s) => (
          <article className="ad-card" key={s.label}>
            <span className="ad-icon-box blue">
              <Icon name={s.icon} />
            </span>
            <small>{s.label}</small>
            <strong>{s.value}</strong>
            <p>{s.note}</p>
          </article>
        ))}
      </section>
      <div className="sd-toolbar">
        <div role="group" aria-label="Destek kanalları">
          <button
            aria-pressed={channel === "platform"}
            onClick={() => filter("channel", "platform")}
          >
            <Icon name="inventory_2" />
            Alceix Platform Desteği{" "}
            <span>
              {
                tickets.filter(
                  (t) => t.channel === "platform" && t.status !== "resolved",
                ).length
              }
            </span>
          </button>
          <button
            aria-pressed={channel === "customer"}
            onClick={() => filter("channel", "customer")}
          >
            <Icon name="headset_mic" />
            Müşteri Destek Talepleri{" "}
            <span>
              {
                tickets.filter(
                  (t) => t.channel === "customer" && t.status !== "resolved",
                ).length
              }{" "}
              Aktif
            </span>
          </button>
        </div>
        <input
          aria-label="Destek taleplerinde ara"
          placeholder="Talep no, konu veya kişi ara…"
          value={q}
          onChange={(e) => filter("q", e.target.value)}
        />
        <select
          aria-label="Öncelik filtresi"
          value={priority}
          onChange={(e) => filter("priority", e.target.value)}
        >
          <option value="all">Öncelik: Tümü</option>
          <option value="high">Yüksek Öncelik</option>
          <option value="normal">Normal</option>
        </select>
        <select
          aria-label="Durum filtresi"
          value={status}
          onChange={(e) => filter("status", e.target.value)}
        >
          <option value="all">Durum: Tümü</option>
          <option value="open">Açık</option>
          <option value="waiting">Yanıt Bekliyor</option>
          <option value="resolved">Çözüldü</option>
        </select>
        <button
          className="sd-icon-button"
          aria-label="Destek filtrelerini temizle"
          onClick={() => replaceLocalQuery(storeRoutes.support(store.slug))}
        >
          <Icon name="filter_alt_off" />
        </button>
      </div>
      {error && (
        <p className="sd-error" role="alert">
          {error}{" "}
          <button onClick={() => setReload((n) => n + 1)}>Yeniden Dene</button>
        </p>
      )}
      <div className="sd-layout">
        <section className="sd-ticket-list" aria-label="Destek talepleri">
          {!ready ? (
            <p role="status">Talepler yükleniyor…</p>
          ) : (
            filtered.map((t) => (
              <button
                key={t.id}
                className={`ad-card sd-ticket${selected?.id === t.id ? " selected" : ""}`}
                onClick={() => filter("ticket", t.id)}
              >
                <div>
                  <small>
                    #{t.id.slice(0, 16)} · {t.category}
                  </small>
                  <span
                    className={`ad-pill ${t.status === "resolved" ? "green" : t.priority === "high" ? "orange" : "blue"}`}
                  >
                    {t.status === "resolved"
                      ? "Çözüldü"
                      : t.priority === "high"
                        ? "Yüksek Öncelik"
                        : "Normal"}
                  </span>
                </div>
                <strong>{t.subject}</strong>
                <p>{t.messages.at(-1)?.text}</p>
                <footer>
                  <span>
                    {t.requester} · {statusLabels[t.status]}
                  </span>
                  <small>
                    {date(t.messages.at(-1)?.createdAt || t.createdAt)}
                  </small>
                </footer>
              </button>
            ))
          )}
          {ready && !filtered.length && (
            <div className="sd-empty">
              <Icon name="search_off" />
              <h2>Talep bulunamadı</h2>
              <p>Filtreleri değiştirin veya yeni talep oluşturun.</p>
            </div>
          )}
          {listPages > 1 && (
            <div>
              <button
                disabled={listPage <= 1 || !ready}
                onClick={() => filter("page", String(listPage - 1))}
              >
                Önceki
              </button>
              <span>
                {listPage} / {listPages}
              </span>
              <button
                disabled={listPage >= listPages || !ready}
                onClick={() => filter("page", String(listPage + 1))}
              >
                Sonraki
              </button>
            </div>
          )}
        </section>
        <section
          className="ad-card sd-conversation"
          aria-label="Destek konuşması"
        >
          {selected ? (
            <>
              <header>
                <div>
                  <span className="ad-pill blue">
                    #{selected.id.slice(0, 16)}
                  </span>
                  <span className="ad-pill orange">{selected.category}</span>
                  <h2>{selected.subject}</h2>
                  <p>
                    {selected.requester} · {statusLabels[selected.status]}
                    {selected.orderId && (
                      <Link
                        href={storeRoutes.order(store.slug, selected.orderId)}
                        onClick={navigate}
                      >
                        Sipariş #{selected.orderId}
                        <Icon name="arrow_outward" />
                      </Link>
                    )}
                  </p>
                </div>
                <div>
                  <button
                    className="sd-icon-button"
                    aria-label="Konuşma dökümünü indir"
                    onClick={exportThread}
                  >
                    <Icon name="download" />
                  </button>
                  <button
                    className="sd-icon-button"
                    aria-label="Talep bağlantısını kopyala"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          `${location.origin}${storeRoutes.support(store.slug)}?${new URLSearchParams({ channel: selected.channel, ticket: selected.id })}`,
                        );
                        setNotice(
                          "Talep bağlantısı kopyalandı. Kayıt yalnızca yetkili oturumla açılabilir.",
                        );
                      } catch {
                        setNotice(
                          "Bağlantı kopyalanamadı; adres çubuğunu kullanabilirsiniz.",
                        );
                      }
                    }}
                  >
                    <Icon name="link" />
                  </button>
                </div>
              </header>
              <div className="sd-messages">
                {selected.messages.map((m) => (
                  <article
                    key={m.id}
                    className={`sd-message ${m.author === "merchant" ? "merchant" : "external"}`}
                  >
                    <small>
                      <span>{m.name}</span>
                      <time>{date(m.createdAt)}</time>
                    </small>
                    <p>{m.text}</p>
                    {m.attachments.map((a) => (
                      <button
                        key={a.id}
                        className="sd-attachment"
                        onClick={() => download(a)}
                      >
                        <Icon name="attach_file" />
                        {a.name}
                        <small>{Math.round(a.size / 1024)} KB</small>
                        <Icon name="download" />
                      </button>
                    ))}
                  </article>
                ))}
              </div>
              <div className="sd-composer">
                {selected.status === "resolved" ? (
                  <div className="sd-resolved">
                    <Icon name="task_alt" />
                    <p>Bu talep çözüldü. Yeni yanıt için tekrar açın.</p>
                    <button
                      className="ad-button"
                      onClick={async () => {
                        if (
                          await persist([
                            ...tickets.filter((t) => t.id !== selected.id),
                            { ...selected, status: "open" },
                          ])
                        )
                          setNotice("Talep tekrar açıldı.");
                      }}
                    >
                      Talebi Tekrar Aç
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      disabled={pending || !ready || !draftReady}
                      aria-label="Destek yanıtı"
                      rows={3}
                      maxLength={4000}
                      placeholder="Yanıtınızı buraya yazın…"
                      value={draft.text}
                      onChange={(e) =>
                        changeDraft({ ...draft, text: e.target.value })
                      }
                    />
                    <div className="sd-pending-files">
                      {draft.files.map((a) => (
                        <span key={a.id}>
                          {a.name}
                          <button
                            disabled={pending}
                            aria-label={`${a.name} ekini kaldır`}
                            onClick={() =>
                              changeDraft({
                                ...draft,
                                files: draft.files.filter((f) => f.id !== a.id),
                              })
                            }
                          >
                            <Icon name="close" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="sd-composer-actions">
                      <button
                        className="sd-icon-button"
                        disabled={
                          loadingFile || pending || !ready || !draftReady
                        }
                        aria-label="Yanıta dosya ekle"
                        onClick={() => fileInput.current?.click()}
                      >
                        <Icon name="attach_file" />
                      </button>
                      <input
                        type="file"
                        hidden
                        ref={fileInput}
                        accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
                        onChange={(e) => void upload(e.target.files?.[0])}
                      />
                      <button
                        className="sd-icon-button"
                        disabled={pending || !ready || !draftReady}
                        aria-label="Hazır yanıt ekle"
                        onClick={() =>
                          changeDraft({
                            ...draft,
                            text: `${draft.text}${draft.text ? "\n" : ""}Merhaba, talebinizi aldık. Konuyu inceleyip bilgi vereceğiz.`,
                          })
                        }
                      >
                        <Icon name="bolt" />
                      </button>
                      <button
                        className="sd-icon-button"
                        disabled={pending || !ready || !draftReady}
                        aria-label="Yanıta emoji ekle"
                        onClick={() =>
                          changeDraft({
                            ...draft,
                            text:
                              draft.text.length < 3998
                                ? `${draft.text} 🙂`
                                : draft.text,
                          })
                        }
                      >
                        <Icon name="sentiment_satisfied" />
                      </button>
                      <button
                        className="sd-text-button"
                        disabled={
                          pending || loadingFile || !ready || !draftReady
                        }
                        onClick={async () => {
                          if (await persist())
                            setNotice(
                              "Yanıt taslakları hesabınıza özel olarak sunucuda saklandı; gönderim yapılmadı.",
                            );
                        }}
                      >
                        Taslağı Sakla
                      </button>
                      <button
                        className="sd-text-button"
                        disabled={pending || loadingFile}
                        onClick={() => open("resolve")}
                      >
                        Talebi Çözüldü Olarak Kapat
                      </button>
                      <button
                        className="ad-button"
                        disabled={
                          pending ||
                          !ready ||
                          !draftReady ||
                          loadingFile ||
                          !canReply(selected, draft.text, draft.files.length)
                        }
                        onClick={send}
                      >
                        Yanıt Gönder
                        <Icon name="send" />
                      </button>
                    </div>
                    <small className="sd-muted">
                      En fazla 3 ek, dosya başına 2 MB. Dosyalar yalnızca
                      yetkili oturumla indirilebilir.
                    </small>
                  </>
                )}
                {error && (
                  <p role="alert" className="sd-error">
                    {error}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="sd-empty">
              <Icon name="forum" />
              <h2>Konuşma seçin</h2>
              <p>Listeden bir destek talebi açın.</p>
            </div>
          )}
        </section>
      </div>
      <section className="sd-help-cards">
        {supportGuides.slice(0, 2).map((g) => (
          <article key={g.id} className="ad-card">
            <span className="ad-icon-box blue">
              <Icon name={g.icon} />
            </span>
            <div>
              <h2>{g.title}</h2>
              <p>{g.text}</p>
              <button
                onClick={() => {
                  setGuide(g);
                  open("guide");
                }}
              >
                Rehberi Görüntüle
                <Icon name="arrow_forward" />
              </button>
            </div>
          </article>
        ))}
        <article className="sd-whatsapp">
          <Icon name="headset_mic" />
          <div>
            <small>ALCEIX YARDIM MASASI</small>
            <h2>WhatsApp Destek</h2>
            <p>Entegrasyon kurulumu hakkında bilgi alın.</p>
            <button onClick={() => open("whatsapp")}>
              WhatsApp Destek Bilgisi
            </button>
          </div>
        </article>
      </section>
      {notice && (
        <div className="ad-notice" role="status">
          <Icon name="info" />
          <span>{notice}</span>
          <button aria-label="Bildirimi kapat" onClick={() => setNotice("")}>
            <Icon name="close" />
          </button>
        </div>
      )}
    </AdminShell>
  );
}
