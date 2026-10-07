import {notFound} from 'next/navigation';
import {AccountFinance} from '@/modules/platform-admin';
import {knownAccount} from '@/modules/platform-admin/server';
export const metadata={title:'Hesap Finans Detayı | Alceix Ana Yönetim'};
export default async function Page({params}:{params:Promise<{accountId:string}>}){const {accountId}=await params;let id=accountId;try{id=decodeURIComponent(id);}catch{notFound();}if(!knownAccount(id))notFound();return <AccountFinance accountId={id}/>;}
