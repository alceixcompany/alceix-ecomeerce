
export function AdvantagesSection() {
  return (
    <section className="w-full bg-surface py-16 lg:py-24 border-b border-surface-container" id="avantajlar">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold mb-3">
              {"Benzersiz Avantajlar"}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              {"Alceix'te beklenmedik ücretler, karmaşık sözleşmeler yok. Sıfır sermaye ile e-ticaret sitenizi kurun, 50.000+ dropshipping havuzu ve yerleşik influencer pazarlama ağıyla ilk günden satışa başlayın."}
            </p>
          </div>
          <a className="shrink-0 inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-7 py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95" href="#simulator">
            <span className="">
              {"0 TL ile Ücretsiz Başlayın"}
            </span>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {"arrow_forward"}
            </span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 lg:p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                {"Influencer Marketing & Satış Ortaklığı"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {"Önceden yüksek reklam bütçeleri yakmadan, yalnızca satış gerçekleştikçe influencerlara komisyon verin. UTM link ve kupon koduyla şeffaf takip yapın."}
              </p>
            </div>
            <div className="w-full h-56 bg-surface-container-low rounded-xl border border-surface-container p-4 relative overflow-hidden flex flex-col justify-center mb-6">
              <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-caption shrink-0">
                    {"@A"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface font-bold">
                      <span className="">
                        {"@aylestyle"}
                      </span>
                      <span className="material-symbols-outlined text-primary text-[14px]" aria-hidden="true">
                        {"verified"}
                      </span>
                    </div>
                    <span className="text-caption font-caption text-outline">
                      {"124K Takipçi • Moda"}
                    </span>
                  </div>
                </div>
                <span className="bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-md">
                  {"%15 Komisyon"}
                </span>
              </div>
              <div className="bg-surface-container-lowest/90 backdrop-blur-md rounded-xl p-2.5 shadow-sm border border-surface-container flex items-center justify-between text-caption font-caption">
                <div className="flex items-center gap-2 text-on-surface font-medium">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  <span className="">
                    {"Özel Kupon:"}
                    <strong>
                      {"AYLA20"}
                    </strong>
                  </span>
                </div>
                <span className="text-tertiary font-bold">
                  {"+₺1.420 Kazanç"}
                </span>
              </div>
            </div>
            <a className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md font-bold transition-colors" href="#influencer-form">
              <span className="">
                {"Influencer Ağını Keşfet"}
              </span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {"arrow_forward"}
              </span>
            </a>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 lg:p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                {"50.000+ Ürünlü Dropship Havuzu"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {"Depo kiralamadan, koli paketlemeden ve peşin mal almadan e-ticarete başlayın. Onaylı tedarikçi ağındaki binlerce ürünü 1-tıkla mağazanıza aktarın."}
              </p>
            </div>
            <div className="w-full h-56 bg-surface-container-low rounded-xl border border-surface-container p-4 relative overflow-hidden flex flex-col justify-center mb-6">
              <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-surface-dim overflow-hidden shrink-0 flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[28px] text-secondary" aria-hidden="true">
                    {"potted_plant"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-label-sm text-label-sm text-on-surface font-bold truncate">
                    {"İskandinav Seramik Vazo"}
                  </div>
                  <div className="flex items-center gap-2 text-caption font-caption">
                    <span className="text-outline">
                      {"Toptan: ₺120"}
                    </span>
                    <span className="text-primary font-bold">
                      {"Satış: ₺390"}
                    </span>
                  </div>
                </div>
                <span className="bg-secondary/10 text-secondary text-caption font-caption font-bold px-2 py-0.5 rounded">
                  {"+%145 Kâr"}
                </span>
              </div>
              <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant bg-surface-container-lowest/80 px-3 py-1.5 rounded-lg border border-surface-container">
                <span className="flex items-center gap-1 text-tertiary font-semibold">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    {"local_shipping"}
                  </span>
                  {"Direkt Tedarikçi Sevk"}
                </span>
                <span className="text-outline">
                  {"Stok: 420 Adet"}
                </span>
              </div>
            </div>
            <a className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md font-bold transition-colors" href="#showcase">
              <span className="">
                {"Tedarikçi Havuzunu Keşfet"}
              </span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {"arrow_forward"}
              </span>
            </a>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 lg:p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                {"Tedarikçimiz Olun & Milyonlara Satın"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {"Üretici veya toptancı mısınız? Deponuzdaki ürünleri 3.800+ aktif satıcı ve yüzlerce influencer vitrinine tek tıkla açın, sıfır reklam bütçesiyle sipariş toplayın."}
              </p>
            </div>
            <div className="w-full h-56 bg-surface-container-low rounded-xl border border-surface-container p-4 relative overflow-hidden flex flex-col justify-center mb-6">
              <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container mb-2.5">
                <div className="flex items-center justify-between text-caption font-caption mb-1.5">
                  <span className="font-bold text-on-surface">
                    {"B2B Sevkiyat Konsolu"}
                  </span>
                  <span className="bg-tertiary/10 text-tertiary font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {"Entegre XML"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-sm text-headline-sm text-primary font-black">
                    {"1.450 Paket / Gün"}
                  </span>
                  <span className="text-caption font-caption text-tertiary font-semibold">
                    {"%99.4 Zamanında"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-caption font-caption">
                <div className="bg-surface-container-lowest p-2 rounded-lg border border-surface-container flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">
                    {"qr_code_2"}
                  </span>
                  <span className="">
                    {"Termal Barkod"}
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded-lg border border-surface-container flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
                    {"sync"}
                  </span>
                  <span className="">
                    {"Anlık Stok Sync"}
                  </span>
                </div>
              </div>
            </div>
            <a className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md font-bold transition-colors" href="#tedarikci-form">
              <span className="">
                {"Tedarikçi Başvurusu Yap"}
              </span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {"arrow_forward"}
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
