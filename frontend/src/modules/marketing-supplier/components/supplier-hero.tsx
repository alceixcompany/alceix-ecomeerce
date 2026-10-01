import Image from "next/image";
import { SupplierForm } from "./supplier-form";

export function SupplierHero() {
 return (
    <section className="relative w-full overflow-hidden bg-surface py-12 lg:py-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full bg-primary-fixed/60 text-primary">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                {"ALCEIX B2B TEDARİKÇİ & DROPSHIPPING AĞI"}
              </span>
            </div>
            <h1 className="font-display text-display text-on-surface tracking-tight leading-tight">
              {" Deponuzdaki Ürünleri "}
              <span className="text-primary">
                {"3.800+ Aktif Satıcıya"}
              </span>
              {" ve Yüzlerce Influencer'a Tek Tıkla Açın. "}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed max-w-2xl">
              {" Alceix Tedarikçi Ağı ile reklam bütçesi yakmadan, binlerce e-ticaret mağazasının vitrinine toptan ve perakende ürün sağlayın. XML, Excel veya API ile anında entegre olun, siparişleri otomatik karşılayın. "}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2 pb-4">
              <div className="flex flex-col p-4 rounded-xl bg-surface-container-low">
                <span className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
                  {"3.800+"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 font-medium">
                  {"Aktif Satıcı Vitrini"}
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-xl bg-surface-container-low">
                <span className="font-headline-md text-headline-md text-primary font-extrabold tracking-tight">
                  {"₺14.2M+"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 font-medium">
                  {"Aylık B2B Hacim"}
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-xl bg-surface-container-low">
                <span className="font-headline-md text-headline-md text-tertiary-container font-extrabold tracking-tight">
                  {"%98.4"}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 font-medium">
                  {"Zamanında SLA"}
                </span>
              </div>
            </div>
            <div className="relative w-full rounded-2xl overflow-hidden shadow-lg aspect-[16/9] group">
              <Image alt="Alceix akıllı B2B lojistik operasyon merkezi ve konveyör bantlı sevkiyat hattı" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="/supplier/warehouse.webp" width={512} height={286} priority sizes="(max-width: 1024px) 90vw, 560px" />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-md">
                  <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                    {"conveyor_belt"}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    {"Akıllı Barkod & Otomatik İkmal Merkezi"}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary-container text-on-secondary font-label-sm text-label-sm font-semibold shadow-sm">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    {"bolt"}
                  </span>
                  <span>
                    {"Canlı Lojistik Entegrasyonu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 w-full" id="basvuru-formu">
            <div className="bg-surface-container-lowest rounded-2xl p-7 lg:p-9 shadow-xl relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[24px]" aria-hidden="true">
                    {"storefront"}
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {"Tedarikçi Ortaklık Başvurusu"}
                  </h2>
                  <p className="font-caption text-caption text-outline">
                    {"B2B Yetkili Giriş Portalı"}
                  </p>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                {" Bilgilerinizi iletin, B2B tedarikçi operasyon ekibimiz 24 saat içinde sizinle iletişime geçsin. "}
              </p>
              <SupplierForm className="flex flex-col gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" htmlFor="companyName">
                    {" Firma / Marka Ticari Unvanı "}
                  </label>
                  <input className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="companyName" name="companyName" placeholder="Örn: ABC Tekstil San. ve Tic. Ltd. Şti." required type="text" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" htmlFor="contactName">
                      {" Yetkili Adı & Soyadı "}
                    </label>
                    <input className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="contactName" name="contactName" placeholder="Ad Soyad" required type="text" />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" htmlFor="contactPhone">
                      {" Telefon Numarası "}
                    </label>
                    <input className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="contactPhone" name="phone" placeholder="05XX XXX XX XX" required type="tel" />
                  </div>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" htmlFor="contactEmail">
                    {" Kurumsal E-Posta Adresi "}
                  </label>
                  <input className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="contactEmail" name="email" placeholder="tedarik@sirketiniz.com" required type="email" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" htmlFor="category">
                    {" Ana Ürün Kategorisi "}
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="category" name="category" required defaultValue="">
                    <option disabled value="">
                      {"Kategori Seçiniz"}
                    </option>
                    <option value="moda">
                      {"Moda & Giyim"}
                    </option>
                    <option value="ev">
                      {"Ev & Yaşam"}
                    </option>
                    <option value="kozmetik">
                      {"Kozmetik & Kişisel Bakım"}
                    </option>
                    <option value="elektronik">
                      {"Elektronik & Aksesuar"}
                    </option>
                    <option value="bebek">
                      {"Anne & Bebek"}
                    </option>
                    <option value="diger">
                      {"Diğer Kategoriler"}
                    </option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" htmlFor="skuCount">
                      {" Aktif SKU Sayısı "}
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="skuCount" name="skuCount" required defaultValue="">
                      <option disabled value="">
                        {"Seçiniz"}
                      </option>
                      <option value="100-500">
                        {"100 - 500 SKU"}
                      </option>
                      <option value="500-2500">
                        {"500 - 2.500 SKU"}
                      </option>
                      <option value="2500+">
                        {"2.500+ SKU"}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold" htmlFor="dailyCapacity">
                      {" Günlük Paket Kapasitesi "}
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="dailyCapacity" name="dailyCapacity" required defaultValue="">
                      <option disabled value="">
                        {"Seçiniz"}
                      </option>
                      <option value="50-200">
                        {"50 - 200 Paket"}
                      </option>
                      <option value="200-1000">
                        {"200 - 1.000 Paket"}
                      </option>
                      <option value="1000+">
                        {"1.000+ Paket"}
                      </option>
                    </select>
                  </div>
                </div>
                <fieldset>
                  <legend className="block font-label-sm text-label-sm text-on-surface mb-1.5 font-semibold">
                    {" Entegrasyon Tercihi "}
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center justify-center p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-primary-fixed hover:text-primary transition-colors text-center font-medium supplier-integration-option">
                      <input defaultChecked className="sr-only" name="integration" type="radio" value="xml" />
                      <span>
                        {"XML Linki"}
                      </span>
                    </label>
                    <label className="flex items-center justify-center p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-primary-fixed hover:text-primary transition-colors text-center font-medium supplier-integration-option">
                      <input className="sr-only" name="integration" type="radio" value="excel" />
                      <span>
                        {"Excel"}
                      </span>
                    </label>
                    <label className="flex items-center justify-center p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm cursor-pointer hover:bg-primary-fixed hover:text-primary transition-colors text-center font-medium supplier-integration-option">
                      <input className="sr-only" name="integration" type="radio" value="api" />
                      <span>
                        {"REST API"}
                      </span>
                    </label>
                  </div>
                </fieldset>
                <button className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary active:scale-[0.99] transition-all" type="submit">
                  <span>
                    {"B2B Tedarikçi Başvurusu Gönder"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    {"arrow_forward"}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-1.5 pt-2 text-center text-outline">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    {"lock"}
                  </span>
                  <p className="font-caption text-caption">
                    {" Bilgileriniz 6698 sayılı KVKK kapsamında güvence altındadır. Başvuru tamamen ücretsizdir. "}
                  </p>
                </div>
              </SupplierForm>
            </div>
          </div>
        </div>
      </div>
    </section>
 );
}
