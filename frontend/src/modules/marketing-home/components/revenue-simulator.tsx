"use client";
import Link from "next/link";
import { routes } from "@/config/routes";


import { useState } from "react";

export function RevenueSimulator() {
  const [revenue, setRevenue] = useState(50000);
  const commission = Math.round(revenue * 0.03);
  const savings = Math.max(0, 54000 - commission * 12);
  const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
  return (
    <section className="w-full bg-surface py-20 lg:py-28 relative" id="simulator">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3.5 py-1.5 rounded-full text-primary font-label-sm text-label-sm font-bold mb-4">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {"calculate"}
            </span>
            {"Şeffaf E-Ticaret Maliyet Hesaplayıcı"}
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {"Aylık Cironuzu Seçin, Alceix ile Cebinizde Kalanı Görün"}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
            {"Geleneksel yazılımlar siz daha tek bir ürün satmadan binlerce lira sabit aidat, tema bedeli ve entegrasyon ücreti talep eder. Alceix ile sabit gideriniz sıfırdır."}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <label className="font-label-md text-label-md text-on-surface font-bold">
              {"Tahmini Aylık Satış Hacminiz:"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto" id="simulator-tabs">
              <button type="button" aria-pressed={revenue === 25000} onClick={() => setRevenue(25000)} className={`sim-tab px-4 py-2 rounded-xl font-label-sm text-label-sm font-bold transition-all ${revenue === 25000 ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
{"₺25.000"}
              </button>
              <button type="button" aria-pressed={revenue === 50000} onClick={() => setRevenue(50000)} className={`sim-tab px-4 py-2 rounded-xl font-label-sm text-label-sm font-bold transition-all ${revenue === 50000 ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
{"₺50.000 (Popüler)"}
              </button>
              <button type="button" aria-pressed={revenue === 100000} onClick={() => setRevenue(100000)} className={`sim-tab px-4 py-2 rounded-xl font-label-sm text-label-sm font-bold transition-all ${revenue === 100000 ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
{"₺100.000"}
              </button>
              <button type="button" aria-pressed={revenue === 250000} onClick={() => setRevenue(250000)} className={`sim-tab px-4 py-2 rounded-xl font-label-sm text-label-sm font-bold transition-all ${revenue === 250000 ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
{"₺250.000"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-8">
            <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {"Klasik E-Ticaret Yazılımları"}
                  </span>
                  <span className="text-caption font-caption bg-error/10 text-error px-2 py-0.5 rounded font-bold">
                    {"Yüksek Risk"}
                  </span>
                </div>
                <ul className="space-y-3 text-body-sm font-body-sm text-on-surface-variant mb-6">
                  <li className="flex items-center justify-between">
                    <span className="">
                      {"Aylık Sabit Paket Aidatı:"}
                    </span>
                    <strong className="text-on-surface">
                      {"₺2.500 / ay"}
                    </strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="">
                      {"Özel Tema & Sunucu Barındırma:"}
                    </span>
                    <strong className="text-on-surface">
                      {"₺1.000 / ay"}
                    </strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="">
                      {"Kargo & Pazaryeri Eklenti Lisansı:"}
                    </span>
                    <strong className="text-on-surface">
                      {"₺1.000 / ay"}
                    </strong>
                  </li>
                  <li className="flex items-center justify-between pt-2 border-t border-surface-container">
                    <span className="">
                      {"Satış Yapmasanız Bile Aylık Masraf:"}
                    </span>
                    <strong className="text-error font-headline-sm text-headline-sm">
                      {"~₺4.500 / ay"}
                    </strong>
                  </li>
                </ul>
              </div>
              <div className="text-caption font-caption text-outline">
                {"* Satış sıfır olsa bile her ay kredi kartınızdan zorunlu tahsil edilir."}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 via-surface-container-lowest to-secondary/5 rounded-xl p-6 flex flex-col justify-between shadow-md relative">
              <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary text-caption font-caption font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {"0 TL Sabit Ücret"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-headline-sm text-headline-sm text-primary font-extrabold">
                    {"Alceix Modeli"}
                  </span>
                </div>
                <ul className="space-y-3 text-body-sm font-body-sm text-on-surface-variant mb-6">
                  <li className="flex items-center justify-between">
                    <span className="">
                      {"Aylık Sabit Aidat / Sunucu:"}
                    </span>
                    <strong className="text-tertiary font-bold text-headline-sm text-headline-sm">
                      {"0 TL"}
                    </strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="">
                      {"Tema, Hosting & SSL Sertifikası:"}
                    </span>
                    <strong className="text-tertiary font-bold">
                      {"ÜCRETSİZ"}
                    </strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span id="label-commission" className="">
                      {"Sadece Satış Başına Komisyon (%3):"}
                    </span>
                    <strong className="text-on-surface font-bold" id="val-commission">
                      {currency.format(commission)}
                    </strong>
                  </li>
                  <li className="flex items-center justify-between pt-2 border-t border-surface-container">
                    <span className="">
                      {"Toplam Aylık Yazılım Maliyetiniz:"}
                    </span>
                    <strong className="text-primary font-headline-sm text-headline-sm" id="val-total-cost">
                      {currency.format(commission)}
                    </strong>
                  </li>
                </ul>
              </div>
              <div className="text-caption font-caption text-on-surface-variant">
                {"* Satış yapmadığınız aylarda tek kuruş fatura kesilmez. Sıfır finansal risk."}
              </div>
            </div>
          </div>
          <div className="bg-primary text-on-primary rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <span className="text-caption font-caption uppercase tracking-wider text-primary-fixed font-bold">
                {"12 Aylık Finansal Avantaj"}
              </span>
              <div className="font-headline-lg text-headline-lg text-on-primary font-black mt-1">
                {"Yıllık Cebinizde Kalan Net Tasarruf:"}
                <span className="text-tertiary-fixed underline decoration-tertiary-fixed/40" id="val-savings">
                  {currency.format(savings)}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-primary-fixed mt-1">
                {"Bu bütçeyi reklamlarınıza, stoklarınıza veya büyümenize yatırın."}
              </p>
            </div>
            <Link className="shrink-0 bg-surface-container-lowest hover:bg-surface text-primary font-label-md text-label-md px-6 py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2" href={routes.register}>
              <span className="">
                {"Ücretsiz Mağazanızı Açın"}
              </span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {"arrow_forward"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
