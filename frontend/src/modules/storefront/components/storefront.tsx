"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StoreAbout } from "./store-about";
import { ProductDetail } from "./product-detail";
import { routes } from "@/config/routes";
import type { Store, StoreProduct } from "../data/stores";
import "../storefront.css";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const normalize = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>;
}

export function Storefront({ store }: { store: Store }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tüm ürünler");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [sort, setSort] = useState("featured");
  const [followed, setFollowed] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [modal, setModal] = useState<"cart" | StoreProduct | null>(null);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const categories = ["Tüm ürünler", ...new Set(store.products.map(product => product.category))];
  const invalidRange = minimum !== "" && maximum !== "" && Number(minimum) > Number(maximum);
  const filtered = store.products.filter(product =>
    (category === "Tüm ürünler" || product.category === category) &&
    normalize(`${product.name} ${product.category}`).includes(normalize(query.trim())) &&
    (minimum === "" || product.price >= Number(minimum)) &&
    (maximum === "" || product.price <= Number(maximum))
  ).sort((a, b) => sort === "ascending" ? a.price - b.price : sort === "descending" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name, "tr") : 0);
  const cartProducts = store.products.filter(product => cart[product.id]);
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const total = cartProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  useEffect(() => {
    if (modal && !dialog.current?.open) dialog.current?.showModal();
    if (!modal && dialog.current?.open) dialog.current.close();
  }, [modal]);
  function add(product: StoreProduct, quantity = 1) {
    setCart(current => ({ ...current, [product.id]: (current[product.id] || 0) + quantity }));
    setMessage(`${quantity} adet ${product.name} demo sepetine eklendi.`);
  }
  function reset() { setQuery(""); setCategory("Tüm ürünler"); setMinimum(""); setMaximum(""); setSort("featured"); }
  function changeQuantity(id: string, delta: number) {
    setCart(current => {
      const next = { ...current, [id]: Math.max(0, (current[id] || 0) + delta) };
      if (!next[id]) delete next[id];
      return next;
    });
  }
  return <div className="storefront">
    <div className="sf-announcement"><Icon name="auto_awesome" /> Az eşya, çok ilham. {store.name} seçkisini keşfedin.<span>Alceix üzerinde bir mağaza</span></div>
    <header className="sf-header"><div className="sf-container sf-header-inner"><a href="#store-top" className="sf-brand"><span className="sf-brand-mark">{store.initials}</span><span>{store.name}<small>SEÇİLMİŞ PARÇALAR, GÜZEL ANLAR</small></span></a><nav className="sf-store-navigation" aria-label="Mağaza gezinmesi"><a href="#products">Ürünler</a><a href="#store-about">Hakkında</a><a href="#store-about">Sosyal Medya <Icon name="north_east" /></a></nav><button className="sf-cart-button" onClick={() => {setMessage("");setModal("cart");}} type="button" aria-label={`Sepeti aç, ${cartCount} ürün`}><Icon name="shopping_bag" /><span>Sepetim</span><b>{cartCount}</b></button></div></header>
    <main id="store-top">
      <section className="sf-container sf-hero" aria-label="Mağaza banner’ı"><div className="sf-hero-content"><span className="sf-eyebrow">{store.name.toLocaleUpperCase("tr-TR")} / GÜNLÜK YAŞAM</span><h1>Biraz sade.<br />Biraz özel.<br /><em>Tam size göre.</em></h1><p>{store.tagline} Sevdiğiniz parçaları bir arada keşfedin.</p><a href="#products" className="sf-button">Koleksiyonu keşfet <Icon name="arrow_forward" /></a><span className="sf-hero-note">İyi hissettiren detaylar, tek bir seçkide.</span></div><div className="sf-hero-image"><Image src="/dropshipping/cardigan.jpg" alt="Luma Studio seçkisinden bej triko hırka" fill priority sizes="(min-width: 768px) 50vw, 100vw" /><div className="sf-hero-sticker"><span>THE EVERYDAY EDIT</span><strong>Sadeliğin<br />iyi hali.</strong><Icon name="north_east" /></div><span className="sf-image-caption">01 / GARDIROBUN YENİ FAVORİSİ</span></div></section>
      <section className="sf-container sf-profile" aria-label="Mağaza bilgileri"><div className="sf-profile-title"><span className="sf-profile-avatar">{store.initials}<span aria-hidden="true">✦</span></span><div><div className="sf-profile-name"><h2>{store.name}</h2><span className="sf-demo-badge">Demo mağaza</span></div><p>{store.description}</p><div className="sf-profile-tags"><span><Icon name="grid_view" />{store.products.length} seçilmiş ürün</span><span><Icon name="location_on" />Türkiye</span></div></div></div><button className={`sf-follow ${followed ? "sf-followed" : ""}`} aria-pressed={followed} type="button" onClick={() => {setFollowed(!followed);setMessage(followed ? "Demo takip seçimi kaldırıldı." : "Mağaza demo olarak takip edildi. Bu seçim sayfa açıkken korunur.");}}><Icon name={followed ? "check" : "add"} />{followed ? "Takip ediliyor" : "Mağazayı takip et"}</button></section>
      <section className="sf-container sf-catalog" id="products"><div className="sf-catalog-heading"><div><span className="sf-eyebrow">SEÇKİYİ KEŞFEDİN</span><h2>Seveceğiniz bir şey var.</h2></div><p>Size iyi gelen parçayı bulun.</p></div>
        <div className="sf-toolbar"><label className="sf-search"><Icon name="search" /><span className="sr-only">Mağazada ürün ara</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Bu mağazada bir şeyler ara…" />{query && <button type="button" aria-label="Aramayı temizle" onClick={() => setQuery("")}><Icon name="close" /></button>}</label><label className="sf-sort"><span>Sırala</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Öne çıkanlar</option><option value="ascending">Fiyat: düşükten yükseğe</option><option value="descending">Fiyat: yüksekten düşüğe</option><option value="name">Ürün adı: A–Z</option></select></label></div>
        <div className="sf-catalog-layout"><aside className="sf-filters" aria-label="Ürün filtreleri"><div className="sf-filter-heading"><h3><Icon name="tune" />Filtrele</h3><button type="button" onClick={reset}>Temizle</button></div><fieldset><legend>Kategoriler</legend><div className="sf-categories">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span>{item === "Tüm ürünler" ? store.products.length : store.products.filter(product => product.category === item).length}</span></button>)}</div></fieldset><fieldset><legend>Fiyat aralığı</legend><div className="sf-price-inputs"><label><span>En az ₺</span><input type="number" min="0" value={minimum} placeholder="0" onChange={event => setMinimum(event.target.value)} /></label><span aria-hidden="true">–</span><label><span>En çok ₺</span><input type="number" min="0" value={maximum} placeholder="Üst sınır" onChange={event => setMaximum(event.target.value)} /></label></div>{invalidRange && <p className="sf-range-error" role="alert">En az fiyat, en çok fiyattan büyük olamaz.</p>}</fieldset><div className="sf-filter-note"><Icon name="favorite" /><strong>Az ama özenli.</strong><p>Her parça, günlük hayatınıza küçük bir güzellik katmak için burada.</p></div></aside>
        <div className="sf-results"><div className="sf-result-count" aria-live="polite"><span><strong>{filtered.length}</strong> ürün bulundu</span><span>{category}</span></div>{filtered.length ? <div className="sf-product-grid">{filtered.map(product => <article className="sf-product" key={product.id}><button className="sf-product-image" type="button" onClick={() => {setMessage("");setModal(product);}} aria-label={`${product.name} detaylarını incele`}><Image src={product.image} alt={product.name} fill sizes="(min-width: 1200px) 240px, (min-width: 960px) 30vw, 50vw" />{product.badge && <span className="sf-product-badge">{product.badge}</span>}<span className="sf-image-count"><Icon name="photo_library" />{product.images.length} fotoğraf</span><span className="sf-quick-view">Ürünü incele <Icon name="north_east" /></span></button><div className="sf-product-info"><span className="sf-product-category">{product.category}</span><h3><button type="button" onClick={() => {setMessage("");setModal(product);}}>{product.name}</button></h3><div className="sf-product-bottom"><strong>{money.format(product.price)}</strong><span>Örnek ürün fiyatı</span></div><div className="sf-card-actions"><button type="button" className="sf-card-details" onClick={() => {setMessage("");setModal(product);}}>İncele <Icon name="north_east" /></button><button type="button" className="sf-card-cart" aria-label={`${product.name} sepete ekle`} onClick={() => add(product)}>Sepete Ekle <Icon name="shopping_bag" /></button></div></div></article>)}</div> : <div className="sf-empty"><Icon name="search_off" /><h3>Bu seçime uygun ürün bulamadık.</h3><p>Başka bir kelime deneyin veya filtreleri temizleyin.</p><button type="button" className="sf-button" onClick={reset}>Tüm ürünleri göster</button></div>}<div className="sf-catalog-end"><span>✦</span> Seçkinin sonuna geldiniz. Güzel şeyler bazen azdır.</div></div></div>
      </section>
      <StoreAbout store={store} onMissingSocial={platform => setMessage(`${platform} hesabı henüz eklenmedi. Gerçek mağazanın sosyal medya bağlantısı burada gösterilecek.`)} />
      <section className="sf-container sf-bottom-note"><Icon name="storefront" /><div><h2>Küçük bir mağaza. Kendine özgü bir dünya.</h2><p>Yeni seçkiler için {store.name} mağazasını takip etmeyi unutmayın.</p></div><button className="sf-follow" type="button" aria-pressed={followed} onClick={() => {setFollowed(!followed);setMessage(followed ? "Demo takip seçimi kaldırıldı." : "Mağaza demo olarak takip edildi. Bu seçim sayfa açıkken korunur.");}}><Icon name={followed ? "check" : "add"} />{followed ? "Takip ediliyor" : "Takip et"}</button></section>
    </main>
    <footer className="sf-footer sf-container"><span>© {new Date().getFullYear()} {store.name}</span><Link href={routes.home}>Alceix <span>ile oluşturuldu</span><Icon name="north_east" /></Link><span>Demo vitrin · Ödeme alınmaz</span></footer>
    <p className="sf-status" role="status">{message}</p>
    <dialog ref={dialog} className={`sf-dialog${modal && modal !== "cart" ? " sf-detail-dialog" : ""}`} onCancel={() => setModal(null)} onClose={() => setModal(null)} aria-labelledby="sf-modal-title"><div className="sf-dialog-heading"><h2 id="sf-modal-title">{modal === "cart" ? "Sepetim" : modal?.name}</h2><button type="button" aria-label="Pencereyi kapat" onClick={() => setModal(null)}><Icon name="close" /></button></div>{modal === "cart" ? <div className="sf-cart-content">{cartProducts.length ? <><div className="sf-cart-lines">{cartProducts.map(product => <div className="sf-cart-line" key={product.id}><Image src={product.image} alt={product.name} width={72} height={84} /><div><strong>{product.name}</strong><span>{money.format(product.price)}</span><div className="sf-quantity"><button type="button" aria-label={`${product.name} adedini azalt`} onClick={() => changeQuantity(product.id, -1)}>−</button><span>{cart[product.id]}</span><button type="button" aria-label={`${product.name} adedini artır`} onClick={() => changeQuantity(product.id, 1)}>+</button></div></div><button type="button" aria-label={`${product.name} sepetten çıkar`} onClick={() => setCart(current => {const next = {...current};delete next[product.id];return next;})}><Icon name="delete" /></button></div>)}</div><div className="sf-cart-total"><span>Ürünler toplamı</span><strong>{money.format(total)}</strong></div><p className="sf-demo-note">Bu bir demo sepetidir. Sipariş ve ödeme bağlantısı henüz aktif değildir. Kargo tutarı hesaplanmamıştır.</p></> : <div className="sf-empty"><Icon name="shopping_bag" /><h3>Sepetiniz henüz boş.</h3><p>Seçkide gözünüze takılan bir şey var mı?</p></div>}<button type="button" className="sf-button" onClick={() => setModal(null)}>Alışverişe devam et <Icon name="arrow_forward" /></button></div> : modal && <ProductDetail key={modal.id} product={modal} storeName={store.name} onAdd={quantity => add(modal, quantity)} />}<p role="status" className="sf-dialog-status">{modal && message}</p></dialog>
  </div>;
}
