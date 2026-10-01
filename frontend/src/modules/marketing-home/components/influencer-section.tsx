import { ApplicationForm } from "./application-form";

export function InfluencerSection() {
  return (
    <section className="w-full bg-surface py-20 lg:py-28 relative border-t border-surface-container" id="influencer-agi">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-tertiary/10 px-3.5 py-1.5 rounded-full text-tertiary font-label-sm text-label-sm font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {"campaign"}
            </span>
            {"İÇERİK ÜRETİCİLERİ & INFLUENCER AĞI"}
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
            {"Takipçilerinizi Kazanca Dönüştürün. Sıfır Sermaye ile Satış Ortaklığı Yapın."}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 leading-relaxed">
            {"Alceix mağazalarının binlerce trend ürününü kendi tarzınızla tanıtın, her satıştan anında %10 ila %25 arasında net komisyon kazanın. Ücretsiz profilinizi oluşturun, özel link ve kuponlarınızı anında alın."}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                    {"monitoring"}
                  </span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                  {"Şeffaf & Canlı Hakediş Paneli"}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {"Her tıklama, sepet ve satış anlık olarak panelinize yansır. Tam şeffaflıkla kazancınızı an be an takip edin."}
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                    {"link"}
                  </span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                  {"Kişisel Kupon & UTM Link"}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {"Instagram, TikTok ve YouTube için 1 saniyede size ve kitlenize özel indirim kuponları ve takip linkleri oluşturun."}
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                    {"payments"}
                  </span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                  {"Hızlı IBAN Çekimi"}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {"Her Pazartesi günü onaylanan tüm hakedişleriniz doğrudan belirttiğiniz banka IBAN hesabınıza kesintisiz yatar."}
                </p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                    {"featured_seasonal_and_gifts"}
                  </span>
                </div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                  {"Ücretsiz Numune Ürün Desteği"}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {"Yüksek etkileşimli içerik üreticilerine Alceix anlaşmalı butik ve markalardan ücretsiz tanıtım numunesi gönderilir."}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed/30 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                    {"percent"}
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    {"%10 - %25 Net Satış Komisyonu"}
                  </p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {"Sektörün en yüksek hakediş oranlarıyla peşin sermayesiz e-ticaret geliri elde edin."}
                  </p>
                </div>
              </div>
              <div className="flex items-center -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">
                  {"@E"}
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-secondary">
                  {"@M"}
                </div>
                <div className="w-8 h-8 rounded-full bg-tertiary/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-tertiary">
                  {"@Z"}
                </div>
                <span className="text-caption font-caption text-outline font-semibold pl-3">
                  {"450+ İçerik Üreticisi"}
                </span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl shadow-xl p-8 border border-surface-container" id="influencer-form">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                {"Influencer Olarak Katıl"}
              </h3>
              <span className="bg-tertiary/10 text-tertiary text-caption font-caption font-bold px-2.5 py-1 rounded-full">
                {"Anında Onay"}
              </span>
            </div>
            <ApplicationForm className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-0-1">
                  {"Ad Soyad"}
                </label>
                <input className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-body-md text-on-surface focus:outline-none focus:border-primary" placeholder="Örn: Melisa Aydın" required type="text" id="application-0-1" name="application-0-1" />
              </div>
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-0-4">
                  {"Instagram / TikTok Profil Linki (@username)"}
                </label>
                <input className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-body-md text-on-surface focus:outline-none focus:border-primary" placeholder="Örn: @melisaydin veya instagram.com/melisaydin" required type="text" id="application-0-4" name="application-0-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-0-8">
                    {"Takipçi Sayısı"}
                  </label>
                  <select className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-primary" id="application-0-8" name="application-0-8">
                    <option>
                      {"10K - 50K Takipçi"}
                    </option>
                    <option>
                      {"50K - 250K Takipçi"}
                    </option>
                    <option>
                      {"250K+ Takipçi"}
                    </option>
                    <option>
                      {"5K - 10K (Mikro)"}
                    </option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="application-0-15">
                    {"İçerik Alanı"}
                  </label>
                  <select className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-primary" id="application-0-15" name="application-0-15">
                    <option>
                      {"Moda & Giyim"}
                    </option>
                    <option>
                      {"Kozmetik & Bakım"}
                    </option>
                    <option>
                      {"Ev & Yaşam"}
                    </option>
                    <option>
                      {"Teknoloji & Aksesuar"}
                    </option>
                    <option>
                      {"Anne & Bebek"}
                    </option>
                  </select>
                </div>
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-on-primary py-3.5 rounded-xl font-label-md text-label-md font-bold shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2" type="submit">
                <span className="">
                  {"Hemen Başvur & Kazanmaya Başla"}
                </span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {"arrow_forward"}
                </span>
              </button>
              <div className="pt-3 text-center text-caption font-caption text-outline">
                {"✓ Ücretsiz Katılım • Sözleşme Şartı Yok • Anında Onay"}
              </div>
            </ApplicationForm>
          </div>
        </div>
      </div>
    </section>
  );
}
