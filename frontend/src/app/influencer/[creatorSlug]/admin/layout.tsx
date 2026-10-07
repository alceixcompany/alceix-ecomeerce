import {notFound} from 'next/navigation';
import {creators} from '@/modules/creator-directory';
import {CreatorWorkspaceProvider,InfluencerShell} from '@/modules/influencer-admin';
export const metadata={title:'Influencer Paneli | Alceix',robots:{index:false,follow:false}};
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{creatorSlug:string}>}){const {creatorSlug}=await params;if(!creators.some(c=>c.id===creatorSlug))notFound();return <CreatorWorkspaceProvider key={creatorSlug} creatorId={creatorSlug}><InfluencerShell>{children}</InfluencerShell></CreatorWorkspaceProvider>;}
