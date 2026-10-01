import { routes } from "@/config/routes";
import Link from "next/link";

export function DropshippingModels() {
return (
<section className="w-full bg-surface-container-lowest py-10">
<div className="max-w-[1280px] mx-auto px-4 lg:px-6">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
<div>
<span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">
{"ESNEK OPERASYON MODELİ"}
</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
{"İki Farklı Çalışma Şekli: Kontrol Sizde"}
</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-2">
{"İster saniyeler içinde trend ürünleri hızla satışa açın, ister kendi butik markanızı inşa edip yüksek kâr marjlarıyla büyüyün."}
</p>
</div>
<div>
<Link className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-all shadow-md" href={routes.register}>
<span>
{"E-Ticarete Ücretsiz Başlayın"}
</span>
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"north_east"}
</span>
</Link>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="bg-surface-container-low p-10 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between pb-2">
<span className="font-caption text-caption uppercase tracking-wider text-outline font-bold">
{"MODEL 01"}
</span>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
{"Hızlı Başlangıç"}
</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mt-2">
{"1-Tıkla Olduğu Gibi Sat"}
</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-3 leading-relaxed">
{" Başlık, fotoğraf ve açıklamayı değiştirmeden katalogdaki hazır profesyonel stüdyo görselleri ve barkodlarıyla saniyeler içinde mağazanıza aktarın. Zaman kaybetmeden trend ürünleri satmaya başlayın. "}
</p>
<div className="mt-6 p-4 bg-surface-container-lowest rounded-xl shadow-xs space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface font-semibold">
{"Hazır Katalog Entegratörü"}
</span>
<span className="text-caption font-caption text-tertiary font-bold">
{"0 Dk. Hazırlık"}
</span>
</div>
<div className="space-y-2">
<div className="flex items-center justify-between text-body-sm font-body-sm p-2 rounded bg-surface-container-low">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
{"photo_library"}
</span>
{" Stüdyo Çekimleri "}
</span>
<span className="font-bold text-on-surface">
{"Dahil"}
</span>
</div>
<div className="flex items-center justify-between text-body-sm font-body-sm p-2 rounded bg-surface-container-low">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
{"description"}
</span>
{" Hazır SEO Açıklamaları "}
</span>
<span className="font-bold text-on-surface">
{"Hazır"}
</span>
</div>
<div className="flex items-center justify-between text-body-sm font-body-sm p-2 rounded bg-surface-container-low">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
{"sync"}
</span>
{" Otomatik Barkod Eşleşmesi "}
</span>
<span className="font-bold text-tertiary">
{"Anlık"}
</span>
</div>
</div>
</div>
</div>
<div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between">
<span className="text-body-sm font-body-sm text-on-surface-variant">
{"Tavsiye Edilen: Yeni Başlayanlar"}
</span>
<a className="text-primary font-label-md text-label-md hover:underline inline-flex items-center gap-1" href="#katalog">
{"Keşfet "}
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"arrow_forward"}
</span>
</a>
</div>
</div>
<div className="bg-surface-container-low p-10 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between pb-2">
<span className="font-caption text-caption uppercase tracking-wider text-outline font-bold">
{"MODEL 02"}
</span>
<span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
{"Private Label & Maksimum Kâr"}
</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mt-2">
{"Kendi Markanla Özelleştir & Sat"}
</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-3 leading-relaxed">
{" Ürünün perakende satış fiyatını, başlığını, vitrin görselini ve açıklamasını dilediğiniz gibi revize edin. İster özel paketleme notu ekleyin, ister kendi butik kimliğinizi yaratın. "}
</p>
<div className="mt-6 p-4 bg-surface-container-lowest rounded-xl shadow-xs space-y-2">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-on-surface font-semibold">
{"Marka Kimliği & Özel Fiyatlama"}
</span>
<span className="text-caption font-caption text-primary font-bold">
{"Serbest Marj"}
</span>
</div>
<div className="space-y-2">
<div className="flex items-center justify-between text-body-sm font-body-sm p-2 rounded bg-surface-container-low">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
{"sell"}
</span>
{" Fiyatlandırma Kontrolü "}
</span>
<span className="font-bold text-tertiary">
{"%100 Serbest"}
</span>
</div>
<div className="flex items-center justify-between text-body-sm font-body-sm p-2 rounded bg-surface-container-low">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
{"loyalty"}
</span>
{" Kendi Marka Etiketin "}
</span>
<span className="font-bold text-on-surface">
{"Özelleştirilebilir"}
</span>
</div>
<div className="flex items-center justify-between text-body-sm font-body-sm p-2 rounded bg-surface-container-low">
<span className="text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
{"mail"}
</span>
{" Özel Paket İçi Notu "}
</span>
<span className="font-bold text-on-surface">
{"Desteklenir"}
</span>
</div>
</div>
</div>
</div>
<div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between">
<span className="text-body-sm font-body-sm text-on-surface-variant">
{"Tavsiye Edilen: Marka İnşa Edenler"}
</span>
<Link className="text-primary font-label-md text-label-md hover:underline inline-flex items-center gap-1" href={routes.register}>
{"Hemen Başla "}
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"arrow_forward"}
</span>
</Link>
</div>
</div>
</div>
</div>
</section>
);
}
