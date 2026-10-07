"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { supplierRoutes } from "@/config/supplier-routes";
import { useSupplierWorkspace } from "./workspace-provider";
import type { SupplierSection } from "../types/supplier-admin";
import {money} from "../utils/workspace";
import "../supplier-admin.css";
export function SupplierIcon({ name }: { name:string }) { return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>; }
export const supplierMenu: {section:SupplierSection; label:string; icon:string}[] = [
 {section:"dashboard",label:"Dashboard / Genel Bakış",icon:"dashboard"}, {section:"settings",label:"Firma Profili & Ayarlar",icon:"domain"}, {section:"products",label:"Ürün & Tedarik Kataloğu",icon:"inventory_2"}, {section:"finance",label:"Cüzdan & Hakediş",icon:"account_balance_wallet"}, {section:"orders",label:"B2B Sipariş & Kargo",icon:"local_shipping"}, {section:"stores",label:"Bağlı Alceix Mağazaları",icon:"storefront"}, {section:"api",label:"Stok & API Entegrasyonu",icon:"hub"}, {section:"studio",label:"AI Görsel Stüdyosu",icon:"auto_awesome"}, {section:"team",label:"Ekip Yönetimi",icon:"group"}, {section:"messages",label:"Mağaza Mesajları",icon:"forum"}, {section:"reviews",label:"Yorumlar & Değerlendirmeler",icon:"reviews"}, {section:"support",label:"Destek Talepleri",icon:"support_agent"},
];
export function SupplierShell({children}:{children:React.ReactNode}) {
 const {company,workspace,notice,notify}=useSupplierWorkspace(); const pathname=usePathname(); const [menuOpen,setMenuOpen]=useState(false);
 const total=workspace.orders.filter(o=>o.status==="delivered").reduce((sum,o)=>sum+o.unitCostCents*o.quantity,0);
 return <div className="supplier-admin" onKeyDown={e=>{if(e.key==="Escape")setMenuOpen(false);}}>
  <aside className={`ad-sidebar ${menuOpen?"is-open":""}`} aria-label="Tedarikçi yönetimi">
   <Link className="ad-brand" href="/"><Image src="/marketing/alceix-logo.webp" alt="Alceix" width={70} height={26}/></Link>
   <div className="ad-store-switch"><SupplierIcon name="store"/><div><strong>{workspace.companyName}</strong><small>B2B tedarikçi · Demo</small></div><span className="ad-online-dot"/></div>
   <nav>{supplierMenu.map(item=><Link key={item.section} prefetch href={supplierRoutes[item.section](company.slug)} className={(pathname===supplierRoutes[item.section](company.slug)||(item.section==="orders"&&pathname.startsWith(supplierRoutes.orders(company.slug)+"/")))?"is-active":""} aria-current={(pathname===supplierRoutes[item.section](company.slug)||(item.section==="orders"&&pathname.startsWith(supplierRoutes.orders(company.slug)+"/")))?"page":undefined} onClick={()=>setMenuOpen(false)}><SupplierIcon name={item.icon}/><span>{item.label}</span></Link>)}</nav>
   <div className="ad-sidebar-bottom"><SupplierIcon name="verified_user"/><div><strong>Alceix B2B çalışma alanı</strong><small>Yalnızca bağlı mağazalara satış</small></div></div>
  </aside>
  {menuOpen&&<button className="ad-menu-backdrop" aria-label="Menüyü kapat" onClick={()=>setMenuOpen(false)}/>}
  <div className="ad-workspace"><header className="ad-topbar"><div className="ad-topbar-left">
   <button className="ad-mobile-toggle" aria-label={menuOpen?"Menüyü kapat":"Menüyü aç"} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><SupplierIcon name="menu"/></button>
   <Image className="ad-top-logo" src="/marketing/alceix-logo.webp" alt="Alceix" width={61} height={23}/><span className="ad-pill green"><span className="ad-online-dot"/>B2B tedarikçi</span>
   <Link href={supplierRoutes.products(company.slug)} className="ad-preview"><SupplierIcon name="visibility"/>Kataloğu İncele</Link>
  </div><div className="ad-account"><span className="ad-top-balance"><SupplierIcon name="account_balance_wallet"/><small>Örnek hakediş<strong>{money(total)}</strong></small></span>
   <button className="ad-notification" aria-label="Bildirimleri göster" onClick={()=>notify("Mağaza Mesajları bölümünden demo görüşmelerinizi inceleyebilirsiniz.")}><SupplierIcon name="notifications"/><i/></button>
   <Link className="sa-account" href={supplierRoutes.settings(company.slug)} aria-label="Firma profilini yönet"><span className="ad-account-name">Firma yöneticisi<small>{company.city}</small></span><span className="ad-avatar">{company.initials}</span></Link>
  </div></header><main className="ad-main">{children}<footer className="ad-footer"><span>© Alceix · Tedarikçi yönetimi</span><span>Demo arayüz · Gerçek sipariş, mesaj veya ödeme iletilmez.</span></footer></main></div>
  {notice&&<div className="ad-notice" role="status"><SupplierIcon name="info"/><span>{notice}</span><button aria-label="Bildirimi kapat" onClick={()=>notify("")}><SupplierIcon name="close"/></button></div>}
 </div>;
}
