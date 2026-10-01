import { PartnerLogos } from "@/components/layout/partner-logos";

export function DropshippingPartners() {
return (
<section className="w-full bg-surface-container-lowest py-10 border-y border-surface-container">
<div className="max-w-[1280px] mx-auto px-4 lg:px-6 text-center">
<div className="max-w-2xl mx-auto space-y-2 mb-6">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold">
{"Güçlü İş Ortaklarımız & Entegre Altyapı"}
</h2>
<p className="font-body-md text-body-md text-on-surface-variant">
{" Güçlü iş birlikleri kurarak sürdürülebilir, güvenilir ve kesintisiz e-ticaret operasyonları yaratıyoruz. "}
</p>
</div>
<PartnerLogos />
<div className="mt-6 p-4 bg-surface-container-low rounded-xl max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-left">
<div className="flex items-center gap-2">
<div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]" aria-hidden="true">
{"local_shipping"}
</span>
</div>
<div>
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Anlaşmalı Taşıyıcı Ağımız"}
</span>
<p className="font-caption text-caption text-on-surface-variant">
{"Yurtiçi Kargo, MNG, Aras, Sendeo & DHL Express ile %60'a varan özel kurumsal kargo indirimleri"}
</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-label-sm font-label-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
{"Sabit & İndirimli Kargo Fiyatı"}
</span>
</div>
</div>
</div>
</section>
);
}
