
export function SupplierFaq() {
 return (
    <section className="w-full bg-surface py-16 lg:py-24">
      <div className="max-w-[960px] mx-auto px-6">
        <div className="text-center mb-12">
          <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary mb-2 inline-block">
            {"Merak Edilenler"}
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            {" Tedarikçilerimizin En Çok Merak Ettiği Sorular "}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            {" Aklınıza takılan tüm soruların şeffaf ve net yanıtları. "}
          </p>
        </div>
        <div className="flex flex-col gap-3.5" id="faqGroup">
          <details className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden supplier-faq-item" name="supplier-faq">
            <summary className="w-full p-5 lg:p-6 text-left flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface hover:text-primary transition-colors focus:outline-none">
              <span className="font-bold">
                {"Tedarikçi olmak için herhangi bir ücret veya aylık aidat ödüyor muyum?"}
              </span>
              <span className="material-symbols-outlined text-outline transition-transform duration-200" id="icon-faq-1" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="px-5 lg:px-6 pb-6 pt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed" id="faq-1">
              {" Hayır. Alceix tedarikçi ağına katılmak, ürün listelemek ve satıcılara açmak tamamen ücretsizdir. Hiçbir giriş aidatı, listeleme ücreti veya aylık abonelik bedeli alınmaz. "}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden supplier-faq-item" name="supplier-faq">
            <summary className="w-full p-5 lg:p-6 text-left flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface hover:text-primary transition-colors focus:outline-none">
              <span className="font-bold">
                {"Ürünlerimin toptan fiyatını ve kâr marjımı kim belirliyor?"}
              </span>
              <span className="material-symbols-outlined text-outline transition-transform duration-200" id="icon-faq-2" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="px-5 lg:px-6 pb-6 pt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed" id="faq-2">
              {" Tedarikçi olarak ürünlerinizin size net kalacak toptan tedarik fiyatını (hakedişinizi) tamamen siz belirlersiniz. Satıcılar ve influencer'lar bu taban fiyat üzerine kendi kâr marjlarını veya komisyonlarını koyarak satış yaparlar. "}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden supplier-faq-item" name="supplier-faq">
            <summary className="w-full p-5 lg:p-6 text-left flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface hover:text-primary transition-colors focus:outline-none">
              <span className="font-bold">
                {"Kargo ve paketleme süreci nasıl işler? Kargo ücretini kim öder?"}
              </span>
              <span className="material-symbols-outlined text-outline transition-transform duration-200" id="icon-faq-3" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="px-5 lg:px-6 pb-6 pt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed" id="faq-3">
              {" Sipariş geldiğinde Alceix sisteminde otomatik barkodlu kargo etiketi oluşturulur. Siz yalnızca paketi hazırlayıp anlaşmalı kargo kuryesine teslim edersiniz. Kargo ücreti doğrudan nihai müşteri veya satıcı tarafından karşılanır, tedarikçiye ek kargo masrafı yansımaz. "}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden supplier-faq-item" name="supplier-faq">
            <summary className="w-full p-5 lg:p-6 text-left flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface hover:text-primary transition-colors focus:outline-none">
              <span className="font-bold">
                {"Stok entegrasyonu nasıl sağlanır? ERP sistemleri destekleniyor mu?"}
              </span>
              <span className="material-symbols-outlined text-outline transition-transform duration-200" id="icon-faq-4" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="px-5 lg:px-6 pb-6 pt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed" id="faq-4">
              {" Evet. Standart XML linkleriniz, Excel dosyalarınız veya doğrudan REST API bağlantısı üzerinden tüm ERP ve pazar yeri entegratörleri (Nebim, Logo, Mikro, Ticimax vb.) ile gerçek zamanlı stok ve fiyat senkronizasyonu sağlanır. "}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden supplier-faq-item" name="supplier-faq">
            <summary className="w-full p-5 lg:p-6 text-left flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface hover:text-primary transition-colors focus:outline-none">
              <span className="font-bold">
                {"Hakediş ödemelerimi ne zaman ve nasıl alırım?"}
              </span>
              <span className="material-symbols-outlined text-outline transition-transform duration-200" id="icon-faq-5" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="px-5 lg:px-6 pb-6 pt-1 font-body-md text-body-md text-on-surface-variant leading-relaxed" id="faq-5">
              {" Kargo müşteriye teslim edildikten ve yasal onay süreci tamamlandıktan sonra hakedişiniz her hafta düzenli olarak belirttiğiniz şirket IBAN hesabınıza kesintisiz aktarılır. "}
            </div>
          </details>
        </div>
      </div>
    </section>
 );
}
