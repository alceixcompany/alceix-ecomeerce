import { ApplicationForm } from "./application-form";

export function SupplierSection() {
  return (
    <section className="w-full bg-surface-container-low py-20 lg:py-28 relative border-t border-surface-container" id="tedarikci-agi">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 px-3.5 py-1.5 rounded-full text-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {"inventory_2"}
            </span>
            {"B2B & DROPSHIPPING TEDARİKÇİ MERKEZİ"}
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
            {"Ürünlerinizi 3.800+ Aktif Satıcı ve Yüzlerce Influencer ile Milyonlara Ulaştırın."}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 leading-relaxed">
            {"Deponuzdaki ürünleri Alceix tedarikçi havuzuna bağlayın. Satıcılar ürünlerinizi tek tıkla vitrinlerine eklesin, siparişler doğrudan sisteminize düşsün. Reklam bütçesi harcamadan toptan ve perakende satışlarınızı katlayın."}
          </p>
        </div>
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-title-md text-title-md font-bold text-on-surface">
              {"Öne Çıkan Onaylı Tedarikçi Firmalarımız"}
            </h4>
            <span className="text-caption font-caption text-outline">
              {"Doğrulanmış Üretici & İthalatçılar"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {"Nordik Tekstil A.Ş."}
              </span>
              <span className="text-caption font-caption text-secondary font-medium mt-1">
                {"Ev & Yaşam"}
              </span>
              <div className="mt-3 pt-2 border-t border-surface-container text-[11px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary" aria-hidden="true">
                  {"verified"}
                </span>
                {"1.450 Ürün"}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {"Venezia Deri Fabrikası"}
              </span>
              <span className="text-caption font-caption text-secondary font-medium mt-1">
                {"Ayakkabı & Çanta"}
              </span>
              <div className="mt-3 pt-2 border-t border-surface-container text-[11px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary" aria-hidden="true">
                  {"verified"}
                </span>
                {"820 Ürün"}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {"Luxe Moda Atölyesi"}
              </span>
              <span className="text-caption font-caption text-secondary font-medium mt-1">
                {"Kadın Giyim"}
              </span>
              <div className="mt-3 pt-2 border-t border-surface-container text-[11px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary" aria-hidden="true">
                  {"verified"}
                </span>
                {"2.100 Ürün"}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {"Anatolia Kimya"}
              </span>
              <span className="text-caption font-caption text-secondary font-medium mt-1">
                {"Kişisel Bakım"}
              </span>
              <div className="mt-3 pt-2 border-t border-surface-container text-[11px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary" aria-hidden="true">
                  {"verified"}
                </span>
                {"640 Ürün"}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container flex flex-col justify-between hover:shadow-sm transition-shadow">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {"TechNova Elektronik"}
              </span>
              <span className="text-caption font-caption text-secondary font-medium mt-1">
                {"Aksesuar & Şarj"}
              </span>
              <div className="mt-3 pt-2 border-t border-surface-container text-[11px] text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary" aria-hidden="true">
                  {"verified"}
                </span>
                {"980 Ürün"}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-8 sm:p-12 border border-surface-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="tedarikci-form">
          <div className="lg:col-span-6">
            <div className="inline-block bg-secondary/10 text-secondary text-caption font-caption font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-3">
              {"Tedarikçi Ağına Katılın"}
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight mb-4">
              {"Alceix Tedarikçi Ağına Katılın, Satışlarınızı Otomatikleştirin"}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              {"Stoklarınızı entegre edin, binlerce satıcı sizin adınıza pazarlasın. Siparişler tek formatta barkodlansın, ödemeniz peşin güvence altına alınsın."}
            </p>
            <div className="space-y-3.5 mb-6">
              <div className="flex items-center gap-3 text-body-sm font-body-sm text-on-surface">
                <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    {"check"}
                  </span>
                </span>
                <span className="">
                  <strong>
                    {"Toplu XML / Excel / API Entegrasyonu:"}
                  </strong>
                  {"Anlık stok ve fiyat senkronizasyonu."}
                </span>
              </div>
              <div className="flex items-center gap-3 text-body-sm font-body-sm text-on-surface">
                <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    {"check"}
                  </span>
                </span>
                <span className="">
                  <strong>
                    {"Otomatik Kargo Barkodu & Tahsilat Garantisi:"}
                  </strong>
                  {"Taşıma etiketleri sistemden çıkar."}
                </span>
              </div>
              <div className="flex items-center gap-3 text-body-sm font-body-sm text-on-surface">
                <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    {"check"}
                  </span>
                </span>
                <span className="">
                  <strong>
                    {"Peşin Fatura ve Güvenli Ödeme:"}
                  </strong>
                  {"Risk ve tahsilat derdi olmadan hacimli satış."}
                </span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 bg-surface-container-low p-6 sm:p-8 rounded-xl border border-surface-container">
            <h4 className="font-title-md text-title-md text-on-surface font-bold mb-4">
              {"B2B Tedarikçi Başvuru Formu"}
            </h4>
            <ApplicationForm className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-1-1">
                  {"Firma / Şirket Ünvanı"}
                </label>
                <input className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container rounded-xl text-body-md text-on-surface focus:outline-none focus:border-secondary" placeholder="Örn: Nordik Tekstil San. ve Tic. A.Ş." required type="text" id="application-1-1" name="application-1-1" />
              </div>
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-1-4">
                  {"Yetkili İletişim (Telefon / E-posta)"}
                </label>
                <input className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container rounded-xl text-body-md text-on-surface focus:outline-none focus:border-secondary" placeholder="Örn: 0532 xxx xx xx | info@firma.com" required type="text" id="application-1-4" name="application-1-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-1-8">
                    {"Ürün Kategorisi"}
                  </label>
                  <select className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-secondary" id="application-1-8" name="application-1-8">
                    <option>
                      {"Tekstil & Giyim"}
                    </option>
                    <option>
                      {"Ayakkabı & Çanta"}
                    </option>
                    <option>
                      {"Ev, Yaşam & Mobilya"}
                    </option>
                    <option>
                      {"Kozmetik & Sağlık"}
                    </option>
                    <option>
                      {"Elektronik & Aksesuar"}
                    </option>
                    <option>
                      {"Diğer Üretim / İthalat"}
                    </option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-1-17">
                    {"Aylık Sevkiyat Kapasitesi"}
                  </label>
                  <select className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-secondary" id="application-1-17" name="application-1-17">
                    <option>
                      {"500 - 2.000 Paket / Ay"}
                    </option>
                    <option>
                      {"2.000 - 10.000 Paket / Ay"}
                    </option>
                    <option>
                      {"10.000+ Paket / Ay"}
                    </option>
                  </select>
                </div>
              </div>
              <button className="w-full mt-3 bg-secondary hover:bg-secondary-container text-on-secondary py-3 rounded-xl font-label-md text-label-md font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2" type="submit">
                <span className="">
                  {"Tedarikçi Olarak Başvur"}
                </span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {"arrow_forward"}
                </span>
              </button>
              <p className="text-caption font-caption text-outline text-center mt-2">
                {"Tedarikçi ekibimiz 24 saat içinde başvurunuzu inceleyip API entegrasyon sürecini başlatır."}
              </p>
            </ApplicationForm>
          </div>
        </div>
      </div>
    </section>
  );
}
