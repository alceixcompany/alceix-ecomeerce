
export function InfluencerCta() {
return (
<section className="w-full bg-primary-container text-on-primary-container py-16 lg:py-20 relative overflow-hidden">
<div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
<div className="space-y-4 max-w-2xl text-center lg:text-left">
<h2 className="font-headline-lg text-headline-lg font-bold leading-tight">
{" Kendi Kitlenizle Yeni Bir Kazanç Modeline Adım Atın. "}
</h2>
<p className="font-body-lg text-body-lg text-on-primary-container/90 leading-relaxed">
{" Türkiye'nin en hızlı büyüyen creator ağına bugün katılın, seçtiğiniz ürünlerle ilk komisyon gelirinizi hemen bu hafta elde edin. "}
</p>
<div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 font-caption text-caption">
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"verified"}
</span>
{" Hızlı 24 Saat Onay"}
</span>
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"lock"}
</span>
{" Tamamen Ücretsiz Katılım"}
</span>
<span className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"support_agent"}
</span>
{" 7/24 Creator Desteği"}
</span>
</div>
</div>
<div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full sm:w-auto">
<a className="bg-surface-container-lowest text-primary-container hover:bg-surface-bright font-title-md text-title-md px-8 py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] text-center font-bold" href="#influencer-form">
{" Hemen Ücretsiz Başvurun "}
</a>
<div className="flex items-center justify-center gap-3 text-on-primary-container/80 font-caption text-caption pt-1">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"mail"}
</span>
{" influencer@alceix.com"}
</span>
<span>
{"•"}
</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"call"}
</span>
{" 0850 840 24 00"}
</span>
</div>
</div>
</div>
</section>
);
}
