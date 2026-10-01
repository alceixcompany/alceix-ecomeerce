
export function SupplierBenefits() {
 return (
    <section className="w-full bg-surface-container-low py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
          <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary mb-2">
            {"B2B Çözüm Mimarisi"}
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            {" Neden Alceix Tedarikçisi Olmalısınız? "}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            {" Geleneksel toptancılığın tahsilat ve reklam risklerini ortadan kaldıran uçtan uca B2B altyapısı. "}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/80 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                  {"campaign"}
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
                {" Sıfır Reklam Maliyetiyle Devasa Satış Gücü "}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                {" Reklam bütçesi harcamadan 3.800'den fazla bağımsız mağaza ve yüzlerce influencer ürünlerinizi satmak için yarışsın. Siz yalnızca kaliteli ürün üretin ve deponuzda hazır tutun; satış ve pazarlamayı profesyonel satıcı ordusu üstlensin. "}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                  {"groups"}
                </span>
                {" 3.800+ Satıcı "}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-tertiary-container" aria-hidden="true">
                  {"trending_up"}
                </span>
                {" 0 TL Tanıtım Gideri "}
              </span>
            </div>
          </div>
          <div className="lg:col-span-5 bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary-container mb-6">
                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                  {"verified"}
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
                {" Garantili & Düzenli Hakediş Tahsilatı "}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {" Vadeli çek, senet veya ödenmeyen fatura riski yok. Alceix BDDK lisanslı ödeme havuzu güvencesiyle kargonuz teslim edildiğinde ödemeniz doğrudan banka hesabınıza geçer. "}
              </p>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-surface-container-low flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[24px]" aria-hidden="true">
                {"account_balance"}
              </span>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface font-bold">
                  {"Haftalık Düzenli Transfer"}
                </p>
                <p className="font-caption text-caption text-outline">
                  {"Gecikmesiz, net IBAN hakedişi"}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary mb-6">
                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                  {"sync_alt"}
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
                {" Otomatik Stok & Sipariş Senkronizasyonu (XML / API) "}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {" ERP ve depo yazılımlarınızla çift yönlü entegre çalışın. Stoklarınız bittiğinde tüm satıcıların vitrininde aynı saniye güncellensin, hatalı sipariş ve iptal riski sıfırlansın. "}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
                {"check_circle"}
              </span>
              <span>
                {"REST API, Nebim, Logo & Ticimax Uyumlu"}
              </span>
            </div>
          </div>
          <div className="lg:col-span-7 bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                  {"local_shipping"}
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">
                {" %60 İndirimli Kurumsal Kargo Anlaşmaları "}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                {" Alceix'in Yurtiçi, MNG, Aras, Sendeo ve DHL Express özel hacim indirimlerinden yararlanın. Barkodlar tek tıkla termal yazıcınızdan çıksın, paketler adresinizden teslim alınsın. "}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-surface-container rounded-xl text-center">
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  {"Yurtiçi Kargo"}
                </span>
              </div>
              <div className="p-3 bg-surface-container rounded-xl text-center">
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  {"MNG Kargo"}
                </span>
              </div>
              <div className="p-3 bg-surface-container rounded-xl text-center">
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  {"Aras Kargo"}
                </span>
              </div>
              <div className="p-3 bg-surface-container rounded-xl text-center">
                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                  {"Sendeo / DHL"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
 );
}
