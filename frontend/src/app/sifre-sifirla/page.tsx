import {AuthScreen} from '@/modules/marketing-auth/screens/auth-screen';
export const metadata={title:'Şifre Yenile | Alceix',robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string|string[]}>}){const {token}=await searchParams;return <AuthScreen mode="reset" token={typeof token==='string'?token:''}/>;}
