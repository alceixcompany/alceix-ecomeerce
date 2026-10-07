import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
import { SupportScreen } from "@/modules/customer-admin/screens/support-screen";
export const metadata={title:"Destek Talepleri & Yardım Masası | Alceix",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <Suspense fallback={<p>Destek masası yükleniyor…</p>}><SupportScreen key={storeSlug} store={store}/></Suspense>;}
