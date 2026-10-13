"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminStore } from "../mocks/dashboard";
import { defaultStoreDesign } from "../utils/default-store-design";
import { loadDesign } from "../services/design-api";
import { listProducts, type ProductList } from "../services/admin-api";
import { errorMessage } from "@/lib/http";
import { StoreDesignPreview, DesignIcon as Icon } from "../components/store-design-preview";
import { storeRoutes } from "@/config/store-routes";
import "../customer-admin.css";
import "../store-design.css";
export function DesignPreviewScreen({store,version}:{store:AdminStore;version:"draft"|"published"}) {
  const [design,setDesign]=useState(()=>defaultStoreDesign(store));const [isReady,setIsReady]=useState(false);const [notice,setNotice]=useState("");
  const [products,setProducts]=useState<ProductList["items"]>([]);const [error,setError]=useState("");const [reload,setReload]=useState(0);
  const [device,setDevice]=useState<"desktop"|"tablet"|"mobile">("desktop");
  useEffect(()=>{const controller=new AbortController();setIsReady(false);setError("");Promise.all([loadDesign(store.slug,controller.signal),listProducts(store.slug,new URLSearchParams({status:"live",limit:"6"}),controller.signal)]).then(([record,catalogue])=>{if(controller.signal.aborted)return;setDesign((version==="draft"?record.draft??record.published:record.published)??defaultStoreDesign(store));setProducts(catalogue.items);setNotice((version==="draft"?record.draft:record.published)?"Sunucudan yüklenen görünüm":"Henüz kayıt yok. Varsayılan vitrin gösteriliyor.");setIsReady(true);}).catch(reason=>{if(!controller.signal.aborted)setError(errorMessage(reason));});return()=>controller.abort();},[store,version,reload]);
  return <div className="customer-admin av-standalone"><header className="av-preview-header"><Link href={storeRoutes.design(store.slug)}><Icon name="arrow_back"/>Vitrin Ayarlarına Dön</Link><div><strong>{store.name} · {version==="published"?"Yayınlanan Önizleme":"Taslak Önizleme"}</strong><small>Gerçek satış veya ödeme yapılmaz.</small></div><div className="vs-device-toolbar" role="group" aria-label="Tam vitrin önizleme cihazı">{([{id:"desktop",label:"Masaüstü"},{id:"tablet",label:"Tablet"},{id:"mobile",label:"Mobil"}] as const).map(option=><button key={option.id} aria-pressed={device===option.id} onClick={()=>setDevice(option.id)}>{option.label}</button>)}</div><Link href={storeRoutes.designPreview(store.slug,version==="draft"?"published":"draft")}>{version==="draft"?"Yayınlananı Gör":"Taslağı Gör"}</Link></header><p className="av-preview-notice" role="status">{notice}</p>{isReady?<main className={`av-standalone-shop ${device}`}><StoreDesignPreview design={design} storeName={store.name} catalogProducts={products}/></main>:error?<div><p role="alert">{error}</p><button onClick={()=>setReload(value=>value+1)}>Yeniden Dene</button></div>:<p>Vitrin yükleniyor…</p>}</div>;
}
