
export function AboutTimeline() {
  return (
    <section className="py-20 bg-surface-container-low/40 border-t border-surface-container-high/40" id="hikayemiz">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold block mb-2">
            {"KİLOMETRE TAŞLARI"}
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            {"Gelişim Yolculuğumuz"}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
            {" Bir fikirle başlayıp binlerce tüccarın güvenilir omurgası haline gelen Alceix hikayesi. "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm flex flex-col justify-between relative group hover:shadow-lg transition-all">
            <div>
              <span className="font-display text-headline-lg font-extrabold text-primary-container/20 group-hover:text-primary transition-colors">
                {"2022"}
              </span>
              <h4 className="font-title-md text-title-md text-on-surface mt-2 mb-2 font-bold">
                {"Kuruluş & Çekirdek Mimari"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {" İstanbul Teknokent bünyesinde AR-GE faaliyetleri başladı. Çok kiracılı (multi-tenant) bulut mimarisinin ilk prototipi geliştirildi. "}
              </p>
            </div>
            <div className="mt-6 pt-4 flex items-center gap-2 text-xs text-primary font-bold border-t border-surface-container-high">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              {" Teknokent AR-GE Fazı "}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm flex flex-col justify-between relative group hover:shadow-lg transition-all">
            <div>
              <span className="font-display text-headline-lg font-extrabold text-primary-container/20 group-hover:text-primary transition-colors">
                {"2023"}
              </span>
              <h4 className="font-title-md text-title-md text-on-surface mt-2 mb-2 font-bold">
                {"0 TL Sabit Ücret & FinTech"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {" Türkiye'de ilk defa aylık aidatsız, komisyon bazlı SaaS ticaret lansmanı yapıldı. BDDK lisanslı sanal POS anlaşmaları tamamlandı. "}
              </p>
            </div>
            <div className="mt-6 pt-4 flex items-center gap-2 text-xs text-tertiary font-bold border-t border-surface-container-high">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
              {" 1.000 Mağaza Eşiği "}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm flex flex-col justify-between relative group hover:shadow-lg transition-all">
            <div>
              <span className="font-display text-headline-lg font-extrabold text-primary-container/20 group-hover:text-primary transition-colors">
                {"2024"}
              </span>
              <h4 className="font-title-md text-title-md text-on-surface mt-2 mb-2 font-bold">
                {"Dropship & Influencer Ağı"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {" 50.000+ doğrudan tedarikçi ürünü sisteme entegre edildi. Influencer'lar ile satıcıları buluşturan yerli affiliate pazaryeri açıldı. "}
              </p>
            </div>
            <div className="mt-6 pt-4 flex items-center gap-2 text-xs text-secondary font-bold border-t border-surface-container-high">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              {" ₺180M+ GMV Hacmi "}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-surface-container-lowest border-2 border-primary-container shadow-xl flex flex-col justify-between relative group ring-4 ring-primary-container/10">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-display text-headline-lg font-extrabold text-primary-container">
                  {"2025"}
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-primary-container text-white">
                  {"Aktif"}
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface mt-2 mb-2 font-bold">
                {"E-İhracat & Yapay Zekâ"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {" Çok dilli küresel e-ihracat modülleri, Stripe entegrasyonu ve otonom vitrin oluşturan AI Commerce Studio hayata geçti. "}
              </p>
            </div>
            <div className="mt-6 pt-4 flex items-center gap-2 text-xs text-primary font-bold border-t border-surface-container-high">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container" />
              </span>
              {" Küresel Açılım "}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
