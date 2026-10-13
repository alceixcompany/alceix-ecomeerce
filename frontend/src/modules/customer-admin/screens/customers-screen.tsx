"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { replaceLocalQuery } from "../utils/local-query";
import { AdminShell } from "../components/admin-shell";
import type { AdminStore } from "../mocks/dashboard";
import { defaultCrmSettings } from "../mocks/customers";
import type { Customer, CustomerSegment, CrmSettings } from "../types/customer";
import {
  customerCsv,
  customerSegments,
  isCrmData,
  matchesSegment,
  validateCustomer,
} from "../utils/customer";
import { storeRoutes } from "@/config/store-routes";
import "../customers.css";
import { BulkEmail } from "../components/bulk-email";
import {
  loadCustomers,
  loadCrmSettings,
  saveCustomer,
  saveCrmSettings,
  exportCustomers,
  loadCommunicationDrafts,
  loadCommunicationRecipients,
  createCommunicationDraft,
  updateCommunicationDraft,
  type CommunicationDraft,
} from "../services/crm-api";
import { errorMessage } from "@/lib/http";
const emptyCustomer: Customer = {
  id: "",
  name: "",
  email: "",
  phone: "",
  city: "",
  orders: 0,
  spentCents: 0,
  daysSinceOrder: 0,
  joinedDays: 0,
  cartCents: 0,
  points: 0,
  consent: false,
  note: "",
};
const labels: Record<CustomerSegment, string> = {
  all: "Tüm Müşteriler",
  vip: "VIP Müşteriler",
  new: "Yeni Kaydolanlar",
  cart: "Sepeti Terk Edenler",
  inactive: "Hareketsizler (90+ Gün)",
};
const money = (cents: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    cents / 100,
  );
