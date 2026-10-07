import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {getAdminStore} from '@/modules/customer-admin/mocks/dashboard';
import {OpenCampaignsScreen} from '@/modules/customer-admin/screens/open-campaigns-screen';
export const metadata={title:'Kampanyalar & Başvurular | Alceix',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <Suspense fallback={<p>Yükleniyor…</p>}><OpenCampaignsScreen key={storeSlug} store={store} /></Suspense>;}
