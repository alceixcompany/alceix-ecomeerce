import { PartnerLogos } from "@/components/layout/partner-logos";

export function SupplierPartners() {
 return (
    <section className="w-full bg-surface-container-low py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-sm text-center mb-12">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
            {"İş Ortaklarımız"}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xl mx-auto mb-8">
            {" Güçlü iş birlikleri kurarak sürdürülebilir ve uzun vadeli değer yaratıyoruz. "}
          </p>
          <div className="max-w-3xl mx-auto flex items-center justify-center">
            <PartnerLogos />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-title-md text-title-md text-on-surface font-bold">
              {"Öne Çıkan Aktif Tedarikçi Ağımız"}
            </h4>
            <span className="font-caption text-caption text-outline font-semibold uppercase tracking-wider">
              {"Doğrulanmış B2B Üreticiler"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-headline-sm">
                {" N "}
              </div>
              <div>
                <p className="font-title-md text-title-md text-on-surface font-bold leading-tight">
                  {"Nordik Tekstil A.Ş."}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {"3.200 SKU • 850 Paket/Gün"}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-headline-sm">
                {" V "}
              </div>
              <div>
                <p className="font-title-md text-title-md text-on-surface font-bold leading-tight">
                  {"Venezia Deri & Ayakkabı"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {"1.400 SKU • 420 Paket/Gün"}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary-container font-bold text-headline-sm">
                {" A "}
              </div>
              <div>
                <p className="font-title-md text-title-md text-on-surface font-bold leading-tight">
                  {"Anatolia Kimya & Kozmetik"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {"650 SKU • 600 Paket/Gün"}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-on-primary-fixed-variant font-bold text-headline-sm">
                {" T "}
              </div>
              <div>
                <p className="font-title-md text-title-md text-on-surface font-bold leading-tight">
                  {"TechNova Elektronik"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {"2.800 SKU • 1.100 Paket/Gün"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
 );
}
