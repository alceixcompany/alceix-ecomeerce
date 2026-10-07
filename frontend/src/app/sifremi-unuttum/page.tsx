import type {Metadata} from 'next';
import {AuthScreen} from '@/modules/marketing-auth/screens/auth-screen';
export const metadata:Metadata={title:'Şifremi Unuttum | Alceix',description:'Alceix hesabınız için şifre yenileme isteği hazırlayın.',robots:{index:false,follow:true}};
export default function Page(){return <AuthScreen mode="recovery"/>;}
