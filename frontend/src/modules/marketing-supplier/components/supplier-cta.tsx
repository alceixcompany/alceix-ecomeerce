
export function SupplierCta() {
 return (
    <section className="w-full bg-surface pb-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="bg-primary-container rounded-3xl p-10 lg:p-14 text-on-primary shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="inline-block px-3.5 py-1 rounded-full bg-on-primary/10 text-on-primary font-label-sm text-label-sm uppercase tracking-wider mb-4">
              {" B2B Büyüme Fırsatı "}
            </span>
            <h2 className="font-headline-lg text-headline-lg font-extrabold tracking-tight mb-3">
              {" Ürünlerinizi Türkiye'nin En Hızlı Büyüyen Satış Ağına Dahil Edin. "}
            </h2>
            <p className="font-body-md text-body-md text-on-primary/80">
              {" Dakikalar içinde kaydolun, onaylanın ve binlerce mağazanın raflarında yerinizi alın. Sıfır risk, garantili hakediş. "}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 font-caption text-caption text-on-primary/90">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {"mail"}
                </span>
                {" tedarik@alceix.com "}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {"call"}
                </span>
                {" 0850 840 24 00 "}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <a className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest text-primary hover:bg-surface-container-low px-8 py-4 rounded-xl font-label-md text-label-md font-bold shadow-lg transition-transform hover:scale-105 active:scale-95" href="#basvuru-formu">
              <span>
                {"Hemen Başvurun (Ücretsiz)"}
              </span>
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {"arrow_upward"}
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
 );
}
