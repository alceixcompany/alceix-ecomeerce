import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAdminStore } from '@/modules/customer-admin/mocks/dashboard';
import { StudioScreen } from '@/modules/customer-admin/screens/studio-screen';
export const metadata={title:'AI Sanal Manken & Ürün Görsel Stüdyosu | Alceix',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <Suspense fallback={<p>Görsel stüdyosu yükleniyor…</p>}><StudioScreen key={storeSlug} store={store}/></Suspense>;}
