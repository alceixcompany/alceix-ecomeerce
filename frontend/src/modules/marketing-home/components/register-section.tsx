import Link from "next/link";
import { routes } from "@/config/routes";

export function RegisterSection() {
  return (
    <section className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-20 lg:py-28 relative overflow-hidden" id="register">
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-on-primary/10 backdrop-blur-md px-4 py-1.5 rounded-full font-label-sm text-label-sm text-on-primary mb-6">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {"verified_user"}
          </span>
          {"Bugün Katılan 850+ Girişimci Arasına Katılın"}
        </div>
        <h2 className="font-display text-display font-extrabold tracking-tight mb-6 text-balance">
          {"Bugün 0 TL ile Kendi E-Ticaret Sitenizi Açın, Satış Yaptıkça Büyüyün."}
        </h2>
        <p className="font-body-lg text-body-lg text-primary-fixed max-w-2xl mx-auto mb-10 leading-relaxed">
          {"Sıfır finansal risk, peşin yazılım aidatı yok. Mağazanızı 4 dakikada kurun; dropshipping havuzu, influencer ağı ve anlaşmalı kargo avantajlarıyla hemen kazanın."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface text-primary font-label-md text-label-md px-9 py-4 rounded-xl shadow-xl font-bold transition-all active:scale-95" href={routes.register}>
            <span className="">
              {"0 TL ile Hemen Başla"}
            </span>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {"arrow_forward"}
            </span>
          </Link>
          <a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-fixed-dim/20 hover:bg-primary-fixed-dim/30 text-on-primary font-label-md text-label-md px-7 py-4 rounded-xl transition-all" href="#showcase">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {"visibility"}
            </span>
            <span className="">
              {"Canlı Mağaza Demosu"}
            </span>
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-label-sm font-label-sm text-primary-fixed">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {"check_circle"}
            </span>
            {"Kurulum Masrafı: 0 TL"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {"check_circle"}
            </span>
            {"Aylık Sabit Ücret: 0 TL"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {"check_circle"}
            </span>
            {"Şeffaf Satış Komisyonu: %3 - %5"}
          </span>
        </div>
      </div>
    </section>
  );
}
