import { routes } from "@/config/routes";
import Image from "next/image";
import Link from "next/link";
import { ProfitSimulator } from "./profit-simulator";

export function DropshippingHero() {
return (
<><div className="w-full bg-surface-container-low border-b border-surface-container py-2.5 px-4 lg:px-6 text-center">
<div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 text-body-sm font-body-sm text-on-surface">
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
{"YENİ"}
</span>
<span>
{"2025 B2B Akıllı Tedarik Ağı Yayında: 50.000+ Doğrulanmış Yerli Ürün Havuzu Şimdi Erişime Açık."}
</span>
<a className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5 ml-1" href="#katalog">
{"Kataloğu Keşfet "}
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"arrow_forward"}
</span>
</a>
</div>
</div><section className="relative w-full overflow-hidden bg-surface-container-lowest pt-10 pb-24">
<div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/5 via-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10">

</div>
<div className="max-w-[1280px] mx-auto px-4 lg:px-6">
<div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4">
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm shadow-sm">
<span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
{"bolt"}
</span>
<span>
{"50.000+ HAZIR ÜRÜN HAVUZU & 0 TL BAŞLANGIÇ"}
</span>
</div>
<h1 className="font-display text-display text-on-surface tracking-tight max-w-4xl">
{" Depo Tutmadan, Sıfır Sermaye ile E-Ticarete Başlayın: "}
<span className="text-primary">
{"1 Tıkla Dropshipping."}
</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
{" Alceix onaylı B2B üretici havuzundaki 50.000'den fazla ürünü ister olduğu gibi, ister kendi markanız, logonuz ve fiyatınızla özelleştirerek dakikalar içinde vitrininize ekleyin. Satış geldikçe tedarikçi kargolasın, net kârınız doğrudan banka hesabınıza yatsın. "}
</p>
<div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
<Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-lg shadow-primary/20 active:scale-95 transition-all" href={routes.register}>
<span>
{"0 TL ile Mağazanızı Açın & Ürün Seçin"}
</span>
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"arrow_forward"}
</span>
</Link>
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all" href="#katalog">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true">
{"visibility"}
</span>
<span>
{"Örnek Dropship Kataloğunu İncele"}
</span>
</a>
</div>
</div>
<div className="mt-16 w-full bg-surface-container-low p-4 lg:p-6 rounded-2xl shadow-xl">
<div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container">
<div className="flex items-center gap-2.5">
<span className="w-3 h-3 rounded-full bg-error inline-block">

</span>
<span className="w-3 h-3 rounded-full bg-[#eab308] inline-block">

</span>
<span className="w-3 h-3 rounded-full bg-tertiary inline-block">

</span>
<span className="text-caption font-caption text-on-surface-variant uppercase tracking-wider ml-2">
{"Alceix Smart-Fulfillment Engine v2.4"}
</span>
</div>
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 text-label-sm font-label-sm text-tertiary bg-on-tertiary-container/60 px-2.5 py-1 rounded-full">
<span className="w-2 h-2 rounded-full bg-tertiary animate-pulse">

