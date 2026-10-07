import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAdminStore } from '@/modules/customer-admin/mocks/dashboard';
import { InfluencerScreen } from '@/modules/customer-admin/screens/influencer-screen';
export const metadata={title:'Influencer Pazarlaması & İş Birliği | Alceix',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string}>}) {
  const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();
  return <Suspense fallback={<p>İş birlikleri yükleniyor…</p>}><InfluencerScreen key={storeSlug} store={store}/></Suspense>;
}
