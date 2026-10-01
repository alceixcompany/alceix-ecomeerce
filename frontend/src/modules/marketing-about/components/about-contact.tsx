import { routes } from "@/config/routes";
import Link from "next/link";

export function AboutContact() {
  return (
    <section className="py-20 bg-surface-container-lowest" id="iletisim">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-surface-container text-on-surface p-10 lg:p-16 shadow-xl border border-surface-container-high">
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-fixed rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-secondary-fixed rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {"rocket_launch"}
                </span>
                {" GELECEĞİN E-TİCARETİ ŞİMDİ BAŞLIYOR "}
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold max-w-2xl">
                {" Siz de Alceix Ailesine Katılın, E-Ticarette Yeni Bir Çağ Başlatın. "}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                {" Kredi kartı gerekmez. Sıfır kurulum ücreti, sınırsız ürün yükleme ve dakikalar içinde canlıya alma imkânı. "}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary transition-colors shadow-md font-bold" href={routes.register}>
                  <span>
                    {"0 TL ile Mağazanızı Açın"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    {"store"}
                  </span>
                </Link>
                <a className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm font-semibold border border-surface-container-high" href="mailto:info@alceix.com">
                  <span>
                    {"Kurumsal Ekiple İletişime Geçin"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    {"mail"}
                  </span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-4 p-6 rounded-2xl bg-surface-container-lowest shadow-md space-y-4 text-left border border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                    {"corporate_fare"}
                  </span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    {"Genel Merkez"}
                  </h4>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {"Maslak • İstanbul"}
                  </p>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                <strong>
                  {"Alceix Group Yazılım Hizmetleri Ticaret Limited Şirketi"}
                </strong>
                <br />
                {" Maslak Mah. Büyükdere Cad. No: 255 Nurol Plaza, Sarıyer / İstanbul "}
              </p>
              <div className="pt-2 flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container-high">
                <div className="flex items-center gap-2 pt-2">
                  <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                    {"mail"}
                  </span>
                  <a className="hover:text-primary transition-colors font-medium" href="mailto:info@alceix.com">
                    {"info@alceix.com"}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
                    {"support_agent"}
                  </span>
                  <span className="font-medium">
                    {"7/24 Öncelikli Müşteri Desteği"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
