"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { currentAccount } from "@/modules/marketing-auth";
import { importSample } from "../services/catalog-api";
import { errorMessage, ApiError } from "@/lib/http";
import { routes } from "@/config/routes";

const categories = ["Tüm Kategoriler", "Giyim & Moda", "Kozmetik & Bakım", "Ev & Yaşam", "Teknoloji & Aksesuar"];
const products = [
  { id: "cardigan", category: "Giyim & Moda", badge: "Giyim & Triko", shipping: "24h Sevk", supplier: "Nordik Tekstil A.Ş.", name: "Oversize Kaşmir Triko Hırka", cost: 240, sale: 690 },
  { id: "serum", category: "Kozmetik & Bakım", badge: "Kozmetik & Bakım", shipping: "Organik Bakım", supplier: "Anatolia Kimya & Kozmetik", name: "Organik C Vitamini Serumu 30ml", cost: 85, sale: 340 },
  { id: "phone-stand", category: "Ev & Yaşam", badge: "Ev & Yaşam", shipping: "El Yapımı Masif", supplier: "Woodcraft Atölye", name: "Meşe Masa Üstü Telefon Standı", cost: 120, sale: 380 },
  { id: "cardholder", category: "Teknoloji & Aksesuar", badge: "Deri & Aksesuar", shipping: "Hakiki Deri", supplier: "Venezia Deri Sanayi", name: "Minimalist Hakiki Deri Kartlık", cost: 160, sale: 490 },
];
const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export function DropshippingCatalog() {
  const [category, setCategory] = useState(categories[0]);
  const [added, setAdded] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isAdding,setIsAdding]=useState(false);
  const filtered = products.filter((product) => category === categories[0] || product.category === category);

  async function addProduct(id:string,name:string){if(isAdding)return;setIsAdding(true);try{const account=await currentAccount();const store=account.stores[0];if(!store){setMessage("Önce bir mağaza oluşturun.");return;}await importSample(store.slug,id);setAdded(current=>[...current,id]);setMessage(`${name}, ${store.name} mağazanıza örnek taslak olarak eklendi. Gerçek tedarikçi bağlantısı ve stok henüz yok.`);}catch(error){setMessage(error instanceof ApiError && error.status===401?"Ürünü mağazanıza eklemek için giriş yapın.":errorMessage(error));}finally{setIsAdding(false);}}

  return <section className="w-full bg-white py-16 border-t border-surface-container" id="katalog">
    <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
        <div><span className="text-caption text-primary uppercase font-bold tracking-wider">DROPSHIP ÜRÜN HAVUZU</span><h2 className="text-headline-lg font-bold tracking-tight mt-1">Hemen Vitrininize Ekleyebileceğiniz Örnek Ürünler</h2><p className="text-body-md text-on-surface-variant mt-2">Giyimden ev yaşamına, mağazanız için farklı kategorilerdeki ürünleri keşfedin.</p></div>
        <span className="text-caption text-outline">Brüt kâr: satış fiyatı − toptan alış fiyatı</span>
      </div>
      <div role="group" aria-label="Ürün kategorileri" className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((item) => <button type="button" key={item} aria-pressed={item === category} aria-controls="dropshipping-products" onClick={() => setCategory(item)} className={`px-4 py-2 rounded-full text-label-sm font-semibold shrink-0 transition-colors ${category === item ? "bg-primary text-white shadow-sm" : "bg-surface-container-low hover:bg-surface-container text-on-surface"}`}>{item}</button>)}
      </div>
      <div id="dropshipping-products" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((product) => <article key={product.id} className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="relative w-full h-56 bg-surface-container overflow-hidden">
              <Image src={`/dropshipping/${product.id}.jpg`} alt={product.name} width={600} height={600} sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-label-sm px-2.5 py-1 rounded-full font-semibold shadow-sm">{product.badge}</span>
              <span className="absolute bottom-3 right-3 bg-tertiary text-white text-caption px-2 py-1 rounded-full font-bold">{product.shipping}</span>
            </div>
            <div className="p-4 space-y-3">
              <div><span className="text-caption text-outline uppercase">{product.supplier}</span><h3 className="text-title-md font-bold mt-1">{product.name}</h3></div>
              <div className="p-3 rounded-xl bg-white space-y-1 text-body-sm">
                <div className="flex justify-between gap-2"><span className="text-on-surface-variant">Toptan Alış:</span><strong>{currency.format(product.cost)}</strong></div>
                <div className="flex justify-between gap-2"><span className="text-on-surface-variant">Tavsiye Satış:</span><strong className="text-primary">{currency.format(product.sale)}</strong></div>
                <div className="pt-2 border-t border-surface-container flex justify-between gap-2 text-tertiary font-bold"><span>Brüt Kâr:</span><span>{currency.format(product.sale - product.cost)} (%{Math.floor((product.sale - product.cost) / product.cost * 100)})</span></div>
              </div>
            </div>
          </div>
          <div className="p-4 pt-0"><button type="button" disabled={isAdding || added.includes(product.id)} onClick={() => addProduct(product.id, product.name)} className="w-full py-3 px-3 rounded-xl bg-primary-container hover:bg-primary disabled:bg-tertiary text-white text-label-sm font-semibold flex items-center justify-center gap-2" aria-label={`${product.name}: ${added.includes(product.id) ? "Taslağa eklendi" : "Mağazama ekle"}`}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">{added.includes(product.id) ? "check_circle" : "add_shopping_cart"}</span>{added.includes(product.id) ? "Taslağa Eklendi" : "Mağazama Ekle"}</button></div>
        </article>)}
      </div>
      <p role="status" className="mt-4 text-body-sm text-primary">{message}</p>
      <div className="mt-10 text-center"><Link href={routes.register} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container hover:bg-surface-variant text-label-md font-semibold">50.000+ Ürünün Bulunduğu Tam Kataloğu Açın<span className="material-symbols-outlined text-[18px]" aria-hidden="true">lock_open</span></Link></div>
    </div>
  </section>;
}
