
export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-lowest via-surface to-surface-container-low pt-12 pb-20 lg:pt-20 lg:pb-32" id="home">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -top-24 right-10 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2.5 bg-surface-container-lowest shadow-sm rounded-full px-4 py-2 mb-8 transition-transform hover:scale-[1.02]">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-label-md text-label-md text-primary tracking-tight">
            {"0 TL Sabit Ücret"}
          </span>
          <span className="text-outline text-caption">
            {"•"}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            {"Sitenizi 4 Dakikada Kurun"}
          </span>
          <span className="text-outline text-caption">
            {"•"}
          </span>
          <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
            {"Yalnızca %3 - %5 Komisyon"}
          </span>
        </div>
        <h1 className="font-display text-display max-w-4xl tracking-tight text-on-surface text-balance mb-6">
          {"0 TL ile E-Ticaret Sitenizi Açın. "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {"Dropshipping & Influencer"}
          </span>
          {" Ağıyla Büyüyün."}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl text-balance mb-10 leading-relaxed">
          {"Aylık yazılım aidatlarına ve gizli tema masraflarına son verin. İster kendi üretiminizi satın, ister onaylı 50.000+ dropshipping ürün havuzundan 1-tıkla ürün ekleyin. Dahili Influencer Satış Ortaklığı ve anlaşmalı indirimli kargo etiketleriyle ilk günden satışa başlayın."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10">
          <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-8 py-4 rounded-xl shadow-lg transition-all duration-200 transform active:scale-95 group" href="#simulator">
            <span className="">
              {"0 TL ile Hemen Mağazanı Aç"}
            </span>
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1" aria-hidden="true">
              {"arrow_forward"}
            </span>
          </a>
          <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md px-7 py-4 rounded-xl shadow-sm transition-all duration-200" href="#showcase">
            <span className="material-symbols-outlined text-secondary text-[20px]" aria-hidden="true">
              {"storefront"}
            </span>
            <span className="">
              {"Canlı Mağaza Demosunu İncele (Heer Atelier)"}
            </span>
            <span className="material-symbols-outlined text-[16px] text-outline" aria-hidden="true">
              {"north_east"}
            </span>
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-6 lg:gap-x-8 text-on-surface-variant font-label-sm text-label-sm">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[18px]" aria-hidden="true">
              {"verified"}
            </span>
            <span className="font-semibold text-on-surface">
              {"Kredi Kartı İstenmez"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[18px]" aria-hidden="true">
              {"bolt"}
            </span>
            <span className="font-semibold text-on-surface">
              {"4 Dakikada Canlıda"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[18px]" aria-hidden="true">
              {"shield"}
            </span>
            <span className="font-semibold text-on-surface">
              {"BDDK Lisanslı Sanal POS"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[18px]" aria-hidden="true">
              {"local_shipping"}
            </span>
            <span className="font-semibold text-on-surface">
              {"%60 İndirimli Kargo Entegrasyonu"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
