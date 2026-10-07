import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
import { SuppliersScreen } from "@/modules/customer-admin/screens/suppliers-screen";
export const metadata={title:"Tedarikçiler & Ürün Kataloğu | Alceix",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <Suspense fallback={<p>Katalog yükleniyor…</p>}><SuppliersScreen key={storeSlug} store={store}/></Suspense>;}
