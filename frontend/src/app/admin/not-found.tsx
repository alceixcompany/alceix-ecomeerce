import Link from 'next/link';
export default function NotFound(){return <div style={{padding:24}}><h1>Üye bulunamadı</h1><p>İstenen üye bu yönetim alanında kayıtlı değil.</p><Link href='/admin/uyeler'>Tüm Üyelere Dön</Link></div>;}
