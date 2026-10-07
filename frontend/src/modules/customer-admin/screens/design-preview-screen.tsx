"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminStore } from "../mocks/dashboard";
import { initialStoreDesign } from "../mocks/store-design";
import { designStorageKey, isStoreDesign } from "../utils/store-design";
import { StoreDesignPreview, DesignIcon as Icon } from "../components/store-design-preview";
import { storeRoutes } from "@/config/store-routes";
import "../customer-admin.css";
import "../store-design.css";
export function DesignPreviewScreen({store,version}:{store:AdminStore;version:"draft"|"published"}) {
  const [design,setDesign]=useState(initialStoreDesign);const [isReady,setIsReady]=useState(false);const [notice,setNotice]=useState("");
  const [device,setDevice]=useState<"desktop"|"tablet"|"mobile">("desktop");
  useEffect(()=>{try{const text=localStorage.getItem(designStorageKey(store.slug,version))||(version==="draft"?localStorage.getItem(designStorageKey(store.slug,"published")):null);const value:unknown=text?JSON.parse(text):null;if(isStoreDesign(value)){setDesign(value);setNotice(version==="published"?"Yayınlanan demo görünüm":"Kaydedilen taslak görünümü");}else {setDesign(initialStoreDesign());setNotice(text?"Kayıt doğrulanamadı. Varsayılan vitrin gösteriliyor.":"Kaydedilmiş görünüm yok. Varsayılan vitrin gösteriliyor.");}}catch{setNotice("Yerel görünüm okunamadı. Varsayılan vitrin gösteriliyor.");}setIsReady(true);},[store.slug,version]);
  return <div className="customer-admin av-standalone"><header className="av-preview-header"><Link href={storeRoutes.design(store.slug)}><Icon name="arrow_back"/>Vitrin Ayarlarına Dön</Link><div><strong>{store.name} · {version==="published"?"Yayınlanan Demo":"Taslak Önizleme"}</strong><small>Gerçek satış veya ödeme yapılmaz.</small></div><div className="vs-device-toolbar" role="group" aria-label="Tam vitrin önizleme cihazı">{([{id:"desktop",label:"Masaüstü"},{id:"tablet",label:"Tablet"},{id:"mobile",label:"Mobil"}] as const).map(option=><button key={option.id} aria-pressed={device===option.id} onClick={()=>setDevice(option.id)}>{option.label}</button>)}</div><Link href={storeRoutes.designPreview(store.slug,version==="draft"?"published":"draft")}>{version==="draft"?"Yayınlananı Gör":"Taslağı Gör"}</Link></header><p className="av-preview-notice" role="status">{notice}</p>{isReady?<main className={`av-standalone-shop ${device}`}><StoreDesignPreview design={design} storeName={store.name}/></main>:<p>Vitrin yükleniyor…</p>}</div>;
}
