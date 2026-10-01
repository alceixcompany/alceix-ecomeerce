
export function GettingStartedSection() {
  return (
    <section className="w-full bg-surface-container-low py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full text-secondary font-label-sm text-label-sm uppercase tracking-wider mb-3">
            {"4 Dakikada Canlıda"}
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {"E-Ticarete Başlamak Hiç Bu Kadar Zahmetsiz Olmamıştı"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            {"Bürokrasi yok, sözleşme kuyrukları yok, peşin yazılım faturası yok."}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col justify-between relative">
            <span className="font-display text-[56px] font-black text-primary/15 leading-none mb-4">
              {"01"}
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
                {"0 TL ile Mağazanızı Açın"}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                {"Adınızı, mağaza adınızı ve e-postanızı girin. 4 dakika içinde SSL sertifikalı, BDDK ödeme altyapılı ve mobil uyumlu vitrininiz anında yayına girsin."}
              </p>
            </div>
            <div className="flex items-center gap-2 text-caption font-caption text-tertiary font-bold">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {"check_circle"}
              </span>
              {"Kredi kartı girmeden başla"}
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col justify-between relative">
            <span className="font-display text-[56px] font-black text-secondary/15 leading-none mb-4">
              {"02"}
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
                {"Ürün Yükleyin veya Dropship Seçin"}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                {"Kendi stoğunuzdaki ürünleri fotoğraflarıyla yükleyin ya da Alceix'in 50.000+ ürünlük hazır havuzundan beğendiğiniz ürünleri 1-tıkla sitenize çekin."}
              </p>
            </div>
            <div className="flex items-center gap-2 text-caption font-caption text-secondary font-bold">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {"check_circle"}
              </span>
              {"Otomatik stok ve fiyat güncelleme"}
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col justify-between relative">
            <span className="font-display text-[56px] font-black text-tertiary/15 leading-none mb-4">
              {"03"}
            </span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
                {"Satışa Başlayın & Kargonuzu Çıkarın"}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                {"Influencer ortaklık bağlantılarınızı paylaşın. Gelen siparişlerde tek tıkla %60 indirimli termal kargo etiketini basın, hakedişinizi ertesi gün IBAN'ınıza alın."}
              </p>
            </div>
            <div className="flex items-center gap-2 text-caption font-caption text-primary font-bold">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {"check_circle"}
              </span>
              {"Ertesi iş günü banka hesabına aktarım"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
