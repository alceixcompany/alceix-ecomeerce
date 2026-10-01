
export function FaqSection() {
  return (
    <section className="w-full bg-surface-container-low py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full text-secondary font-label-sm text-label-sm uppercase tracking-wider mb-3">
            {"Merak Edilenler"}
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {"Sıkça Sorulan Sorular"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            {"Aklınıza takılan tüm soruların şeffaf ve net yanıtları."}
          </p>
        </div>
        <div className="space-y-4" id="faq-accordion">
          <details className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden faq-entry" name="home-faq">
            <summary className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface font-bold hover:text-primary transition-colors">
              <span className="">
                {"0 TL ile nasıl e-ticaret sitesi açabilirim? Gerçekten gizli bir ücret yok mu?"}
              </span>
              <span className="material-symbols-outlined text-[22px] text-outline transition-transform" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="faq-content  px-6 pb-6 pt-1 text-body-md font-body-md text-on-surface-variant leading-relaxed">
              {"Alceix'te hiçbir aylık sabit aidat, yıllık paket yenileme bedeli, tema satın alma veya sunucu barındırma ücreti yoktur. Mağazanızı 4 dakikada tamamen ücretsiz açarsınız. Yalnızca satış gerçekleştirdiğinizde şeffaf %3 - %5 komisyon kesilir. Satış yapmadığınız aylarda tek kuruş fatura çıkmaz."}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden faq-entry" name="home-faq">
            <summary className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface font-bold hover:text-primary transition-colors">
              <span className="">
                {"Kendi ürünlerimi satarken aynı zamanda Dropshipping yapabilir miyim?"}
              </span>
              <span className="material-symbols-outlined text-[22px] text-outline transition-transform" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="faq-content  px-6 pb-6 pt-1 text-body-md font-body-md text-on-surface-variant leading-relaxed">
              {"Evet! İster kendi deponuzdaki veya atölyenizdeki ürünleri yükleyin, ister Alceix dropshipping havuzundaki 50.000+ ürünü tek tıkla mağazanıza ekleyin. İki modeli hibrit olarak aynı mağaza vitrininde sorunsuzca yönetebilirsiniz."}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden faq-entry" name="home-faq">
            <summary className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface font-bold hover:text-primary transition-colors">
              <span className="">
                {"Influencer marketing sistemi nasıl çalışıyor?"}
              </span>
              <span className="material-symbols-outlined text-[22px] text-outline transition-transform" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="faq-content  px-6 pb-6 pt-1 text-body-md font-body-md text-on-surface-variant leading-relaxed">
              {"Platform içindeki yüzlerce onaylı influencer'a komisyon teklif edebilirsiniz. Influencer'lar sizin için özel indirim kuponu ve UTM takip linkleriyle ürünlerinizi tanıtır. Peşin reklam bütçesi vermezsiniz; sadece sipariş onaylandığında hak ettikleri komisyon bakiyelerine aktarılır."}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden faq-entry" name="home-faq">
            <summary className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface font-bold hover:text-primary transition-colors">
              <span className="">
                {"Kargo anlaşmaları ve termal etiket süreci nasıl işler?"}
              </span>
              <span className="material-symbols-outlined text-[22px] text-outline transition-transform" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="faq-content  px-6 pb-6 pt-1 text-body-md font-body-md text-on-surface-variant leading-relaxed">
              {"Tek bir evrak veya şirket sözleşmesi yapmadan Yurtiçi, MNG, Aras, Sendeo ve DHL ile %60'a varan indirimli kargo anlaşmamızdan anında faydalanırsınız. Sipariş geldiğinde panelden tek tıkla termal kargo barkodunu yazdırıp kuryeyi adresinize çağırabilirsiniz."}
            </div>
          </details>
          <details className="bg-surface-container-lowest rounded-xl shadow-xs overflow-hidden faq-entry" name="home-faq">
            <summary className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-title-md text-title-md text-on-surface font-bold hover:text-primary transition-colors">
              <span className="">
                {"Ödemelerimi ve hakedişlerimi ne zaman alırım?"}
              </span>
              <span className="material-symbols-outlined text-[22px] text-outline transition-transform" aria-hidden="true">
                {"expand_more"}
              </span>
            </summary>
            <div className="faq-content  px-6 pb-6 pt-1 text-body-md font-body-md text-on-surface-variant leading-relaxed">
              {"BDDK lisanslı sanal POS altyapımız sayesinde müşterileriniz tüm kredi kartlarına 12 aya varan taksitle güvenle alışveriş yapar. Hakedişleriniz sipariş teslimatını takip eden ertesi iş gününde doğrudan belirttiğiniz banka IBAN hesabınıza kesintisiz aktarılır."}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
