import { PartnerLogos } from "@/components/layout/partner-logos";

export function PartnersSection() {
  return (
    <section className="w-full bg-surface-container-lowest py-20 lg:py-28 relative" id="partners">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold mb-3">
          {"İş Ortaklarımız"}
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-14">
          {"Güçlü iş birlikleri kurarak sürdürülebilir ve uzun vadeli değer yaratıyoruz."}
        </p>
        <div className="mb-12"><PartnerLogos /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-bold mb-1">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {"share"}
              </span>
              {"Sosyal Ticaret"}
            </div>
            <p className="font-caption text-caption text-on-surface-variant">
              {"Instagram Shopping & Meta Pixel ile sıfır veri kaybı dönüşüm takibi."}
            </p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-secondary font-label-md text-label-md font-bold mb-1">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {"credit_card"}
              </span>
              {"Ödeme Ağı"}
            </div>
            <p className="font-caption text-caption text-on-surface-variant">
              {"Mastercard & Visa altyapılı BDDK lisanslı 3D Secure 2.0 güvencesi."}
            </p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-tertiary font-label-md text-label-md font-bold mb-1">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {"trending_up"}
              </span>
              {"Dijital Reklam"}
            </div>
            <p className="font-caption text-caption text-on-surface-variant">
              {"iyzads partnerliği ile yapay zekalı mikro kitle hedefleme ve ROAS artışı."}
            </p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md font-bold mb-1">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {"point_of_sale"}
              </span>
              {"FinTech POS"}
            </div>
            <p className="font-caption text-caption text-on-surface-variant">
              {"tami ödeme altyapısıyla 12 aya varan taksit ve ertesi iş günü tahsilat."}
            </p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl text-left">
            <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-bold mb-1">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {"cloud_done"}
              </span>
              {"Bulut Altyapısı"}
            </div>
            <p className="font-caption text-caption text-on-surface-variant">
              {"AWS Cloud küresel CDN ağıyla 0.2 saniye sayfa açılış hızı ve %99.99 uptime."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