</span>
{" Canlı Entegrasyon Aktif "}
</span>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
<div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm relative group">
<div className="flex items-center justify-between mb-4">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"warehouse"}
</span>
{" Onaylı Tedarikçi Deposu "}
</span>
<span className="text-caption font-caption text-tertiary font-bold">
{"24 Saatte Kargoda"}
</span>
</div>
<div className="flex gap-4">
<Image className="w-24 h-28 object-cover rounded-lg shrink-0 bg-surface-container" src="/dropshipping/supplier-knit.jpg" alt="Onaylı tedarikçi deposundaki triko hırka" width={600} height={600} sizes="96px" priority />
<div className="flex flex-col justify-between py-0.5">
<div>
<span className="text-caption font-caption text-outline uppercase tracking-wider">
{"Nordik Tekstil A.Ş."}
</span>
<h4 className="font-title-md text-title-md text-on-surface leading-tight mt-0.5">
{"Oversize Fit Triko Hırka"}
</h4>
</div>
<div className="space-y-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-on-surface-variant">
{"Toptan Alış:"}
</span>
<span className="font-bold text-on-surface text-headline-sm">
{"₺240"}
</span>
</div>
<div className="text-caption font-caption text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-tertiary text-[14px]" aria-hidden="true">
{"check_circle"}
</span>
{" 2.450 Adet Hazır Stok "}
</div>
</div>
</div>
</div>
<div className="mt-4 pt-2 border-t border-surface-container flex items-center justify-between text-caption font-caption text-on-surface-variant">
<span>
{"Barkod: 869019284918"}
</span>
<span className="text-primary font-semibold">
{"Tedarikçi Kodu: NRD-884"}
</span>
</div>
</div>
<div className="lg:col-span-3 flex flex-col items-center justify-center p-4 bg-surface-container-lowest/80 rounded-xl shadow-sm text-center relative">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md mb-2">
<span className="material-symbols-outlined text-[22px]" aria-hidden="true">
{"swap_horiz"}
</span>
</div>
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Tek Tıkla Vitrine Aktar"}
</span>
<p className="font-caption text-caption text-on-surface-variant mt-1">
{"Özelleştirme ve Fiyat Belirleme"}
</p>
<ProfitSimulator />
<div className="mt-2 flex items-center gap-1 text-caption font-caption text-primary">
<span className="material-symbols-outlined text-[14px]" aria-hidden="true">
{"lock_reset"}
</span>
{" Otomatik Senkronizasyon "}
</div>
</div>
<div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm relative">
<div className="flex items-center justify-between mb-4">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary-fixed/50 font-label-sm text-label-sm text-on-secondary-fixed-variant">
<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
{"storefront"}
</span>
{" Sizin Canlı Mağazanız (Heer Atelier) "}
</span>
<span className="text-caption font-caption text-primary font-bold">
{"Aktif Vitrin"}
</span>
</div>
<div className="flex gap-4">
<div className="relative w-24 h-28 rounded-lg overflow-hidden shrink-0">
<Image className="w-full h-full object-cover" src="/dropshipping/store-knit.jpg" alt="Kişisel mağazada sergilenen triko hırka" width={600} height={600} sizes="96px" priority />
<span className="absolute top-1 left-1 bg-surface-container-lowest/90 backdrop-blur-xs text-[9px] font-bold px-1.5 py-0.5 rounded text-on-surface">
{"Özel Fotoğraf"}
</span>
</div>
<div className="flex flex-col justify-between py-0.5">
<div>
<span className="text-caption font-caption text-primary font-bold">
{"Heer Studio • Koleksiyon 2025"}
</span>
<h4 className="font-title-md text-title-md text-on-surface leading-tight mt-0.5">
{"Nordic Cozy Kaşmir Hırka"}
</h4>
</div>
<div className="space-y-1">
<div className="flex items-center gap-2">
<span className="font-bold text-primary text-headline-sm">
{"₺699"}
</span>
<span className="text-caption font-caption line-through text-outline">
{"₺899"}
</span>
</div>
<div className="inline-flex items-center gap-1 text-caption font-caption text-tertiary bg-on-tertiary-container/40 px-1.5 py-0.5 rounded">
<span className="material-symbols-outlined text-[12px]" aria-hidden="true">
{"local_shipping"}
</span>
{" Ücretsiz Kargo "}
</div>
</div>
</div>
</div>
<div className="mt-4 pt-2 border-t border-surface-container flex items-center justify-between text-caption font-caption">
<span className="text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-primary text-[14px]" aria-hidden="true">
{"qr_code_2"}
</span>
{" Termal Kargo Barkodu Hazır "}
</span>
<span className="text-tertiary font-bold">
{"White-Label Kör Kargo"}
</span>
</div>
</div>
</div>
</div>
<div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-6 px-4 bg-surface-container-lowest rounded-2xl shadow-sm">
<div className="flex flex-col items-center">
<span className="font-headline-md text-headline-md text-primary font-extrabold">
{"50.000+"}
</span>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
{"Aktif Stoklu Ürün"}
</span>
</div>
<div className="flex flex-col items-center">
<span className="font-headline-md text-headline-md text-on-surface font-extrabold">
{"350+"}
</span>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
{"Doğrulanmış Yerli Üretici"}
</span>
</div>
<div className="flex flex-col items-center">
<span className="font-headline-md text-headline-md text-tertiary font-extrabold">
{"24 Saatte"}
</span>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
{"Hızlı Kargolama & Sevk"}
</span>
</div>
<div className="flex flex-col items-center">
<span className="font-headline-md text-headline-md text-secondary-container font-extrabold">
{"0 TL"}
</span>
<span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
{"Giriş Ücreti & Gizli Maliyet Yok"}
</span>
</div>
</div>
</div>
</section></>
);
}
