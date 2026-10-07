import {Suspense} from 'react';
import {PlatformProvider,PlatformShell,OperationsProvider,CommercialProvider} from '@/modules/platform-admin';
export const metadata={title:'Alceix Ana Yönetim',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <PlatformProvider><OperationsProvider><CommercialProvider><PlatformShell><Suspense fallback={<p role='status'>Yönetim kayıtları yükleniyor…</p>}>{children}</Suspense></PlatformShell></CommercialProvider></OperationsProvider></PlatformProvider>;}
