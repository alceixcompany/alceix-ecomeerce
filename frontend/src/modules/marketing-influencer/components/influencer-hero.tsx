import Image from "next/image";
import { InfluencerForm } from "./influencer-form";

export function InfluencerHero() {
return (
<section className="w-full py-12 lg:py-16 relative overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface">
<div className="max-w-7xl mx-auto px-6 lg:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
<div className="lg:col-span-7 flex flex-col space-y-8">
<div className="space-y-4">
<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px] text-primary-container" aria-hidden="true">
{"monetization_on"}
</span>
<span>
{"Sıfır Sermaye ile Güvenli Ortaklık"}
</span>
</div>
<h1 className="font-display text-display font-extrabold tracking-tight text-on-surface leading-tight">
{" Takipçilerinizi Kazanca Dönüştürün: "}
<span className="text-primary-container">
{"%10 - %25"}
</span>
{" Satış Ortaklığı. "}
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
{" Alceix altyapısındaki 50.000+ kaliteli ürünü ve yüzlerce onaylı markayı kitlenizle buluşturun. Kendi seçtiğiniz ürünlerle kişisel vitrininizi oluşturun veya özel UTM/kupon kodlarınızla her satıştan düzenli komisyon kazanın. "}
</p>
</div>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between mb-2">
<span className="material-symbols-outlined text-primary-container text-[22px]" aria-hidden="true">
{"group"}
</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-caption text-caption font-bold">
{"+%34 Büyüme"}
</span>
</div>
<p className="font-headline-sm text-headline-sm font-bold text-on-surface">
{"2.400+"}
</p>
<p className="font-caption text-caption text-on-surface-variant">
{"Aktif İçerik Üreticisi"}
</p>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between mb-2">
<span className="material-symbols-outlined text-primary text-[22px]" aria-hidden="true">
{"payments"}
</span>
<span className="px-2 py-0.5 rounded-full bg-secondary-container/15 text-secondary font-caption text-caption font-bold">
{"Gerçek Zamanlı"}
</span>
</div>
<p className="font-headline-sm text-headline-sm font-bold text-on-surface">
{"₺8.6M+"}
</p>
<p className="font-caption text-caption text-on-surface-variant">
{"Dağıtılan Komisyon Hakedişi"}
</p>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between mb-2">
<span className="material-symbols-outlined text-tertiary text-[22px]" aria-hidden="true">
{"verified"}
</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-bold">
{"0 Gecikme"}
</span>
</div>
<p className="font-headline-sm text-headline-sm font-bold text-on-surface">
{"Her Pazartesi"}
</p>
<p className="font-caption text-caption text-on-surface-variant">
{"Kesintisiz IBAN Çekimi"}
</p>
</div>
</div>
<div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-surface-container">
<Image alt="İçerik üreticisi çalışma masası ve analitik paneli" className="w-full h-80 lg:h-96 object-cover object-center" src="/influencer/creator-desk.jpg" width={1200} height={800} sizes="(min-width: 1024px) 650px, 100vw" priority />
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/75 via-transparent to-transparent">

</div>
<div className="absolute top-4 left-4 flex flex-wrap gap-2.5">
<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-sm font-label-sm text-label-sm text-on-surface font-semibold">
<span className="material-symbols-outlined text-primary-container text-[18px]" aria-hidden="true">
{"bolt"}
</span>
{" ⚡ Canlı Satış & Tıklama Takibi "}
</div>
<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-sm font-label-sm text-label-sm text-on-surface font-semibold">
<span className="material-symbols-outlined text-tertiary text-[18px]" aria-hidden="true">
{"featured_seasonal_and_gifts"}
</span>
{" 🎁 Ücretsiz Numune Desteği "}
</div>
</div>
<div className="absolute bottom-4 left-4 right-4 bg-surface-container-lowest/95 backdrop-blur-md p-4 rounded-xl flex items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
{" %25 "}
</div>
<div>
<p className="font-title-md text-title-md font-bold text-on-surface">
{"Maksimum Komisyon Tavanı"}
</p>
<p className="font-caption text-caption text-on-surface-variant">
{"Özel influencer seçkileri için markalarla doğrudan kurgulanmış gelir modeli"}
</p>
</div>
</div>
<div className="hidden sm:flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm font-bold">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"verified_user"}
</span>
{" Onaylı Alceix Ağı "}
</div>
</div>
</div>
</div>
<div className="lg:col-span-5">
<div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-xl sticky top-28">
<div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-container">
<div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[26px]" aria-hidden="true">
{"how_to_reg"}
</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
{"Hemen Influencer Ağına Katılın"}
</h3>
<p className="font-caption text-caption text-on-surface-variant">
{"Başvurunuz ekibimizce 24 saat içinde incelenir"}
</p>
</div>
</div>
<InfluencerForm className="space-y-4" id="influencer-form">
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1" htmlFor="influencer-field-0">
{"Ad Soyad"}
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]" aria-hidden="true">
{"badge"}
</span>
<input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" placeholder="Adınız ve Soyadınız" required type="text" id="influencer-field-0" name="influencer-field-0" autoComplete="name" />
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1" htmlFor="influencer-field-1">
{"Telefon Numarası"}
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]" aria-hidden="true">
{"phone"}
</span>
<input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" placeholder="05XX XXX XX XX" required type="tel" id="influencer-field-1" name="influencer-field-1" pattern="[+0-9 ()-]{10,20}" autoComplete="tel" />
</div>
</div>
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1" htmlFor="influencer-field-2">
{"E-Posta Adresi"}
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]" aria-hidden="true">
{"mail"}
</span>
<input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" placeholder="ornek@alceix.com" required type="email" id="influencer-field-2" name="influencer-field-2" autoComplete="email" />
</div>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1" htmlFor="influencer-field-3">
{"Ana Platform"}
</label>
<select className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" required id="influencer-field-3" name="influencer-field-3">
<option value="instagram">
{"Instagram"}
</option>
<option value="tiktok">
{"TikTok"}
</option>
<option value="youtube">
{"YouTube"}
</option>
<option value="blog">
{"Blog / Web Portalı"}
</option>
</select>
</div>
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1" htmlFor="influencer-field-4">
{"Profil / Kanal Kullanıcı Adı"}
</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]" aria-hidden="true">
{"alternate_email"}
</span>
<input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" placeholder="@username veya link" required type="text" id="influencer-field-4" name="influencer-field-4" />
</div>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1" htmlFor="influencer-field-5">
{"Kitle Büyüklüğü"}
</label>
<select className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" required id="influencer-field-5" name="influencer-field-5">
<option value="nano">
{"< 10K (Nano Creator)"}
</option>
<option value="micro">
{"10K - 50K (Mikro)"}
</option>
<option value="midtier">
{"50K - 250K (Mid-Tier)"}
</option>
<option value="macro">
{"250K+ (Makro / Mega)"}
</option>
</select>
</div>
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1" htmlFor="influencer-field-6">
{"Odak Alanı / Kategori"}
</label>
<select className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all" required id="influencer-field-6" name="influencer-field-6">
<option value="fashion">
{"Moda & Giyim"}
</option>
<option value="cosmetics">
{"Kozmetik & Bakım"}
</option>
<option value="home">
{"Ev & Dekorasyon"}
</option>
<option value="tech">
{"Teknoloji & Gadgets"}
</option>
<option value="lifestyle">
{"Yaşam Tarzı & Fitness"}
</option>
</select>
</div>
</div>
<div>
<label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
{"İlgilendiğiniz İş Modeli"}
</label>
<div className="space-y-2">
<label className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input defaultChecked className="w-4 h-4 text-primary-container focus:ring-primary-container" name="partnership_type" type="radio" value="4" />
<span className="font-body-sm text-body-sm text-on-surface">
{"Özel İndirim Kuponu & Hikaye Paylaşımı"}
</span>
</label>
<label className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input className="w-4 h-4 text-primary-container focus:ring-primary-container" name="partnership_type" type="radio" value="5" />
<span className="font-body-sm text-body-sm text-on-surface">
{"UTM Affiliate Link (Bio & Swipe-Up)"}
</span>
</label>
<label className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input className="w-4 h-4 text-primary-container focus:ring-primary-container" name="partnership_type" type="radio" value="6" />
<span className="font-body-sm text-body-sm text-on-surface">
{"Kendi Adıma Kişisel Seçki Butiği Açma"}
</span>
</label>
</div>
</div>
<div className="pt-2">
<button className="w-full bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md py-3 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2" type="submit">
<span>
{"Influencer Başvurusunu Gönder"}
</span>
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"arrow_forward"}
</span>
</button>
</div>
<p className="font-caption text-caption text-on-surface-variant text-center pt-1 leading-snug">
{" Bilgileriniz 6698 sayılı KVKK kapsamında güvence altındadır. Başvuru tamamen ücretsizdir. "}
</p>
</InfluencerForm>

</div>
</div>
</div>
</div>
</section>
);
}
