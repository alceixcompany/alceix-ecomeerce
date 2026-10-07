import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAdminStore } from '@/modules/customer-admin/mocks/dashboard';
import { creators } from '@/modules/customer-admin/mocks/influencer';
import { creatorPortfolios } from '@/modules/customer-admin/mocks/creator-portfolios';
import { CreatorDetailScreen } from '@/modules/customer-admin/screens/creator-detail-screen';
export const metadata={title:'İçerik Üretici Portföyü | Alceix',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{storeSlug:string;creatorId:string}>}) {
 const {storeSlug,creatorId}=await params;const store=getAdminStore(storeSlug),creator=creators.find(c=>c.id===creatorId),portfolio=creatorPortfolios[creatorId];
 if(!store||!creator||!portfolio)notFound();
 return <Suspense fallback={<p>Portföy yükleniyor…</p>}><CreatorDetailScreen store={store} creator={creator} portfolio={portfolio}/></Suspense>;
}
