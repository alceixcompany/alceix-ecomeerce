import Image from "next/image";

export function AboutTeam() {
  return (
    <section className="py-24 bg-surface-container-low/30 border-t border-surface-container-high/40" id="ekip">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold block mb-2">
              {"LİDER KADROMUZ"}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              {"Geleceğin E-Ticaretini İnşa Eden Yönetim"}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
              {" Teknoloji, finans, e-ticaret lojistiği ve marka büyümesi alanlarında onlarca yıllık deneyime sahip kurucu ekibimizle tanışın. "}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-primary font-label-md text-label-md font-semibold hover:underline cursor-pointer">
            <span>
              {"Tüm Departmanları Gör (42+ Kişi)"}
            </span>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {"arrow_outward"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group rounded-3xl bg-surface-container-lowest shadow-md hover:shadow-2xl border border-surface-container-high hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative w-full aspect-square overflow-hidden bg-surface-container-high">
              <Image alt="Arda Selim Tunç - Kurucu Ortak & CEO" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/about/image-1.webp" width={800} height={600} sizes="(max-width: 1024px) 90vw, 560px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-on-primary font-caption text-caption tracking-wider uppercase font-semibold">
                  {"Liderlik & Strateji"}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {"Arda Selim Tunç"}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold">
                    {"CEO"}
                  </span>
                </div>
                <p className="font-label-md text-label-md text-primary font-semibold">
                  {"Kurucu Ortak & CEO"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                  {" Eski B2B teknoloji yöneticisi. 12+ yıllık SaaS, pazar yeri ve ölçeklenebilir platform mimarisi deneyimi. "}
                </p>
              </div>
              <div className="pt-5 mt-5 flex items-center justify-between border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant font-medium">
                  {"Maslak HQ"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="LinkedIn" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"link"}
                    </span>
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="Web" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"public"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="group rounded-3xl bg-surface-container-lowest shadow-md hover:shadow-2xl border border-surface-container-high hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative w-full aspect-square overflow-hidden bg-surface-container-high">
              <Image alt="Zeynep Beren Yalçın - VP of Product & Engineering" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/about/image-2.webp" width={800} height={600} sizes="(max-width: 1024px) 90vw, 560px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-on-primary font-caption text-caption tracking-wider uppercase font-semibold">
                  {"Yapay Zeka & Mühendislik"}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {"Zeynep Beren Yalçın"}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary-fixed text-secondary font-bold">
                    {"CTO"}
                  </span>
                </div>
                <p className="font-label-md text-label-md text-primary font-semibold">
                  {"VP of Product & Eng. (CTO)"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                  {" Büyük veri, yapay zeka ürünleştirme ve bulut tabanlı yüksek erişilebilir e-ticaret altyapıları lideri. "}
                </p>
              </div>
              <div className="pt-5 mt-5 flex items-center justify-between border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant font-medium">
                  {"AR-GE Laboratuvarı"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="GitHub" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"code"}
                    </span>
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="LinkedIn" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"link"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="group rounded-3xl bg-surface-container-lowest shadow-md hover:shadow-2xl border border-surface-container-high hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative w-full aspect-square overflow-hidden bg-surface-container-high">
              <Image alt="Emre Çağlar Aksoy - VP of Growth & Commerce Operations" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/about/image-3.webp" width={800} height={600} sizes="(max-width: 1024px) 90vw, 560px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-on-primary font-caption text-caption tracking-wider uppercase font-semibold">
                  {"Büyüme & Operasyon"}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {"Emre Çağlar Aksoy"}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-tertiary-container/15 text-tertiary font-bold">
                    {"VP"}
                  </span>
                </div>
                <p className="font-label-md text-label-md text-primary font-semibold">
                  {"VP of Growth & Operations"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                  {" Dropshipping lojistik entegrasyonları, ödeme sistemleri ve kargo ağları stratejisti. "}
                </p>
              </div>
              <div className="pt-5 mt-5 flex items-center justify-between border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant font-medium">
                  {"Büyüme Ekibi"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="Trend Analitiği" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"trending_up"}
                    </span>
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="LinkedIn" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"link"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="group rounded-3xl bg-surface-container-lowest shadow-md hover:shadow-2xl border border-surface-container-high hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative w-full aspect-square overflow-hidden bg-surface-container-high">
              <Image alt="Selin Melis Doğan - Head of Influencer & Brand Partnerships" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/about/image-4.webp" width={800} height={600} sizes="(max-width: 1024px) 90vw, 560px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-on-primary font-caption text-caption tracking-wider uppercase font-semibold">
                  {"Affiliate & Ortaklıklar"}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {"Selin Melis Doğan"}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold">
                    {"Lead"}
                  </span>
                </div>
                <p className="font-label-md text-label-md text-primary font-semibold">
                  {"Head of Brand Partnerships"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                  {" Türkiye'nin önde gelen 500+ içerik üreticisi ve ajansıyla satış ortaklığı ağını yöneten marka lideri. "}
                </p>
              </div>
              <div className="pt-5 mt-5 flex items-center justify-between border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant font-medium">
                  {"Affiliate Network"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="Marka İletişim" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"photo_camera"}
                    </span>
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors flex items-center justify-center" title="LinkedIn" aria-disabled="true">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {"link"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
