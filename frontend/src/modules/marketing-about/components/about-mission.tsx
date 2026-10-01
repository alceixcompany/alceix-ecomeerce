import Image from "next/image";

export function AboutMission() {
  return (
    <section className="py-20 bg-surface-container-low/50 border-y border-surface-container-high/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold block">
              {"KÜLTÜRÜMÜZ VE ÇALIŞMA ALANIMIZ"}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              {" Maslak AR-GE Merkezimizde Geleceğin Ticaretini Kodluyoruz "}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {" Alceix kültürünün temelinde radikal şeffaflık, satıcı odaklı mühendislik ve inovatif hız yer alır. Hiyerarşiden arınmış, üretken ve dinamik Maslak ofisimizde yazılımcılarımız, ürün tasarımcılarımız ve e-ticaret analistlerimiz her gün satıcılarımızın büyümesini hızlandıracak araçları geliştirir. "}
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {"psychology"}
                  </span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    {"Yapay Zeka Destekli Operasyon"}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {"Ürün listeleme, görsel optimizasyonu ve SEO açıklamalarında otonom AI asistanları tasarlıyoruz."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container/15 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {"groups_3"}
                  </span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    {"Kolektif ve Çevik Çalışma"}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {"Haftalık sprint'lerle satıcılarımızdan gelen geri bildirimleri en geç 7 gün içinde canlı koda aktarıyoruz."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {"eco"}
                  </span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    {"Sürdürülebilir FinTech Etiği"}
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {"Kullanıcı kazanmadan para talep etmeyen, Türkiye'nin ilk adil ve sürdürülebilir ticaret modeli."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-surface-container-lowest bg-surface-container">
                <Image alt="Alceix inovasyon ve işbirliği ortamı" className="w-full h-[460px] object-cover" src="/about/image-0.webp" width={800} height={600} sizes="(max-width: 1024px) 90vw, 560px" />
              </div>
              <div className="absolute -bottom-6 -left-6 p-6 rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high max-w-xs">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-tertiary animate-ping" />
                  <span className="font-label-sm text-label-sm text-on-surface font-bold">
                    {"Maslak HQ • Canlı AR-GE"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  {" \"Yazılım geliştiricilerimizin %70'i doğrudan satıcı paneli deneyimini mükemmelleştirmeye odaklıdır.\" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
