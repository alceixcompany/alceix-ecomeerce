
export function SupplierProcess() {
 return (
    <section className="w-full bg-surface py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary mb-2">
            {"Kolay Entegrasyon"}
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            {" 4 Adımda Tedarikçi Süreç Rehberi "}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            {" Karmaşık süreçler yok; dakikalar içinde deponuzu binlerce satıcının operasyon merkezine dönüştürün. "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="bg-surface-container-lowest p-7 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-display text-primary-fixed-dim/60 font-extrabold select-none">
                  {"01"}
                </span>
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    {"assignment_turned_in"}
                  </span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                {"Başvuru & Ön Değerlendirme"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {" Ürün kalitesi, stok kapasitesi ve şirket evrakları incelenir; tedarikçi operasyon yetkilimizce aynı gün içinde onaylanır. "}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-0 bg-surface-container-low/50 -mx-7 -mb-7 p-4 rounded-b-2xl">
              <span className="font-caption text-caption text-primary font-bold">
                {"Ortalama Süre: 24 Saat"}
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-7 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-display text-primary-fixed-dim/60 font-extrabold select-none">
                  {"02"}
                </span>
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    {"cloud_upload"}
                  </span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                {"Kataloğu Bağlayın"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {" XML linki, Excel tablosu veya API ile ürünlerinizi yükleyin. Toptan net alış fiyatınızı ve tavsiye edilen perakende satış fiyatını belirleyin. "}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-0 bg-surface-container-low/50 -mx-7 -mb-7 p-4 rounded-b-2xl">
              <span className="font-caption text-caption text-primary font-bold">
                {"Otomatik Çift Yönlü Senkron"}
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-7 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-display text-primary-fixed-dim/60 font-extrabold select-none">
                  {"03"}
                </span>
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    {"storefront"}
                  </span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                {"Satıcılar Vitrine Eklesin"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {" Mağaza sahipleri ve influencer'lar ürünlerinizi tek tıkla kendi mağazalarına aktarır ve anında satış yapmaya başlar. "}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-0 bg-surface-container-low/50 -mx-7 -mb-7 p-4 rounded-b-2xl">
              <span className="font-caption text-caption text-primary font-bold">
                {"3.800+ Aktif Satıcı Vitrini"}
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-7 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-display text-tertiary-fixed-dim/70 font-extrabold select-none">
                  {"04"}
                </span>
                <div className="w-10 h-10 rounded-full bg-on-tertiary-container/40 flex items-center justify-center text-tertiary-container">
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    {"payments"}
                  </span>
                </div>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                {"Paketi Çıkarın & Tahsil Edin"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {" Sipariş geldiğinde tek tıkla barkodlu kargo etiketini basın. Ürün alıcıya teslim edildiğinde hakedişiniz doğrudan IBAN'ınıza yatsın. "}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-0 bg-surface-container-low/50 -mx-7 -mb-7 p-4 rounded-b-2xl">
              <span className="font-caption text-caption text-tertiary font-bold">
                {"Garanti Havuz Tahsilatı"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
 );
}
