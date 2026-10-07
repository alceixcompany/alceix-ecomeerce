"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { storeRoutes } from "@/config/store-routes";
import { operations, type AdminStore, type OperationId } from "../mocks/dashboard";
import "../customer-admin.css";
import "../collaboration.css";
import { AccountMenu } from "./account-menu";
function Icon({ name }: { name: string }) { return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>; }
const menu: { label: string; icon: string; operation?: OperationId; route?: "dashboard" | "settings" | "products" | "finance" | "orders" | "design" | "customers" | "suppliers" | "support" | "influencer" | "studio" | "messages" | "team" | "profile" | "campaigns" | "reviews"; hash?: string }[] = [
  { label: "Dashboard / Genel Bakış", icon: "dashboard", route: "dashboard" },
  { label: "Mağaza Profili & Ayarlar", icon: "storefront", route: "settings" },
  { label: "Ürün Yönetimi", icon: "inventory_2", route: "products" },
  { label: "Cüzdan & Finans", icon: "account_balance_wallet", route: "finance" },
  { label: "Sipariş & Kargo", icon: "local_shipping", route: "orders" },
  { label: "Müşteriler & CRM", icon: "group", route: "customers" },
  { label: "Vitrin Ayarları", icon: "palette", route: "design" },
  { label: "Tedarikçi & API Entegrasyonu", icon: "hub", route: "suppliers" },
  { label: "AI Görsel Stüdyosu", icon: "auto_fix_high", route: "studio" },
  { label: "Influencer & Reklam Yönetimi", icon: "campaign", route: "influencer" },
  { label: "Kampanyalar & Başvurular", icon: "assignment_ind", route: "campaigns" },
  { label: "Mesajlar", icon: "forum", route: "messages" },
  { label: "Ekip Yönetimi", icon: "groups", route: "team" },
  { label: "Yorumlar & Değerlendirmeler", icon: "reviews", route: "reviews" },
  { label: "Destek Talepleri", icon: "support_agent", route: "support" },
];
export function AdminShell({ store, storeName = store.name, active, children, overlay, onOperation, onNotice, onNavigate, toolbarSearch, balanceLabel = "₺36.450" }: { store: AdminStore; storeName?: string; active: "dashboard" | "settings" | "products" | "finance" | "orders" | "design" | "customers" | "suppliers" | "support" | "influencer" | "studio" | "messages" | "team" | "profile" | "campaigns" | "reviews"; children: React.ReactNode; overlay?: React.ReactNode; onOperation?: (id: OperationId) => void; onNotice: (message: string) => void; balanceLabel?: string; toolbarSearch?: React.ReactNode; onNavigate?: (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selected, setSelected] = useState<OperationId>("studio");
  const dialog = useRef<HTMLDialogElement>(null);
  const operation = operations.find(item => item.id === selected)!;
  function open(id: OperationId) { setIsMenuOpen(false); if (onOperation) onOperation(id); else { setSelected(id); dialog.current?.showModal(); } }
  return <div className="customer-admin" onKeyDown={event => {if(event.key === "Escape") setIsMenuOpen(false);}}><aside className={`ad-sidebar${isMenuOpen ? " is-open" : ""}`} aria-label="Mağaza yönetimi"><Link className="ad-brand" href="/" onClick={onNavigate}><Image src="/marketing/alceix-logo.webp" alt="Alceix" width={70} height={26}/></Link><div className="ad-store-switch"><Icon name="store"/><div><strong>{storeName}</strong><small>Demo mağaza</small></div><span className="ad-online-dot"/></div><nav>{menu.map(item => item.route ? <Link prefetch={true} key={item.label} href={(item.route === "dashboard" ? storeRoutes.admin(store.slug) : item.route === "products" ? storeRoutes.products(store.slug) : item.route === "finance" ? storeRoutes.finance(store.slug) : item.route === "orders" ? storeRoutes.orders(store.slug) : item.route === "design" ? storeRoutes.design(store.slug) : item.route === "customers" ? storeRoutes.customers(store.slug) : item.route === "suppliers" ? storeRoutes.suppliers(store.slug) : item.route === "studio" ? storeRoutes.studio(store.slug) : item.route === "influencer" ? storeRoutes.influencer(store.slug) : item.route === "messages" ? storeRoutes.messages(store.slug) : item.route === "team" ? storeRoutes.team(store.slug) : item.route === "campaigns" ? storeRoutes.campaigns(store.slug) : item.route === "reviews" ? storeRoutes.reviews(store.slug) : item.route === "support" ? storeRoutes.support(store.slug) : storeRoutes.settings(store.slug)) + (item.hash ? `#${item.hash}` : "")} aria-current={active === item.route && !item.hash ? "page" : undefined} className={active === item.route && !item.hash ? "is-active" : ""} onClick={event => {setIsMenuOpen(false);onNavigate?.(event);}}><Icon name={item.icon}/><span>{item.label}</span></Link> : <button key={item.label} onClick={() => open(item.operation!)}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav><div className="ad-sidebar-bottom"><Icon name="verified_user"/><div><strong>Demo çalışma alanı</strong><small>Veriler örnek amaçlıdır</small></div></div></aside>{isMenuOpen && <button className="ad-menu-backdrop" aria-label="Menüyü kapat" onClick={() => setIsMenuOpen(false)}/>}<div className="ad-workspace"><header className="ad-topbar"><div className="ad-topbar-left"><button className="ad-mobile-toggle" aria-label={isMenuOpen ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}><Icon name="menu"/></button><Image className="ad-top-logo" src="/marketing/alceix-logo.webp" alt="Alceix" width={61} height={23}/><span className="ad-pill green"><span className="ad-online-dot"/>Mağaza açık</span><Link className="ad-preview" onClick={onNavigate} href={active === "design" ? storeRoutes.designPreview(store.slug) : storeRoutes.storefront(store.storefrontSlug)}><Icon name="visibility"/>Hızlı önizleme</Link></div>{toolbarSearch}<div className="ad-account"><span className="ad-top-balance"><Icon name="account_balance_wallet"/><small>Bakiye<strong>{balanceLabel}</strong></small></span><button className="ad-notification" aria-label="Bildirimleri göster" onClick={() => onNotice("Yeni bildiriminiz yok. Bu çalışma alanında örnek veriler gösterilir.")}><Icon name="notifications"/><i/></button><AccountMenu store={store} onNavigate={onNavigate}/></div></header><main className="ad-main">{children}</main></div>{overlay}<dialog ref={dialog} className="ad-dialog" aria-labelledby="shell-dialog-title"><div className="ad-dialog-heading"><span className="ad-icon-box blue"><Icon name={operation.icon}/></span><button autoFocus aria-label="Pencereyi kapat" onClick={() => dialog.current?.close()}><Icon name="close"/></button></div><h2 id="shell-dialog-title">{operation.title}</h2><p>{operation.description}</p><span className="ad-demo-note">Bu modülün örnek genel bakışı dashboard sayfasındadır.</span><Link className="ad-button" href={storeRoutes.admin(store.slug)}>Genel Bakışa Dön</Link></dialog></div>;
}
