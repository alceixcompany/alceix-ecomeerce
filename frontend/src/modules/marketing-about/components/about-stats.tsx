
export function AboutStats() {
  return (
    <section className="py-12 bg-surface-container-lowest relative -mt-6 z-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-md hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                  {"storefront"}
                </span>
              </span>
              <span className="font-caption text-caption uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
                {"Doğrulanmış"}
              </span>
            </div>
            <div>
              <h3 className="font-display text-headline-lg text-on-surface tracking-tight font-extrabold">
                {"3.800+"}
              </h3>
              <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
                {"Aktif E-Ticaret Mağazası"}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {"Bireysel ve kurumsal tüccar portföyü"}
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-md hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-xl bg-tertiary-container/15 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                  {"payments"}
                </span>
              </span>
              <span className="font-caption text-caption uppercase px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary font-bold">
                {"2024 Verisi"}
              </span>
            </div>
            <div>
              <h3 className="font-display text-headline-lg text-on-surface tracking-tight font-extrabold">
                {"₺180M+"}
              </h3>
              <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
                {"Yıllık Ekosistem Hacmi"}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {"Platform üzerinden akan toplam ciro"}
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-md hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                  {"inventory_2"}
                </span>
              </span>
              <span className="font-caption text-caption uppercase px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-bold">
                {"Hazır Stok"}
              </span>
            </div>
            <div>
              <h3 className="font-display text-headline-lg text-on-surface tracking-tight font-extrabold">
                {"50.000+"}
              </h3>
              <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
                {"Dropship Ürün Kataloğu"}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {"Tek tıkla vitrine aktarılan tedarik"}
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-md hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                  {"support_agent"}
                </span>
              </span>
              <span className="font-caption text-caption uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
                {"Kesintisiz"}
              </span>
            </div>
            <div>
              <h3 className="font-display text-headline-lg text-on-surface tracking-tight font-extrabold">
                {"24/7"}
              </h3>
              <p className="font-label-md text-label-md text-on-surface font-bold mt-1">
                {"Canlı Uzman Desteği"}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {"3 dakikanın altında ilk yanıt süresi"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