function Icon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {name}
    </span>
  );
}
function Avatar({ customer }: { customer: Customer }) {
  return customer.id === "CRM-1" ? (
    <Image
      className="crm-avatar"
      src="/influencer/selin-yilmaz.jpg"
      alt=""
      width={35}
      height={35}
    />
  ) : (
    <span className={`crm-avatar tone-${customer.orders % 4}`}>
      {customer.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
type Mode =
  "profile" | "new" | "contact" | "loyalty" | "cart" | "campaign" | "export";
export function CustomersScreen({ store }: { store: AdminStore }) {
  const params = useSearchParams(),
    dialog = useRef<HTMLDialogElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]),
    [settings, setSettings] = useState(defaultCrmSettings),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("profile"),
    [selected, setSelected] = useState<Customer>(emptyCustomer),
    [draft, setDraft] = useState<Customer>(emptyCustomer),
    [ruleDraft, setRuleDraft] = useState(defaultCrmSettings),
    [message, setMessage] = useState(""),
    [campaign, setCampaign] = useState("Yeni sezon koleksiyonumuz hazır!"),
    [campaignSegment, setCampaignSegment] = useState<CustomerSegment>("vip"),
    [dirty, setDirty] = useState(false),
    [discard, setDiscard] = useState(false);
  const [pending, setPending] = useState(false),
    [total, setTotal] = useState(0),
    [serverPage, setServerPage] = useState(1),
    [serverPages, setServerPages] = useState(1),
    [settingsVersion, setSettingsVersion] = useState(0),
    [reload, setReload] = useState(0);
  const writing = useRef(false);
  const [campaignDraft, setCampaignDraft] = useState<CommunicationDraft | null>(
      null,
    ),
    [campaignLoaded, setCampaignLoaded] = useState(false),
    [audience, setAudience] = useState<Awaited<
      ReturnType<typeof loadCommunicationRecipients>
    > | null>(null);
  const campaignRequest = useRef<{ payload: string; id: string } | null>(null);
  const campaignLoad = useRef<AbortController | null>(null);
  useEffect(() => () => campaignLoad.current?.abort(), []);
  useEffect(() => {
    if (mode !== "campaign") return;
    const controller = new AbortController();
    setAudience(null);
    loadCommunicationRecipients(store.slug, campaignSegment, controller.signal)
      .then(setAudience)
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, [store.slug, mode, campaignSegment]);
  const queryString = params.toString();
  const customerQuery = useCallback(() => {
    const input = new URLSearchParams(queryString),
      query = new URLSearchParams();
    for (const field of ["segment", "q", "spend", "last", "page"]) {
      const value = input.get(field);
      if (value) query.set(field, value);
    }
    query.set("limit", "5");
    return query;
  }, [queryString]);
  useEffect(() => {
    const controller = new AbortController();
    setReady(false);
    const timer = setTimeout(() => {
      Promise.all([
        loadCustomers(store.slug, customerQuery(), controller.signal),
        loadCrmSettings(store.slug, controller.signal),
      ])
        .then(([list, rules]) => {
          setCustomers(list.items);
          setTotal(list.total);
          setServerPage(list.page);
          setServerPages(list.pages);
          setSettings(rules.settings);
          setSettingsVersion(rules.version);
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
  }, [store.slug, customerQuery, reload]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const segment = customerSegments.includes(
      params.get("segment") as CustomerSegment,
    )
      ? (params.get("segment") as CustomerSegment)
      : "all",
    query = params.get("q") || "",
    spend = ["high", "low"].includes(params.get("spend") || "")
      ? params.get("spend")!
      : "all",
    last = ["recent", "inactive"].includes(params.get("last") || "")
      ? params.get("last")!
      : "all";
  const filtered = customers,
    pages = serverPages,
    page = serverPage,
    visible = customers;
  function filter(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "all") next.set(name, value);
    else next.delete(name);
    if (name !== "page") next.delete("page");
    replaceLocalQuery(
      `${storeRoutes.customers(store.slug)}${next.size ? `?${next}` : ""}`,
    );
  }
  async function save(nextCustomers: Customer[], nextSettings: CrmSettings) {
    if (!ready || writing.current) return false;
    writing.current = true;
    setPending(true);
    try {
      if (!isCrmData({ customers: nextCustomers, settings: nextSettings }))
        throw new Error("Girilen değerleri kontrol edin.");
      if (mode === "loyalty" || mode === "cart") {
        const result = await saveCrmSettings(
          store.slug,
          nextSettings,
          settingsVersion,
        );
        setSettings(result.settings);
        setSettingsVersion(result.version);
      } else {
        const changed = nextCustomers.find(
          (next) =>
            JSON.stringify(next) !==
            JSON.stringify(customers.find((current) => current.id === next.id)),
        );
        if (changed) {
          await saveCustomer(
            store.slug,
            changed,
            !customers.some((c) => c.id === changed.id),
          );
        }
      }
      setDirty(false);
      setError("");
      setReload((n) => n + 1);
      return true;
    } catch (error) {
      setError(errorMessage(error));
      return false;
    } finally {
      writing.current = false;
      setPending(false);
    }
  }

  async function open(
    next: Mode,
    customer = selected,
    forcedSegment?: CustomerSegment,
  ) {
    campaignLoad.current?.abort();
    setMode(next);
    setSelected(customer);
    setDraft({ ...customer });
    setRuleDraft({ ...settings });
    setError("");
    setDirty(false);
    setDiscard(false);
    setMessage(
      settings.template.replaceAll("{{ad}}", customer.name.split(" ")[0]),
    );
    if (next === "new")
      setDraft({
        id: crypto.randomUUID(),
        name: "",
        email: "",
        phone: "",
        city: "",
        orders: 0,
        spentCents: 0,
        daysSinceOrder: 0,
        joinedDays: 0,
        cartCents: 0,
        points: 0,
        consent: false,
        note: "",
      });
    dialog.current?.showModal();
    if (next === "campaign") {
      const controller = new AbortController();
      campaignLoad.current = controller;
      setCampaignLoaded(false);
      try {
        const result = await loadCommunicationDrafts(
          store.slug,
          "campaign",
          controller.signal,
        );
        if (controller.signal.aborted || !dialog.current?.open) return;
        const draft = result.items[0] ?? null;
        setCampaignDraft(draft);
        if (draft) {
          setCampaign(draft.message);
          setCampaignSegment(draft.segment);
        }
        if (forcedSegment) setCampaignSegment(forcedSegment);
        setCampaignLoaded(true);
      } catch (error) {
        if (!controller.signal.aborted) setError(errorMessage(error));
      }
    }
  }
  function close() {
    if (dirty) {
      setDiscard(true);
      return;
    }
    campaignLoad.current?.abort();
    dialog.current?.close();
  }
  function finish(text: string) {
    campaignLoad.current?.abort();
    dialog.current?.close();
    setDirty(false);
    setNotice(text);
  }

  const vip = "—";
  const overlay = (
    <dialog
      ref={dialog}
      className="ad-dialog crm-dialog"
      aria-labelledby="crm-dialog-title"
      onCancel={(event) => {
        if (dirty) {
          event.preventDefault();
          setDiscard(true);
        } else campaignLoad.current?.abort();
      }}
    >
      <div className="ad-dialog-heading">
        <span className="ad-icon-box blue">
          <Icon
            name={
              mode === "profile"
                ? "person"
                : mode === "new"
                  ? "person_add"
                  : "campaign"
            }
          />
        </span>
        <button autoFocus aria-label="CRM penceresini kapat" onClick={close}>
          <Icon name="close" />
        </button>
      </div>
      <h2 id="crm-dialog-title">
        {
          {
            profile: "Müşteri Profili",
            new: "Yeni Müşteri Ekle",
            contact: "İletişim Taslağı",
            loyalty: "Sadakat & Puan Kuralları",
            cart: "Terk Edilmiş Sepet Ayarları",
            campaign: "Kampanya Oluştur",
            export: "Müşterileri Dışa Aktar",
          }[mode]
        }
      </h2>
      <p className="crm-muted">
        CRM kayıtları MongoDB’de saklanır. İletişim taslakları gönderim veya
        puan işlemi başlatmaz.
      </p>
      {error && (
        <p role="alert" className="crm-error">
          {error}
        </p>
      )}
      {discard && (
        <div className="crm-discard">
          <p>Kaydedilmemiş düzenlemeler bırakılacak.</p>
          <button onClick={() => setDiscard(false)}>Düzenlemeye Dön</button>
          <button
            onClick={() => {
              setDirty(false);
              campaignLoad.current?.abort();
              dialog.current?.close();
            }}
          >
            Değişiklikleri Bırak
          </button>
        </div>
      )}
      {(mode === "new" || mode === "profile") && (
        <form
          inert={pending}
          onChange={() => setDirty(true)}
          onSubmit={async (e) => {
            e.preventDefault();
            const problem = validateCustomer(draft);
            if (problem) {
              setError(problem);
              return;
            }
            if (
              customers.some(
                (c) =>
                  c.id !== draft.id &&
                  c.email.toLowerCase() === draft.email.trim().toLowerCase(),
              )
            ) {
              setError("Bu e-posta adresi zaten kayıtlı.");
              return;
            }
            const cleaned = {
              ...draft,
              name: draft.name.trim(),
              email: draft.email.trim().toLowerCase(),
            };
            if (
              await save(
                mode === "new"
                  ? [cleaned, ...customers]
                  : customers.map((c) => (c.id === draft.id ? cleaned : c)),
                settings,
              )
            ) {
              finish(
                mode === "new"
                  ? "Müşteri kaydedildi."
                  : "Müşteri profili kaydedildi.",
              );
            }
          }}
        >
          {mode === "profile" && (
            <>
              <div className="crm-profile-head">
                <Avatar customer={selected} />
                <div>
                  <strong>{selected.name}</strong>
                  <small>
                    {selected.city} · {selected.id}
                  </small>
                </div>
                <span className="ad-pill blue">
                  {matchesSegment(selected, "vip") ? "VIP Müşteri" : "Müşteri"}
                </span>
              </div>
              <div className="crm-profile-stats">
                <span>
                  Sipariş<strong>—</strong>
                </span>
                <span>
                  Toplam harcama<strong>—</strong>
                </span>
                <span>
                  Sadakat puanı<strong>—</strong>
                </span>
              </div>
              {selected.orderId && (
                <Link
                  className="crm-order-link"
                  href={storeRoutes.order(store.slug, selected.orderId)}
                  onClick={(e) => {
                    if (dirty) {
                      e.preventDefault();
                      setError(
                        "Siparişe geçmeden önce profil değişikliklerini kaydedin veya pencereyi kapatın.",
                      );
                    }
                  }}
                >
                  Son siparişi incele · #{selected.orderId}
                  <Icon name="arrow_outward" />
                </Link>
              )}
            </>
          )}
          <div className="crm-fields">
            <label>
              Ad Soyad
              <input
                required
                maxLength={80}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              E-posta
              <input
                type="email"
                required
                maxLength={120}
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label>
              Telefon
              <input
                type="tel"
                maxLength={40}
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </label>
            <label>
              Şehir
              <input
                maxLength={80}
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              />
            </label>
          </div>
          <label className="crm-check">
            <input
              type="checkbox"
              checked={draft.consent}
              onChange={(e) =>
                setDraft({ ...draft, consent: e.target.checked })
              }
            />
            Pazarlama iletişim izni mevcut
          </label>
          <label>
            Mağaza içi not
            <textarea
              maxLength={1000}
              rows={3}
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
          </label>
          <div className="crm-dialog-actions">
            <button type="button" className="crm-secondary" onClick={close}>
              Vazgeç
            </button>
            <button
              className="ad-button"
              disabled={pending || !ready}
              type="submit"
            >
              {mode === "new" ? "Müşteriyi Ekle" : "Profili Kaydet"}
            </button>
          </div>
        </form>
      )}
      {mode === "contact" && (
        <form
          inert={pending}
          onChange={() => setDirty(true)}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!message.trim()) {
              setError("Taslak mesajını yazın.");
              return;
            }
            const next = {
              ...selected,
              note: `${selected.note}${selected.note ? "\n" : ""}İletişim taslağı: ${message}`,
            };
            if (next.note.length > 1000) {
              setError("Not alanında yeterli yer yok; mesajı kısaltın.");
              return;
            }
            if (
              await save(
                customers.map((c) => (c.id === selected.id ? next : c)),
                settings,
              )
            )
              finish(
                "Mesaj taslağı müşteri notuna kaydedildi. Gönderim yapılmadı.",
              );
          }}
        >
          <div className="crm-recipient">
            <strong>{selected.name}</strong>
            <span>{selected.email}</span>
            <span
              className={`ad-pill ${selected.consent ? "green" : "orange"}`}
            >
              {selected.consent ? "İletişim izni var" : "Pazarlama izni yok"}
            </span>
          </div>
          <label>
            Mesaj Taslağı
            <textarea
              rows={5}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <p className="crm-muted">
            SMS, WhatsApp ve e-posta bağlantıları henüz yok. Taslak yalnızca
            müşteri notuna eklenir.
          </p>
          <button
            disabled={pending || !ready}
            type="submit"
            className="ad-button"
          >
            Taslağı Nota Kaydet
          </button>
        </form>
      )}
      {(mode === "loyalty" || mode === "cart") && (
        <form
          inert={pending}
          onChange={() => setDirty(true)}
          onSubmit={async (e) => {
            e.preventDefault();
            if (await save(customers, ruleDraft))
              finish(
                "CRM kuralları kaydedildi. Otomatik gönderim veya puan hesaplaması yapılmadı.",
              );
          }}
        >
          {mode === "loyalty" ? (
            <>
              <p className="crm-muted">
                Mevcut örnek müşteri puanları değişmez. Bu kurallar ilerideki
                sadakat entegrasyonu için demo ayarlarıdır.
              </p>
              <label>
                1 puan kazandıran harcama (TL)
                <input
                  type="number"
                  required
                  min={1}
                  max={10000}
                  step={1}
                  value={ruleDraft.earnRate}
                  onChange={(e) =>
                    setRuleDraft({
                      ...ruleDraft,
                      earnRate: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                1 puanın indirim karşılığı (TL)
                <input
                  type="number"
                  required
                  min={0.01}
                  max={100}
                  step={0.01}
                  value={ruleDraft.pointCents / 100}
                  onChange={(e) =>
                    setRuleDraft({
                      ...ruleDraft,
                      pointCents: Math.round(Number(e.target.value) * 100),
                    })
                  }
                />
              </label>
            </>
          ) : (
            <>
              <label className="crm-check">
                <input
                  type="checkbox"
                  checked={ruleDraft.abandonedEnabled}
                  onChange={(e) =>
                    setRuleDraft({
                      ...ruleDraft,
                      abandonedEnabled: e.target.checked,
                    })
                  }
                />
                Sepet hatırlatma kuralını etkinleştir (demo)
              </label>
              <div className="crm-fields">
                <label>
                  Hatırlatma süresi (saat)
                  <input
                    type="number"
                    required
                    min={1}
                    max={168}
                    value={ruleDraft.delayHours}
                    onChange={(e) =>
                      setRuleDraft({
                        ...ruleDraft,
                        delayHours: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  İndirim oranı (%)
                  <input
                    type="number"
                    required
                    min={0}
                    max={50}
                    value={ruleDraft.discount}
                    onChange={(e) =>
                      setRuleDraft({
                        ...ruleDraft,
                        discount: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label>
                Hatırlatma Şablonu
                <textarea
                  rows={4}
                  required
                  maxLength={500}
                  value={ruleDraft.template}
                  onChange={(e) =>
                    setRuleDraft({ ...ruleDraft, template: e.target.value })
                  }
                />
              </label>
              <small>
                İsim alanı: {"{{ad}}"} · Önizleme:{" "}
                {ruleDraft.template.replaceAll("{{ad}}", "Selin")}
              </small>
            </>
          )}
          <div className="crm-dialog-actions">
            <button type="button" className="crm-secondary" onClick={close}>
              Vazgeç
            </button>
            <button
              disabled={pending || !ready}
              type="submit"
              className="ad-button"
            >
              Ayarları Kaydet
            </button>
          </div>
        </form>
      )}
      {mode === "campaign" && (
        <form
          inert={pending}
          onChange={() => setDirty(true)}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!campaign.trim()) {
              setError("Kampanya metni girin.");
              return;
            }
            if (writing.current || !campaignLoaded) return;
            writing.current = true;
            setPending(true);
            const input = {
                kind: "campaign" as const,
                segment: campaignSegment,
                subject: "",
                message: campaign.trim(),
              },
              payload = JSON.stringify(input);
            if (campaignRequest.current?.payload !== payload)
              campaignRequest.current = { payload, id: crypto.randomUUID() };
            try {
              const saved = campaignDraft
                ? await updateCommunicationDraft(
                    store.slug,
                    campaignDraft,
                    input,
                  )
                : await createCommunicationDraft(
                    store.slug,
                    input,
                    campaignRequest.current.id,
                  );
              setCampaignDraft(saved);
              campaignRequest.current = null;
              finish(
                "Kampanya taslağı MongoDB’ye kaydedildi. Gönderim yapılmadı.",
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
            Hedef Segment
            <select
              disabled={!campaignLoaded || pending}
              value={campaignSegment}
              onChange={(e) =>
                setCampaignSegment(e.target.value as CustomerSegment)
              }
            >
              {customerSegments.map((s) => (
                <option key={s} value={s}>
                  {labels[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kampanya Metni
            <textarea
              disabled={!campaignLoaded || pending}
              rows={4}
              required
              maxLength={500}
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            />
          </label>
          <div className="crm-campaign-preview">
            <span>
              İzinli hedef kitle
              <strong>
                {audience?.available ? audience.total : "—"} müşteri
              </strong>
            </span>
            <p>{campaign || "Kampanya önizlemesi"}</p>
            <small>
              {audience && !audience.available
                ? "Bu segmentin sipariş/sepet metrikleri henüz bağlı değil. "
                : ""}
              İzni olmayan müşteriler hedef kitleye dahil edilmez. Gerçek
              SMS/e-posta gönderilmez.
            </small>
          </div>
          <button
            className="ad-button"
            disabled={!campaignLoaded || pending}
            type="submit"
          >
            Kampanya Taslağını Kaydet
          </button>
        </form>
      )}
      {mode === "export" && (
        <>
          <p>
            Etkin filtrelere uyan <strong>{total} müşteri</strong> CSV olarak
            indirilir. Dosya ad, e-posta, şehir, sipariş ve harcama bilgilerini
            içerir.
          </p>
          <button
            className="ad-button"
            disabled={!total || pending}
            onClick={async () => {
              setPending(true);
              try {
                const exported = await exportCustomers(
                  store.slug,
                  customerQuery(),
                );
                const blob = new Blob([customerCsv(exported, false)], {
                  type: "text/csv;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `alceix-musteriler-${store.slug}.csv`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                finish("CSV indirme isteği oluşturuldu.");
              } catch (error) {
                setError(errorMessage(error));
              } finally {
                setPending(false);
              }
            }}
          >
            <Icon name="download" />
            CSV İndir
          </button>
        </>
      )}
    </dialog>
  );
  return (
    <AdminShell
      store={store}
      active="customers"
      onNotice={setNotice}
      overlay={overlay}
    >
      {error && (
        <p className="crm-error" role="alert">
          {error}{" "}
          <button onClick={() => setReload((n) => n + 1)}>Yeniden Dene</button>
        </p>
      )}
      <header className="crm-heading">
        <div>
          <span>MÜŞTERİ İLİŞKİLERİ & SEGMENTASYON · {store.name}</span>
          <h1>Müşteriler & CRM Yönetimi</h1>
          <p>
            Aktif müşteri kitlenizi segmente edin, sadakat kurgularını yönetin
            ve iletişim taslaklarını tek yerde hazırlayın.
          </p>
        </div>
        <div>
          <button
            className="crm-secondary"
            disabled={!ready || pending}
            onClick={() => open("export")}
          >
            <Icon name="download" />
            Dışa Aktar
          </button>
          <BulkEmail store={store} />
          <button
            className="crm-secondary"
            disabled={!ready || pending}
            onClick={() => open("campaign")}
          >
            <Icon name="campaign" />
            Toplu İletişim
          </button>
          <button
            className="ad-button"
            disabled={!ready || pending}
            onClick={() => open("new")}
          >
            <Icon name="person_add" />
            Yeni Müşteri Ekle
          </button>
        </div>
      </header>
      <section className="crm-stats" aria-label="Müşteri özeti">
        {[
          {
            label: "Toplam Kayıtlı Müşteri",
            value: String(total),
            note: "Etkin filtredeki kayıtlar",
            icon: "group",
            color: "blue",
          },
          {
            label: "VIP & Sadık Kitle (LTV ≥ ₺5.000)",
            value: "—",
            note: "Sipariş verisi henüz bağlı değil",
            icon: "workspace_premium",
            color: "green",
          },
          {
            label: "Ortalama Sipariş Değeri (AOV)",
            value: "—",
            note: "Sipariş verisi henüz bağlı değil",
            icon: "payments",
            color: "blue",
          },
          {
            label: "Tekrar Satın Alma Oranı",
            value: "—",
            note: "Sipariş verisi henüz bağlı değil",
            icon: "repeat",
            color: "blue",
          },
        ].map((stat, i) => (
          <article key={stat.label} className="ad-card crm-stat">
            <div>
              <span>{stat.label}</span>
              <span className={`ad-icon-box ${stat.color}`}>
                <Icon name={stat.icon} />
              </span>
            </div>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
            <svg
              viewBox="0 0 240 25"
              role="img"
              aria-label="Dekoratif örnek çizelge"
            >
              <path
                d={
                  i === 1
                    ? "M0 23 Q70 25 120 18 T240 3"
                    : "M0 20 Q60 10 100 15 T180 12 T240 5"
                }
                fill="none"
                stroke={i === 1 ? "#119a71" : "#0066ff"}
                strokeWidth="2"
              />
            </svg>
          </article>
        ))}
      </section>
      <div className="crm-tabs" role="group" aria-label="Müşteri segmentleri">
        {customerSegments.map((s) => (
          <button
            key={s}
            aria-pressed={segment === s}
            onClick={() => filter("segment", s)}
          >
            {labels[s]}
            <span>{s === segment ? total : "—"}</span>
          </button>
        ))}
        <small>
          <i />
          Sunucu Kayıtları
        </small>
      </div>
      <div className="crm-filters">
        <label className="crm-search">
          <Icon name="search" />
          <input
            aria-label="Müşteri ara"
            placeholder="İsim, e-posta, telefon veya şehir ara…"
            value={query}
            onChange={(e) => filter("q", e.target.value)}
          />
        </label>
        <label>
          <span className="crm-sr-only">Harcama Tutarı</span>
          <select
            aria-label="Harcama Tutarı"
            value={spend}
            onChange={(e) => filter("spend", e.target.value)}
          >
            <option value="all">Harcama Tutarı (Tümü)</option>
            <option value="high">₺5.000 ve üzeri</option>
            <option value="low">₺5.000 altı</option>
          </select>
        </label>
        <label>
          <span className="crm-sr-only">Son Sipariş</span>
          <select
            aria-label="Son Sipariş"
            value={last}
            onChange={(e) => filter("last", e.target.value)}
          >
            <option value="all">Son Sipariş (Tümü)</option>
            <option value="recent">Son 30 gün</option>
            <option value="inactive">90+ gün önce</option>
          </select>
        </label>
        <button
          className="crm-icon-button"
          aria-label="Filtreleri temizle"
          onClick={() => replaceLocalQuery(storeRoutes.customers(store.slug))}
        >
          <Icon name="filter_alt_off" />
        </button>
      </div>
      <div className="crm-layout">
        <section className="ad-card crm-list" aria-label="Müşteri listesi">
          {!ready ? (
            <p role="status">Müşteriler yükleniyor…</p>
          ) : (
            <>
              <div className="crm-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>MÜŞTERİ</th>
                      <th>SEGMENT</th>
                      <th>SİPARİŞ</th>
                      <th>TOPLAM HARCAMA (LTV)</th>
                      <th>SON SİPARİŞ</th>
                      <th>AKSİYONLAR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="crm-customer">
                            <Avatar customer={c} />
                            <div>
                              <strong>{c.name}</strong>
                              <small>{c.email}</small>
                              <small>
                                {c.city} · {c.phone}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`ad-pill ${matchesSegment(c, "vip") ? "blue" : c.cartCents ? "orange" : "green"}`}
                          >
                            {matchesSegment(c, "vip")
                              ? "VIP Müşteri"
                              : c.cartCents
                                ? "Sepet Terk"
                                : matchesSegment(c, "new")
                                  ? "Yeni Müşteri"
                                  : c.orders > 1
                                    ? "Sadık Müşteri"
                                    : "Müşteri"}
                          </span>
                        </td>
                        <td>— Sipariş</td>
                        <td>
                          <strong className="crm-spend">—</strong>
                        </td>
                        <td>
                          {c.orders
                            ? c.daysSinceOrder === 0
                              ? "Bugün"
                              : `$— gün önce`
                            : "Henüz sipariş yok"}
                          <small>
                            {c.cartCents
                              ? `${money(c.cartCents)} sepette`
                              : c.daysSinceOrder >= 90 && c.orders
                                ? "Uzun süredir hareketsiz"
                                : ""}
                          </small>
                        </td>
                        <td>
                          <div className="crm-row-actions">
                            <button
                              aria-label={`${c.name} iletişim taslağı`}
                              onClick={() => open("contact", c)}
                            >
                              <Icon name="chat" />
                            </button>
                            <button
                              aria-label={`${c.name} sipariş bilgileri`}
                              onClick={() => open("profile", c)}
                            >
                              <Icon name="shopping_bag" />
                            </button>
                            <button onClick={() => open("profile", c)}>
                              Profil İncele
                              <span className="crm-sr-only"> · {c.name}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!filtered.length && (
                <div className="crm-empty">
                  <Icon name="person_search" />
                  <h2>Müşteri bulunamadı</h2>
                  <p>Arama veya filtreleri değiştirerek tekrar deneyin.</p>
                  <button
                    className="crm-secondary"
                    onClick={() =>
                      replaceLocalQuery(storeRoutes.customers(store.slug))
                    }
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
              <footer className="crm-pagination">
                <span>
                  Toplam {total} müşteri · {total ? (page - 1) * 5 + 1 : 0}–
                  {Math.min(page * 5, total)} arası gösteriliyor
                </span>
                <nav aria-label="Müşteri sayfaları">
                  <button
                    disabled={page === 1}
                    aria-label="Önceki müşteri sayfası"
                    onClick={() => filter("page", String(page - 1))}
                  >
                    <Icon name="chevron_left" />
                  </button>
                  {Array.from(
                    { length: Math.min(pages, 5) },
                    (_, i) =>
                      Math.min(Math.max(page - 2, 1), Math.max(pages - 4, 1)) +
                      i,
                  ).map((number) => (
                    <button
                      key={number}
                      aria-current={page === number ? "page" : undefined}
                      onClick={() => filter("page", String(number))}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    disabled={page === pages}
                    aria-label="Sonraki müşteri sayfası"
                    onClick={() => filter("page", String(page + 1))}
                  >
                    <Icon name="chevron_right" />
                  </button>
                </nav>
              </footer>
            </>
          )}
        </section>
        <aside className="crm-aside">
          <section className="ad-card crm-rule">
            <h2>
              <Icon name="loyalty" />
              Sadakat & Puan Kuralı<span className="ad-pill green">Demo</span>
            </h2>
            <p>
              Müşterilerinize puan kazandıracak sadakat modelini hazırlayın.
            </p>
            <dl>
              <div>
                <dt>Kazanım Oranı</dt>
                <dd>{money(settings.earnRate * 100)} = 1 Puan</dd>
              </div>
              <div>
                <dt>Puan Karşılığı</dt>
                <dd>1 Puan = {money(settings.pointCents)}</dd>
              </div>
            </dl>
            <button onClick={() => open("loyalty")}>
              Sadakat Kurallarını Düzenle
            </button>
          </section>
          <section className="ad-card crm-rule">
            <h2>
              <Icon name="shopping_cart" />
              Terk Edilmiş Sepet
              <span
                className={`ad-pill ${settings.abandonedEnabled ? "green" : "orange"}`}
              >
                {settings.abandonedEnabled ? "Kural Açık" : "Kapalı"}
              </span>
            </h2>
            <p>
              Sepetini tamamlamayan müşteriler için hatırlatma şablonunuzu ve
              süreyi ayarlayın.
            </p>
            <dl>
              <div>
                <dt>Hatırlatma Süresi</dt>
                <dd>{settings.delayHours} saat</dd>
              </div>
              <div>
                <dt>İndirim Oranı</dt>
                <dd>%{settings.discount} (Demo)</dd>
              </div>
            </dl>
            <button onClick={() => open("cart")}>Şablon & Süre Ayarları</button>
          </section>
          <section className="crm-campaign-card">
            <h2>
              <Icon name="campaign" />
              Hızlı Duyuru Başlat
            </h2>
            <p>
              {vip} VIP müşteriniz için yeni koleksiyon kampanyası hazırlayın.
            </p>
            <button onClick={() => open("campaign", selected, "vip")}>
              VIP Kampanya Oluştur
            </button>
          </section>
          <p className="crm-footnote">
            Müşteri kayıtları sunucuda saklanır. Sipariş, sepet ve sadakat
            metrikleri henüz bağlı değildir; bu alanlar satış raporu olarak
            kullanılmamalıdır.
          </p>
        </aside>
      </div>
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
