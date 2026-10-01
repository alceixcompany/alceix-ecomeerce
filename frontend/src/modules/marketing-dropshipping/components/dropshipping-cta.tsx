import { routes } from "@/config/routes";
import Link from "next/link";

export function DropshippingCta() {
return (
<section className="w-full bg-surface-container-lowest py-10">
<div className="max-w-[1280px] mx-auto px-4 lg:px-6">
<div className="relative rounded-3xl bg-primary-container text-on-primary p-10 lg:p-20 overflow-hidden shadow-2xl">
<div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary rounded-full blur-2xl opacity-50 pointer-events-none">

</div>
<div className="absolute -left-10 -top-10 w-80 h-80 bg-secondary-container rounded-full blur-3xl opacity-30 pointer-events-none">

</div>
<div className="relative z-10 max-w-3xl space-y-4">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-on-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"verified"}
</span>
<span>
{"Hemen Şimdi Başlayın • İlk 100 Siparişe Özel 0 Komisyon"}
</span>
</div>
<h2 className="font-headline-lg text-headline-lg tracking-tight font-extrabold text-on-primary">
{" Bugün Sıfır Riskle Kendi E-Ticaret İşinizi Başlatın. "}
</h2>
<p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl leading-relaxed">
{" Kredi kartı gerekmez. Ön sermaye, depo ve ambalaj masrafı yok. Ücretsiz mağazanızı açın, Alceix akıllı kataloğundan ilk ürününüzü ekleyip dakikalar içinde vitrininizi canlıya alın. "}
</p>
<div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
<Link className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-primary font-label-md text-label-md shadow-lg active:scale-95 transition-all" href={routes.register}>
<span>
{"Hemen Ücretsiz Başlayın"}
</span>
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"arrow_forward"}
</span>
</Link>
<div className="flex items-center gap-2 text-on-primary font-body-sm text-body-sm px-2">
<span className="material-symbols-outlined text-[20px]" aria-hidden="true">
{"headset_mic"}
</span>
<span>
{"7/24 Canlı Destek & Birebir Mağaza Kurulum Danışmanı"}
</span>
</div>
</div>
</div>
</div>
</div>
</section>
);
}
