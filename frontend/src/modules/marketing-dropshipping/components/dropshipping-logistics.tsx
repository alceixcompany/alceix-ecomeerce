import Image from "next/image";

export function DropshippingLogistics() {
return (
<section className="w-full bg-surface-container-low py-10">
<div className="max-w-[1280px] mx-auto px-4 lg:px-6">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
<div className="lg:col-span-5 space-y-4">
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"conveyor_belt"}
</span>
<span>
{"ENDÜSTRİYEL ENTEGRE LOJİSTİK"}
</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
{" Devasa Depo Ağı Cebinizde, Üstelik Sıfır Kira ve Personel Maliyetiyle. "}
</h2>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
{" Türkiye genelindeki yüz binlerce metrekarelik son teknoloji akıllı lojistik merkezleri, otomatik konveyör hatları ve barkodlama istasyonları sizin operasyon ekibiniz gibi çalışır. Siz dijital pazarlamaya ve satışa odaklanın; paketleme, etiketleme ve kargolamayı tedarikçilerimiz kusursuz yönetsin. "}
</p>
<div className="space-y-2 pt-1">
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-primary text-[20px] mt-0.5" aria-hidden="true">
{"verified"}
</span>
<div>
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Kör Kargo & White-Label Standartı"}
</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
{"Kargo kolisinde veya irsaliyede asla Alceix veya toptancı bilgisi yer almaz. Paket tamamen sizin logonuz ve adınızla müşterinize ulaşır."}
</p>
</div>
</div>
<div className="flex items-start gap-2">
<span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5" aria-hidden="true">
{"sync_alt"}
</span>
<div>
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Gerçek Zamanlı Stok Koruması"}
</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
{"Tedarikçi deposundaki anlık barkod okumaları mağazanıza milisaniyeler içinde yansır; müşteriye tükenmiş ürün satma riski ortadan kalkar."}
</p>
</div>
</div>
</div>
</div>
<div className="lg:col-span-7">
<div className="relative rounded-2xl overflow-hidden shadow-xl bg-surface-container">
<Image className="w-full h-[440px] object-cover" src="/dropshipping/warehouse.jpg" alt="Entegre lojistik ve sipariş hazırlama deposu" width={1200} height={800} sizes="(min-width: 1024px) 650px, 100vw" />
<div className="absolute bottom-6 left-6 right-6 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-2">
<div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]" aria-hidden="true">
{"precision_manufacturing"}
</span>
</div>
<div>
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Akıllı Ayrıştırma & Sevk Hatları"}
</span>
<p className="font-caption text-caption text-on-surface-variant">
{"Günlük 120.000+ paket otomatik barkodlama kapasitesi"}
</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-tertiary bg-on-tertiary-container/70 px-3 py-1.5 rounded-full font-bold">
{"Ortalama Sevk: 14.2 Saat"}
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
