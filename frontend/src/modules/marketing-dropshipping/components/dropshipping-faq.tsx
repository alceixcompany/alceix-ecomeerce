
export function DropshippingFaq() {
return (
<section className="w-full bg-surface-container-lowest py-10">
<div className="max-w-[880px] mx-auto px-4 lg:px-6">
<div className="text-center mb-10">
<span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">
{"ŞEFFAF CEVAPLAR"}
</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
{"Aklınıza Takılan Sorular"}
</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">
{"Dropshipping ve tedarikçi ağımız hakkında en çok merak edilen detaylar."}
</p>
</div>
<div className="space-y-4" id="faqAccordion">
<details className="p-6 rounded-2xl bg-surface-container-low transition-all group" open>
<summary className="w-full flex items-center justify-between text-left gap-4 cursor-pointer list-none">
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Dropshipping yapmak için vergi levhası veya şirket zorunlu mu?"}
</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="mt-2 pt-1 text-body-md font-body-md text-on-surface-variant">
{" Hayır, Alceix altyapısında e-ticarete bireysel olarak hemen başlayabilirsiniz. Satışlarınız ve cironuz düzenli seviyelere ulaştığında, Alceix Mali Rehberlik desteğiyle dakikalar içinde şahıs şirketinizi kolayca kurabilir ve yasal muafiyetlerden yararlanabilirsiniz. "}
</div>
</details>
<details className="p-6 rounded-2xl bg-surface-container-low transition-all group" open>
<summary className="w-full flex items-center justify-between text-left gap-4 cursor-pointer list-none">
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Ürünleri kendi fiyatımla satabilir miyim, kâr sınırı var mı?"}
</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="mt-2 pt-1 text-body-md font-body-md text-on-surface-variant">
{" Kesinlikle serbestsiniz! Tedarikçinin belirlediği toptan maliyet taban fiyattır. Bunun üzerindeki tüm fiyatlama, indirim stratejileri ve kâr marjları tamamen sizin inisiyatifinizdedir. Herhangi bir kâr tavan sınırı uygulanmaz. "}
</div>
</details>
<details className="p-6 rounded-2xl bg-surface-container-low transition-all group" open>
<summary className="w-full flex items-center justify-between text-left gap-4 cursor-pointer list-none">
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Müşteri kargoyu açtığında Alceix veya tedarikçi logosu görür mü?"}
</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="mt-2 pt-1 text-body-md font-body-md text-on-surface-variant">
{" Hayır. Tüm gönderiler kör kargo (white-label fulfillment) standartlarına tabidir. Kargo poşeti, termal barkod etiketi ve sevk irsaliyesi üzerinde yalnızca sizin mağaza unvanınız ve iletişim bilgileriniz yer alır. Müşteriniz ürünü doğrudan sizin gönderdiğinizi bilir. "}
</div>
</details>
<details className="p-6 rounded-2xl bg-surface-container-low transition-all group" open>
<summary className="w-full flex items-center justify-between text-left gap-4 cursor-pointer list-none">
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Tedarikçide stok bittiğinde mağazamda ne olur?"}
</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="mt-2 pt-1 text-body-md font-body-md text-on-surface-variant">
{" Alceix API bağlantısı iki yönlü ve anlıktır. Tedarikçinin deposunda stok tükendiği veya kritik eşiğe indiği anda vitrininiz otomatik olarak 'Tükendi' durumuna geçer. Bu sayede müşteriye temin edilemeyecek ürün satma mağduriyeti yaşamazsınız. "}
</div>
</details>
<details className="p-6 rounded-2xl bg-surface-container-low transition-all group" open>
<summary className="w-full flex items-center justify-between text-left gap-4 cursor-pointer list-none">
<span className="font-title-md text-title-md text-on-surface font-bold">
{"Müşteri iadeleri ve hasarlı ürün süreçlerini kim yönetiyor?"}
</span>
<span className="material-symbols-outlined text-outline transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
{"expand_more"}
</span>
</summary>
<div className="mt-2 pt-1 text-body-md font-body-md text-on-surface-variant">
{" İade edilen ürünler doğrudan tedarikçinin kabul merkezine yönlendirilir. Ürün kontrol edildikten sonra hasarlı veya hatalı üretim durumlarında tedarikçi garantisi devreye girer ve bedel tarafınıza eksiksiz iade edilir. "}
</div>
</details>
</div>
</div>
</section>
);
}
