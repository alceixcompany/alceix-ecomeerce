
export function InfluencerFaq() {
return (
<section className="w-full py-16 lg:py-24 bg-surface-container-lowest">
<div className="max-w-4xl mx-auto px-6 lg:px-12">
<div className="text-center space-y-3 mb-12">
<span className="font-label-sm text-label-sm font-bold text-primary-container tracking-wider uppercase">
{"MERAK EDİLENLER"}
</span>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
{"Sıkça Sorulan Sorular"}
</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
{" Influencer Partner Programı hakkındaki temel soruların yanıtları "}
</p>
</div>
<div className="space-y-4">
<details className="group bg-surface-container-low rounded-xl p-5 open:bg-surface-container-low/70 transition-all">
<summary className="flex items-center justify-between cursor-pointer list-none">
<span className="font-title-md text-title-md font-bold text-on-surface">
{"Influencer olmak için belirli bir takipçi alt sınırı var mı?"}
</span>
<span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="pt-4 text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container mt-3">
{" Hayır, katı bir takipçi barajımız bulunmamaktadır. 1.000 takipçili niş bir nano-influencer da olsanız, kitle etkileşiminiz ve samimiyetiniz yüksekse programımıza kabul edilirsiniz. Alceix ekibi takipçi adedinden ziyade organik etkileşime değer verir. "}
</div>
</details>
<details className="group bg-surface-container-low rounded-xl p-5 open:bg-surface-container-low/70 transition-all">
<summary className="flex items-center justify-between cursor-pointer list-none">
<span className="font-title-md text-title-md font-bold text-on-surface">
{"Komisyon oranları nasıl belirleniyor ve ne kadar kazanabilirim?"}
</span>
<span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="pt-4 text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container mt-3">
{" Komisyon oranları ürün kategorisine ve tedarikçi anlaşmasına göre %10 ile %25 arasında değişmektedir. Kazancınızda herhangi bir üst limit yoktur; kitlenizin gerçekleştirdiği her geçerli siparişten anında net komisyon hesabınıza işlenir. "}
</div>
</details>
<details className="group bg-surface-container-low rounded-xl p-5 open:bg-surface-container-low/70 transition-all">
<summary className="flex items-center justify-between cursor-pointer list-none">
<span className="font-title-md text-title-md font-bold text-on-surface">
{"Hakediş ödemeleri ne zaman ve hangi kanaldan yapılıyor?"}
</span>
<span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="pt-4 text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container mt-3">
{" Onaylanan satış hakedişleri, BDDK lisanslı güvenli ödeme sağlayıcılarımız üzerinden her Pazartesi saat 10:00 itibarıyla panelinizde tanımladığınız Türk Lirası IBAN hesabınıza kesintisiz aktarılır. "}
</div>
</details>
<details className="group bg-surface-container-low rounded-xl p-5 open:bg-surface-container-low/70 transition-all">
<summary className="flex items-center justify-between cursor-pointer list-none">
<span className="font-title-md text-title-md font-bold text-on-surface">
{"Ücretsiz numune ürünleri nasıl talep edebilirim?"}
</span>
<span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="pt-4 text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container mt-3">
{" Profil onayınız gerçekleştikten sonra içerik üretici panelinizde \"Numune Talep Merkezi\" aktif hale gelir. Tanıtmayı planladığınız ürünleri seçerek doğrudan markadan ücretsiz numune talep edebilirsiniz. "}
</div>
</details>
<details className="group bg-surface-container-low rounded-xl p-5 open:bg-surface-container-low/70 transition-all">
<summary className="flex items-center justify-between cursor-pointer list-none">
<span className="font-title-md text-title-md font-bold text-on-surface">
{"Kendi adıma bir e-ticaret butiği de açabilir miyim?"}
</span>
<span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="pt-4 text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container mt-3">
{" Evet! Alceix altyapısıyla 0 TL maliyetle kendi adınıza (örn: alceix.com/username) özel vitrin oluşturabilir, sadece beğendiğiniz ürünleri listeleyerek takipçilerinize kendi mağazanızdan alışveriş deneyimi yaşatabilirsiniz. "}
</div>
</details>
</div>
</div>
</section>
);
}
