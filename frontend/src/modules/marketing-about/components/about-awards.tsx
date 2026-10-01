import Image from "next/image";

export function AboutAwards() {
  return (
    <section className="py-24 bg-surface-container-low/60 border-y border-surface-container-high/40" id="oduller">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7">
            <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold block mb-2">
              {"TESCİLLİ BAŞARI"}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              {"Aldığımız Ödüller ve Kurumsal Başarılar"}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
              {" İnovatif sıfır sabit maliyetli iş modelimiz, teknolojik üstünlüğümüz ve müşteri memnuniyeti standartlarımızla kazandığımız saygın ödüller. "}
            </p>
          </div>
          <div className="lg:col-span-5 flex items-center lg:justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-sm text-sm font-semibold text-on-surface">
              <span className="material-symbols-outlined text-amber-500 text-[20px]" aria-hidden="true">
                {"military_tech"}
              </span>
              <span>
                {"2024 & 2025 Sektör Liderliği"}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest bg-slate-900 group">
              <Image alt="Alceix Teknoloji Ödülü Trofesi" className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700" src="/about/image-5.webp" width={800} height={600} sizes="(max-width: 1024px) 90vw, 560px" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md border border-white/40 shadow-xl">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    {"verified"}
                  </span>
                  {" Global İnovasyon & Teknoloji Liderliği "}
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold mt-1">
                  {"Excellence in Digital Transformation 2024"}
                </h4>
                <p className="font-caption text-caption text-on-surface-variant mt-1">
                  {"Avrupa ve Türkiye E-Ticaret Zirvesi Jüri Onayıyla"}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm hover:shadow-xl hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px]" style={{"fontVariationSettings": "'FILL' 1"}} aria-hidden="true">
                  {"emoji_events"}
                </span>
              </div>
              <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                {"TÜRKİYE BİLİŞİM ZİRVESİ"}
              </span>
              <h4 className="font-title-md text-title-md text-on-surface mt-1 mb-2 font-bold">
                {"SaaS İnovasyon Ödülü 2024"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {"En İyi FinTech ve E-Ticaret Entegrasyonu alanında jüri özel birincilik ödülü."}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm hover:shadow-xl hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px]" style={{"fontVariationSettings": "'FILL' 1"}} aria-hidden="true">
                  {"military_tech"}
                </span>
              </div>
              <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                {"TECHCOMMERCE SUMMIT"}
              </span>
              <h4 className="font-title-md text-title-md text-on-surface mt-1 mb-2 font-bold">
                {"Yılın En İyi Girişimi"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {"Sıfır Sermaye ile Girişimciliği Destekleme ve Pazar Payı Büyümesi Kategorisi."}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm hover:shadow-xl hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/15 text-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px]" style={{"fontVariationSettings": "'FILL' 1"}} aria-hidden="true">
                  {"verified"}
                </span>
              </div>
              <span className="font-caption text-caption text-tertiary font-bold uppercase tracking-wider">
                {"A.C.E. AWARDS 2024"}
              </span>
              <h4 className="font-title-md text-title-md text-on-surface mt-1 mb-2 font-bold">
                {"Mükemmel Müşteri Deneyimi"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {"98.4 CSAT memnuniyet skoru ile 7/24 Kesintisiz Destek Başarı Ödülü."}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm hover:shadow-xl hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[28px]" style={{"fontVariationSettings": "'FILL' 1"}} aria-hidden="true">
                  {"cloud_sync"}
                </span>
              </div>
              <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">
                {"AWS SCALE PARTNER"}
              </span>
              <h4 className="font-title-md text-title-md text-on-surface mt-1 mb-2 font-bold">
                {"Cloud Native Partner"}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {"Yüksek Trafik Esnekliği ve Bankacılık Seviyesinde Güvenlik Akreditasyonu."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
