"use client";

import { useState } from "react";

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export function ProfitSimulator() {
  const [price, setPrice] = useState("699");
  const valid = price.trim() !== "" && Number.isFinite(Number(price)) && Number(price) >= 0;
  const profit = valid ? Number(price) - 240 : 0;

  return <div className="w-full mt-4 p-3 bg-surface-container-low rounded-lg text-left space-y-2">
    <div className="flex justify-between items-center gap-2 text-label-sm">
      <label htmlFor="dropshipping-sale-price" className="text-on-surface-variant">Satış Fiyatınız:</label>
      <input id="dropshipping-sale-price" aria-describedby="dropshipping-profit-note" type="number" min="0" step="1" value={price} onChange={(event) => setPrice(event.target.value)} className="w-24 min-w-0 bg-white rounded px-2 py-1 font-bold text-right" />
    </div>
    <div className="flex justify-between text-label-sm"><span className="text-on-surface-variant">Toptan Maliyet:</span><span className="text-outline">−₺240</span></div>
    <div className="pt-2 border-t border-surface-container flex justify-between items-center gap-2 text-label-sm">
      <span className="text-tertiary font-bold">Örnek Brüt Kâr:</span>
      <output htmlFor="dropshipping-sale-price" aria-live="polite" className={`font-bold text-title-md ${profit < 0 ? "text-error" : "text-tertiary"}`}>{valid ? `${currency.format(profit)} (%${Math.round(profit / 240 * 100)})` : "Fiyat girin"}</output>
    </div>
    <p id="dropshipping-profit-note" className="text-caption text-on-surface-variant">Kargo, vergi ve diğer giderler dahil değildir.</p>
  </div>;
}
