"use client";
import Link from "next/link";
import {useRef,useState} from "react";
import {supplierRoutes} from "@/config/supplier-routes";
import {useSupplierWorkspace} from "../components/workspace-provider";
import {supplierMenu,SupplierIcon} from "../components/supplier-shell";
import {money} from "../utils/workspace";
import type {SupplierSection} from "../types/supplier-admin";
export function SupplierManagement({section}:{section:Extract<SupplierSection,"stores"|"api">}) {
 const {company,workspace,update,notify,ready}=useSupplierWorkspace();
 const title=supplierMenu.find(m=>m.section===section)!.label;
 const [buyer,setBuyer]=useState("heer");const dialog=useRef<HTMLDialogElement>(null);
 function open(){dialog.current?.showModal();}
 return <><div className="sa-page-heading"><div><span className="ad-eyebrow">TEDARİKÇİ YÖNETİMİ · B2B</span><h1>{title}</h1><p>Yalnızca Alceix mağazalarına yönelik tedarik işlemlerinizi yönetin.</p></div></div>
 {!ready?<div className="ad-card sa-content-card" role="status">Çalışma alanı hazırlanıyor…</div>:<>
 {section==="stores"&&<section className="ad-operation-grid">{workspace.stores.map(store=><article className="ad-card ad-operation" key={store.id}><div className="ad-stat-top"><span className="ad-icon-box blue"><SupplierIcon name="storefront"/></span><span className={`ad-pill ${store.active?"green":"red"}`}>{store.active?"Bağlı":"Duraklatıldı"}</span></div><h2>{store.name}</h2><p>{store.city} · {store.products} bağlı katalog ürünü</p><div className="sa-dialog-list"><span>Örnek sipariş sayısı<b>{workspace.orders.filter(o=>o.buyerStoreId===store.id).length}</b></span><span>Tedarik alış tutarı<b>{money(workspace.orders.filter(o=>o.buyerStoreId===store.id).reduce((s,o)=>s+o.quantity*o.unitCostCents,0))}</b></span></div><Link className="ad-card-action" href={supplierRoutes.messages(company.slug)}>Mağaza Mesajları →</Link><button className="ad-button light" onClick={()=>update(w=>({...w,stores:w.stores.map(s=>s.id===store.id?{...s,active:!s.active}:s)}))}>{store.active?"Yeni Siparişleri Duraklat":"Bağlantıyı Etkinleştir"}</button><button className="sa-text-button" onClick={()=>{setBuyer(store.id);open();}}>Örnek Mağaza Değerlendirmesi</button></article>)}</section>}
 {section==="api"&&<section className="ad-card sa-content-card"><h2>Stok & Katalog Entegrasyonu</h2><p>Alceix mağazalarına aktarılacak tedarik verilerini kontrol edin.</p><div className="sa-dialog-list"><span>Ürün kataloğu<b>{workspace.products.length} ürün</b></span><span>Aktif yayın<b>{workspace.products.filter(p=>p.active).length} ürün</b></span><span>Toplam kullanılabilir stok<b>{workspace.products.reduce((s,p)=>s+p.stock,0)} adet</b></span><span>Gerçek API durumu<b>Henüz bağlı değil</b></span></div><button role="switch" aria-checked={workspace.syncEnabled} className="ad-button light" onClick={()=>update(w=>({...w,syncEnabled:!w.syncEnabled}))}>Demo otomatik senkronizasyon: {workspace.syncEnabled?"Açık":"Kapalı"}</button><button className="ad-button" onClick={()=>notify("Demo katalog kontrolü tamamlandı. Gerçek mağazalara veri gönderilmedi.")}>Kataloğu Kontrol Et</button><p className="sa-note">Bu ekran API anahtarı veya gizli bilgi saklamaz. Gerçek bağlantı için yetkili backend entegrasyonu gerekir.</p></section>}
 </>}
 <dialog ref={dialog} className="ad-dialog" aria-label="Mağaza Değerlendirmesi"><div className="ad-dialog-heading"><h2>Mağaza Değerlendirmesi</h2><button autoFocus aria-label="Pencereyi kapat" onClick={()=>dialog.current?.close()}>×</button></div>
 <><span className="ad-pill green">Örnek değerlendirme · 4,9 / 5</span><h3>{workspace.stores.find(s=>s.id===buyer)?.name}</h3><p>“Ürün bilgileri açık, stok takibi kolay ve siparişler düzenli hazırlanıyor.”</p><p className="sa-note">Bu yorum örnektir. Gerçek sistemde yalnızca firmanıza bağlanmış Alceix mağazaları yorum ve puan verebilir.</p></></dialog></>;
}
