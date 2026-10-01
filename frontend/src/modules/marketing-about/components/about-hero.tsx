import { routes } from "@/config/routes";
import Link from "next/link";
import Image from "next/image";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low/70 via-surface-container-lowest to-surface-container-lowest pt-10 pb-20 border-b border-surface-container-high/40" id="about-home">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <nav className="flex items-center gap-2 mb-8 font-label-sm text-label-sm text-on-surface-variant">
          <Link className="hover:text-primary transition-colors" href="/">
            {"Ana Sayfa"}
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant" aria-hidden="true">
            {"chevron_right"}
          </span>
          <span className="text-primary font-semibold">
            {"Hakkımızda"}
          </span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm shadow-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              {" TÜRKİYE'NİN YENİ NESİL TİCARET ALTYAPISI "}
            </div>
            <h1 className="font-display text-[40px] sm:text-[46px] lg:text-[50px] leading-[1.12] text-on-surface tracking-tight font-extrabold">
              {" E-Ticareti Demokratikleştiriyoruz: "}
              <br />
              <span className="text-primary-container">
                {"Sıfır Maliyet,"}
              </span>
              {" Güçlü Altyapı, Sınırsız Büyüme. "}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
              {" Alceix olarak, geleneksel e-ticaret yazılımlarının yüksek sabit aidatlarını, lisans bariyerlerini ve teknik karmaşasını sonlandırıyoruz. Üreticileri, markaları, dropshipping girişimcilerini ve içerik üreticilerini tek bir kusursuz ekosistemde buluşturuyoruz. "}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface border border-surface-container-high">
                <span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
                  {"check_circle"}
                </span>
                {" 0 TL Sabit Aidat "}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface border border-surface-container-high">
                <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                  {"speed"}
                </span>
                {" %99.8 Kesintisiz SLA "}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface border border-surface-container-high">
                <span className="material-symbols-outlined text-[16px] text-tertiary" aria-hidden="true">
                  {"security"}
                </span>
                {" Lisanslı Ödeme Koruması "}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary transition-all shadow-md hover:shadow-lg font-semibold" href={routes.register}>
                <span>
                  {"Hemen Ücretsiz Başla"}
                </span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {"arrow_forward"}
                </span>
              </Link>
              <a className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors font-semibold" href="#ekip">
                <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
                  {"groups"}
                </span>
                <span>
                  {"Lider Kadro"}
                </span>
              </a>
              <a className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md hover:text-primary hover:bg-surface-container transition-colors border border-surface-container-high" href="#oduller">
                <span className="material-symbols-outlined text-[18px] text-amber-500" aria-hidden="true">
                  {"emoji_events"}
                </span>
                <span>
                  {"Ödüllerimiz"}
                </span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest bg-surface-container-high group">
              <Image alt="Alceix Maslak Genel Merkezi ve Mühendislik Ofisi" className="w-full h-[440px] object-cover group-hover:scale-102 transition-transform duration-700" src="/about/image-0.webp" width={800} height={600} sizes="(max-width: 1024px) 90vw, 560px" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-5 right-5 bg-surface-container-lowest/85 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
                <span className="font-label-sm text-label-sm text-on-surface font-bold">
                  {"Canlı Altyapı Hızı: %99.8 SLA"}
                </span>
              </div>
              <div className="absolute bottom-5 left-5 right-5 bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                      {"corporate_fare"}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-title-md text-on-surface font-bold">
                      {"Maslak R&D Hub"}
                    </h4>
                    <p className="font-caption text-caption text-on-surface-variant">
                      {"İstanbul • 42+ Mühendis & E-Ticaret Mimarı"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-primary-fixed px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <span className="material-symbols-outlined text-[16px] text-primary font-bold" aria-hidden="true">
                    {"bolt"}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-primary-fixed font-bold">
                    {"Yapay Zekâ Lab"}
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -z-10 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
