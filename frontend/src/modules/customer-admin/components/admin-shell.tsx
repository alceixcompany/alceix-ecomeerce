"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { logout } from "@/modules/marketing-auth";
import { errorMessage } from "@/lib/http";
import { storeRoutes } from "@/config/store-routes";
import { operations, type OperationId } from "../mocks/dashboard";
import type { AdminStore } from "../types/store";
import "../customer-admin.css";
function Icon({ name }: { name: string }) { return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>; }
const menu: { label: string; icon: string; operation?: OperationId; route?: "dashboard" | "settings" | "products"; hash?: string }[] = [
  { label: "Dashboard / Genel Bakış", icon: "dashboard", route: "dashboard" },
  { label: "Mağaza Profili & Ayarlar", icon: "storefront", route: "settings" },
  { label: "Ürün Yönetimi", icon: "inventory_2", route: "products" },
  { label: "Cüzdan & Finans", icon: "account_balance_wallet", operation: "finance" },
  { label: "Sipariş & Kargo", icon: "local_shipping", operation: "orders" },
  { label: "Müşteriler & CRM", icon: "group", operation: "support" },
  { label: "Vitrin Ayarları", icon: "palette", route: "settings", hash: "visual" },
  { label: "Tedarikçi & API Entegrasyonu", icon: "hub", operation: "supplier" },
  { label: "Destek Talepleri", icon: "support_agent", operation: "support" },
];
export function AdminShell({ store, storeName = store.name, active, children, overlay, onOperation, onNotice }: { store: AdminStore; storeName?: string; active: "dashboard" | "settings" | "products"; children: React.ReactNode; overlay?: React.ReactNode; onOperation?: (id: OperationId) => void; onNotice: (message: string) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState<OperationId>("studio");
  const dialog = useRef<HTMLDialogElement>(null);
  const operation = operations.find(item => item.id === selected)!;
  function open(id: OperationId) { setIsMenuOpen(false); if (onOperation) onOperation(id); else { setSelected(id); dialog.current?.showModal(); } }
  return <div className="customer-admin" onKeyDown={event => {if(event.key === "Escape") setIsMenuOpen(false);}}><aside className={`ad-sidebar${isMenuOpen ? " is-open" : ""}`} aria-label="Mağaza yönetimi"><Link className="ad-brand" href="/"><Image src="/marketing/alceix-logo.webp" alt="Alceix" width={70} height={26}/><span>Alceix<small>Commerce OS</small></span></Link><div className="ad-store-switch"><Icon name="store"/><div><strong>{storeName}</strong><small>Mağaza</small></div><span className="ad-online-dot"/></div><nav>{menu.map(item => item.route ? <Link key={item.label} href={(item.route === "dashboard" ? storeRoutes.admin(store.slug) : item.route === "products" ? storeRoutes.products(store.slug) : storeRoutes.settings(store.slug)) + (item.hash ? `#${item.hash}` : "")} aria-current={active === item.route && !item.hash ? "page" : undefined} className={active === item.route && !item.hash ? "is-active" : ""} onClick={() => setIsMenuOpen(false)}><Icon name={item.icon}/><span>{item.label}</span></Link> : <button key={item.label} onClick={() => open(item.operation!)}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav><div className="ad-sidebar-bottom"><Icon name="verified_user"/><div><strong>Güvenli çalışma alanı</strong><small>Mağazanıza özel veriler</small></div></div></aside>{isMenuOpen && <button className="ad-menu-backdrop" aria-label="Menüyü kapat" onClick={() => setIsMenuOpen(false)}/>}<div className="ad-workspace"><header className="ad-topbar"><div className="ad-topbar-left"><button className="ad-mobile-toggle" aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}><Icon name="menu"/></button><Image className="ad-top-logo" src="/marketing/alceix-logo.webp" alt="Alceix" width={61} height={23}/><span className="ad-pill green"><span className="ad-online-dot"/>{store.isOpen && store.mode === "normal" ? "Mağaza açık" : "Satış kapalı"}</span><Link className="ad-preview" href={storeRoutes.storefront(store.storefrontSlug)}><Icon name="visibility"/>Hızlı önizleme</Link></div><div className="ad-account"><span className="ad-top-balance"><Icon name="account_balance_wallet"/><small>Bakiye<strong>—</strong></small></span><button className="ad-notification" aria-label="Bildirimleri göster" onClick={() => onNotice("Bildirim hizmeti henüz etkin değil.")}><Icon name="notifications"/><i/></button><span className="ad-account-name">{store.account.name}<small>Mağaza yöneticisi</small></span><button className="ad-avatar" title="Oturumu kapat" aria-label="Oturumu kapat" onClick={async()=>{try{await logout();window.location.assign("/giris-yap");}catch(error){onNotice(errorMessage(error));}}}>{store.account.name.split(/\s+/).slice(0,2).map(word=>word[0]).join("")}</button></div></header><main className="ad-main">{children}</main></div>{overlay}<dialog ref={dialog} className="ad-dialog" aria-labelledby="shell-dialog-title"><div className="ad-dialog-heading"><span className="ad-icon-box blue"><Icon name={operation.icon}/></span><button autoFocus aria-label="Pencereyi kapat" onClick={() => dialog.current?.close()}><Icon name="close"/></button></div><h2 id="shell-dialog-title">{operation.title}</h2><p>{operation.description}</p><span className="ad-demo-note">Bu operasyon servisi henüz etkin değildir.</span><Link className="ad-button" href={storeRoutes.admin(store.slug)}>Genel Bakışa Dön</Link></dialog></div>;
}
