import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {getAdminStore} from '@/modules/customer-admin/mocks/dashboard';
import {AccountScreen} from '@/modules/customer-admin/screens/account-screen';
export const metadata={title:'Ekip Yönetimi | Alceix',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}){const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <Suspense fallback={<p>Yükleniyor…</p>}><AccountScreen key={storeSlug} store={store} section="team"/></Suspense>;}
