import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
import { CustomersScreen } from "@/modules/customer-admin/screens/customers-screen";
export const metadata:Metadata={title:"Müşteriler & CRM | Alceix",robots:{index:false,follow:false}};
export default async function CustomersPage({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <Suspense fallback={<p>Müşteriler yükleniyor…</p>}><CustomersScreen key={storeSlug} store={store}/></Suspense>;}
