export function PartnerLogos({ showHeading = false }: { showHeading?: boolean }) {
  return <div className="partner-banner">
    {showHeading && <div className="mb-7 text-center"><h3 className="text-headline-sm font-bold text-on-surface">İş Ortaklarımız</h3><p className="mt-2 text-body-sm text-on-surface-variant">Güçlü iş birlikleri kurarak sürdürülebilir ve uzun vadeli değer yaratıyoruz.</p></div>}
    <div className="partner-logo-grid">
      <div className="partner-logo" role="img" aria-label="Meta">
        <svg width="42" height="28" viewBox="0 0 64 40" fill="none" aria-hidden="true"><path d="M5 28C5 14 10 5 16 5C23 5 29 17 35 27C39 34 43 36 48 36C55 36 59 30 59 23C59 13 54 5 48 5C40 5 34 17 29 26C24 34 21 36 16 36C9 36 5 33 5 28Z" stroke="#0866FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="meta-wordmark">Meta</span>
      </div>
      <div className="partner-logo" role="img" aria-label="Mastercard">
        <svg className="mastercard-wordmark" viewBox="0 0 194 44" width="160" height="36" aria-hidden="true"><circle cx="24" cy="22" r="20" fill="#EB001B"/><circle cx="46" cy="22" r="20" fill="#F79E1B"/><path d="M35 5.3a20 20 0 0 0 0 33.4a20 20 0 0 0 0-33.4Z" fill="#FF5F00"/><text x="77" y="29" fill="#141413" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="20">mastercard</text></svg>
      </div>
      <div className="partner-logo" role="img" aria-label="iyzads"><span className="material-symbols-outlined text-[28px] text-[#42B883]" aria-hidden="true">fact_check</span><span className="iyzads-wordmark">iyzads</span></div>
      <div className="partner-logo" role="img" aria-label="tami"><span className="tami-wordmark">tami<span className="tami-dot" /></span></div>
      <div className="partner-logo partner-logo-last" role="img" aria-label="Amazon Web Services"><div className="aws-wordmark"><span>aws</span><svg viewBox="0 0 72 16" width="64" height="14" fill="none" aria-hidden="true"><path d="M4 3C21 14 47 14 64 5" stroke="#FF9900" strokeWidth="3" strokeLinecap="round"/><path d="m57 3 9 1-2 8" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div>
    </div>
  </div>;
}
