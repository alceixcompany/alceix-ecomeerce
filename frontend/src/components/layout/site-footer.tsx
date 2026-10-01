import { routes } from "@/config/routes";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface-variant mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image alt="Alceix resmi vektör logosu ve kurumsal unvanı (mavi-siyah geometrik tipografi)" className="h-8 w-auto object-contain" src="/marketing/alceix-logo.webp"  width={512} height={160} priority sizes="100px" />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              {"Yeni nesil bulut e-ticaret altyapısı. Komisyonsuz, sıfır maliyetle mağazanızı kurun, pazaryeri ve tedarikçi ağlarıyla tek merkezden dünyaya satın."}
            </p>
            <div className="flex flex-col gap-1 text-caption font-caption text-outline mt-2">
              <p className="font-bold text-on-surface">
                {"Alceix Yazılım Hizmetleri Ticaret Limited Şirketi"}
              </p>
              <p className="">
                {"Maslak Mah. Büyükdere Cad. No: 122/A Sarıyer / İstanbul"}
              </p>
              <p className="">
                {"Mersis No: 0048194829100014 | Destek: destek@alceix.com"}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-4">
              {"Çözümler"}
            </h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm">
              <li className="">
                <Link className="hover:text-primary transition-colors" href={routes.features}>
                  {"E-Ticaret Sitesi Kurma"}
                </Link>
              </li>
              <li className="">
                <Link className="hover:text-primary transition-colors" href={routes.suppliers}>
                  {"Dropshipping & Tedarik"}
                </Link>
              </li>
              <li className="">
                <Link className="hover:text-primary transition-colors" href={routes.influencer}>
                  {"Influencer Pazarlama"}
                </Link>
              </li>
              <li className="">
                <Link className="hover:text-primary transition-colors" href={routes.platform}>
                  {"Anlaşmalı Kargo Fiyatları"}
                </Link>
              </li>
              <li className="">
                <Link className="hover:text-primary transition-colors" href={routes.partners}>
                  {"Pazaryeri Entegrasyonları"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-4">
              {"Kurumsal & Destek"}
            </h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm">
 <li><Link href={routes.about} className="hover:text-primary transition-colors">Hakkımızda</Link></li>

              <li className="">
                <Link className="hover:text-primary transition-colors" href={routes.faq}>
                  {"Sıkça Sorulan Sorular"}
                </Link>
              </li>
              <li className="">
                <Link href={routes.blog} className="hover:text-primary transition-colors">
                  {"Alceix Blog"}
                </Link>
              </li>
              <li className="">
                <a className="hover:text-primary transition-colors" href="mailto:destek@alceix.com">
                  {"İletişim & Yardım"}
                </a>
              </li>
              <li className="">
                <Link className="hover:text-primary transition-colors" href={routes.partners}>
                  {"Ajans & Partner Programı"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-4">
              {"Yasal & Uyumluluk"}
            </h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm">
              <li className="">
                <span className="hover:text-primary transition-colors">
                  {"KVKK Aydınlatma Metni"}
                </span>
              </li>
              <li className="">
                <span className="hover:text-primary transition-colors">
                  {"Kullanım Koşulları"}
                </span>
              </li>
              <li className="">
                <span className="hover:text-primary transition-colors">
                  {"Gizlilik ve Çerez Politikası"}
                </span>
              </li>
              <li className="">
                <span className="hover:text-primary transition-colors">
                  {"Mesafeli Satış Sözleşmesi"}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="py-8 bg-surface-container rounded-xl px-6 flex flex-wrap items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]" aria-hidden="true">
              {"verified_user"}
            </span>
            <div>
              <p className="font-label-md text-label-md text-on-surface">
                {"Güvenli Altyapı & Lisanslı Ödeme"}
              </p>
              <p className="font-caption text-caption text-on-surface-variant">
                {"T.C. Merkez Bankası ve BDDK denetimli lisanslı ödeme kuruluşları altyapısı ile güvendesiniz."}
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-4 text-outline font-label-sm text-label-sm">
            <div className="bg-surface-container-lowest px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-tertiary text-[18px]" aria-hidden="true">
                {"lock"}
              </span>
              <span className="">
                {"256-Bit SSL"}
              </span>
            </div>
            <div className="bg-surface-container-lowest px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
                {"payments"}
              </span>
              <span className="">
                {"BDDK Lisanslı Ödeme"}
              </span>
            </div>
            <div className="bg-surface-container-lowest px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-secondary text-[18px]" aria-hidden="true">
                {"local_shipping"}
              </span>
              <span className="">
                {"Entegre Kargo Ağı"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-caption font-caption text-outline">
          <p className="">
            {"© 2025 Alceix Yazılım Hizmetleri Ticaret Ltd. Şti. Tüm hakları saklıdır."}
          </p>
          <p className="flex items-center gap-4">
            <span className="hover:text-on-surface">
              {"KVKK"}
            </span>
            <span className="">
              {"•"}
            </span>
            <span className="hover:text-on-surface">
              {"Kullanım Koşulları"}
            </span>
            <span className="">
              {"•"}
            </span>
            <span className="hover:text-on-surface">
              {"Güvenlik"}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
