import Image from "next/image";
import { DemoCartButton } from "./demo-cart-button";

export function ShowcaseSection() {
  return (
    <section className="w-full bg-surface-container-low py-16 lg:py-24" id="showcase">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full text-secondary font-label-sm text-label-sm uppercase tracking-wider mb-3">
            {"Canlı Ekosistem"}
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {"Kusursuz Mağaza Vitrini, Güçlü Satıcı Paneli"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            {"Müşterileriniz için ışık hızında mobil alışveriş deneyimi; sizin için tüm satış, kargo ve influencer trafiğini tek tıkla yönetebileceğiniz akıllı komuta merkezi."}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl shadow-md p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-error/70" />
                  <span className="w-3 h-3 rounded-full bg-surface-dim" />
                  <span className="w-3 h-3 rounded-full bg-tertiary/70" />
                </div>
                <div className="bg-surface-container px-3 py-1 rounded-md text-caption font-caption text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-tertiary" aria-hidden="true">
                    {"lock"}
                  </span>
                  {"heer-atelier.alceix.store"}
                </div>
                <span className="material-symbols-outlined text-[18px] text-outline" aria-hidden="true">
                  {"tune"}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-extrabold uppercase">
                  {"Heer Atelier"}
                </h3>
                <div className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {"search"}
                  </span>
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {"favorite_border"}
                  </span>
                  <div className="relative">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {"shopping_bag"}
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {"2"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden bg-surface-container-low p-3 mb-4">
                <div className="relative w-full h-72 rounded-lg overflow-hidden bg-surface-dim">
                  <Image className="w-full h-full object-cover" src="/marketing/image-1.webp" alt="High-fashion oversized wool coat photographed in high-key natural minimalist studio lighting on an elegant model, neutral beige and charcoal tones, modern quiet luxury Turkish apparel brand Heer Atelier"  width={600} height={600} sizes="(max-width: 1024px) 90vw, 450px" />
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-md text-caption font-caption text-on-surface font-bold">
                    {"YENİ SEZON"}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-md text-caption font-caption text-tertiary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      {"bolt"}
                    </span>
                    {"Hızlı Kargo"}
                  </div>
                </div>
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-caption font-caption text-outline uppercase font-semibold">
                      {"Dış Giyim & Palto"}
                    </span>
                    <div className="flex items-center text-secondary gap-0.5">
                      <span className="material-symbols-outlined text-[14px]" style={{"fontVariationSettings": "'FILL' 1"}} aria-hidden="true">
                        {"star"}
                      </span>
                      <span className="text-caption font-caption font-bold text-on-surface">
                        {"4.9"}
                      </span>
                      <span className="text-caption font-caption text-outline">
                        {"(128)"}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold mb-2">
                    {"Oversize Kaşmir Karışımlı Yün Palto"}
                  </h4>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                      {"₺3.450"}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline line-through">
                      {"₺4.200"}
                    </span>
                    <span className="text-caption font-caption text-tertiary bg-tertiary-fixed/30 font-bold px-1.5 py-0.5 rounded">
                      {"%18 İndirim"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-caption font-caption text-outline">
                      {"Beden:"}
                    </span>
                    <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-caption font-caption text-on-surface font-semibold shadow-xs">
                      {"S"}
                    </span>
                    <span className="px-2.5 py-1 bg-primary text-on-primary rounded-md text-caption font-caption font-semibold shadow-xs">
                      {"M"}
                    </span>
                    <span className="px-2.5 py-1 bg-surface-container-lowest rounded-md text-caption font-caption text-on-surface font-semibold shadow-xs">
                      {"L"}
                    </span>
                  </div>
                  <DemoCartButton className="w-full bg-on-background hover:bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 transition-colors" />
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-xl flex items-center justify-between text-caption font-caption text-on-surface-variant">
              <span className="flex items-center gap-1.5 text-tertiary font-bold">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  {"check_circle"}
                </span>
                {"BDDK Lisanslı 3D Secure"}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  {"local_shipping"}
                </span>
                {"Aynı Gün Kargo"}
              </span>
            </div>
          </div>
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-md p-6 lg:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-headline-sm">
                    {"A"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        {"Heer Atelier Satıcı Paneli"}
                      </h3>
                      <span className="bg-tertiary/10 text-tertiary text-caption font-caption px-2 py-0.5 rounded-full font-bold">
                        {"Canlı Satışta"}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-outline">
                      {"Bugünkü Mağaza Hareketleri ve Gelir Dağılımı"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-surface-container px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                    {"Anlık Ziyaretçi:"}
                    <strong className="text-on-surface">
                      {"42 kişi"}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {"Bugünkü Ciro"}
                    </span>
                    <span className="text-caption font-caption font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
                      {"+%34.2"}
                    </span>
                  </div>
                  <div className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
                    {"₺48.250,00"}
                  </div>
                  <p className="font-caption text-caption text-outline mt-1">
                    {"26 Başarılı Sipariş • 0 TL Sabit Aidat"}
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {"Influencer Ortaklık Satışları"}
                    </span>
                    <span className="text-caption font-caption font-bold text-primary bg-primary-fixed/50 px-2 py-0.5 rounded-full">
                      {"14 Aktif Influencer"}
                    </span>
                  </div>
                  <div className="font-headline-md text-headline-md text-primary font-extrabold tracking-tight">
                    {"₺18.900,00"}
                  </div>
                  <p className="font-caption text-caption text-outline mt-1">
                    {"Önceden bütçe yakmadan yalnızca satış başı pay"}
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {"Dropshipping Havuz Kazancı"}
                    </span>
                    <span className="text-caption font-caption font-bold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                      {"0 Depo Riski"}
                    </span>
                  </div>
                  <div className="font-headline-md text-headline-md text-secondary font-extrabold tracking-tight">
                    {"₺12.400,00"}
                  </div>
                  <p className="font-caption text-caption text-outline mt-1">
                    {"Tedarikçiden müşteriye doğrudan sevkiyat"}
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {"Hazırlanan Kargolar"}
                    </span>
                    <span className="text-caption font-caption font-bold text-on-surface bg-surface-container-highest px-2 py-0.5 rounded-full">
                      {"Yurtiçi & MNG"}
                    </span>
                  </div>
                  <div className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
                    {"38 Paket"}
                  </div>
                  <p className="font-caption text-caption text-outline mt-1">
                    {"Termal barkod tek tıkla hazır • Paket başı ₺28,90"}
                  </p>
                </div>
              </div>
              <div className="mt-6 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3 text-caption font-caption text-outline uppercase font-semibold">
                  <span className="">
                    {"Son Canlı Siparişler"}
                  </span>
                  <span className="text-primary font-bold cursor-pointer hover:underline">
                    {"Tümünü Yönet (38)"}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center font-bold text-caption">
                        {"#184"}
                      </span>
                      <div>
                        <div className="font-label-sm text-label-sm text-on-surface font-semibold">
                          {"Zeynep K. • Beşiktaş / İst."}
                        </div>
                        <div className="font-caption text-caption text-outline">
                          {"Influencer: @melisaydin (Affiliate)"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-label-md text-label-md text-on-surface font-bold">
                        {"₺3.450"}
                      </div>
                      <span className="inline-block bg-tertiary-fixed/30 text-tertiary font-caption text-caption px-2 py-0.5 rounded font-bold">
                        {"Ödendi • Barkod Basıldı"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-caption">
                        {"#183"}
                      </span>
                      <div>
                        <div className="font-label-sm text-label-sm text-on-surface font-semibold">
                          {"Caner B. • Karşıyaka / İzmir"}
                        </div>
                        <div className="font-caption text-caption text-outline">
                          {"Dropshipping Tedarikçisi: Modanisa Hub"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-label-md text-label-md text-on-surface font-bold">
                        {"₺1.890"}
                      </div>
                      <span className="inline-block bg-primary-fixed/50 text-primary font-caption text-caption px-2 py-0.5 rounded font-bold">
                        {"Tedarikçi Hazırlıyor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-surface-container flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                  {"account_balance_wallet"}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-medium">
                  {"Banka IBAN'ına Ertesi Gün Aktarım:"}
                  <strong className="text-on-surface">
                    {"Aktif"}
                  </strong>
                </span>
              </div>
              <a className="inline-flex items-center gap-1.5 text-primary font-label-md text-label-md font-bold hover:underline" href="#simulator">
                <span className="">
                  {"Ciro Kazancınızı Simüle Edin"}
                </span>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  {"arrow_forward"}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
