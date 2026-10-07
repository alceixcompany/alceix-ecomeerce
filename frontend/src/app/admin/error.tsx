'use client';
export default function ErrorBoundary({reset}:{reset:()=>void}){return <section role='alert' style={{padding:24}}><h1>Yönetim ekranı yüklenemedi</h1><p>Kaydını kaybetmeden yeniden deneyebilirsin.</p><button className='ad-button' onClick={reset}>Yeniden Dene</button></section>;}
