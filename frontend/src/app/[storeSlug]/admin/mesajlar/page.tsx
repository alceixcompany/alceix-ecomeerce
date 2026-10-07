import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {getAdminStore} from '@/modules/customer-admin/mocks/dashboard';
import {MessagesScreen} from '@/modules/customer-admin/screens/messages-screen';
export const metadata={title:'Mesajlar | Alceix',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <Suspense fallback={<p>Yükleniyor…</p>}><MessagesScreen key={storeSlug} store={store} /></Suspense>;}
