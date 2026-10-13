"use client";
import { useEffect, useRef, useState } from "react";
import { useOrderWorkspace } from "../hooks/order-workspace";
import { carriers } from "../mocks/orders";
import { orderSubtotal, orderTotal, paymentLabels } from "../utils/order";
import { productMoney as money } from "../utils/product";
import { createOrder } from "../services/orders-api";
import { listProducts, type ProductList } from "../services/admin-api";
import { errorMessage } from "@/lib/http";
export function OrderIcon({name}: {name: string}) {return <span className="material-symbols-outlined" aria-hidden="true">{name}</span>;}
export type OrderAction = "label" | "tracking" | "invoice" | "address" | "request" | "cancel" | "advance" | "packing" | "manual" | "shipping" | "rules" | "printer" | "customer";
const titles: Record<OrderAction, string> = {label: "Kargo Barkodu & Etiket", tracking: "Gönderi Takibi", invoice: "Ödeme & Fatura Önizlemesi", address: "Teslimat Adresini Düzenle", request: "İade & Değişim Talebi", cancel: "Siparişi İptal Et", advance: "Sipariş Durumunu Güncelle", packing: "Toplu Paketleme Listesi", manual: "Manuel Sipariş Oluştur", shipping: "Kargo Entegrasyon Ayarları", rules: "Akıllı Kargo Kuralları", printer: "Barkod Yazıcı Formatı", customer: "Müşteri Bilgileri"};
export function useOrderActions(onNotice: (message: string) => void) {
  const {slug, orders, updateOrder, ready, pending: updating, refresh} = useOrderWorkspace();
  const dialog = useRef<HTMLDialogElement>(null), attempt = useRef<{payload: string; id: string} | null>(null), load = useRef<AbortController | null>(null), writing = useRef(false);
  const [mode, setMode] = useState<OrderAction>("manual"), [ids, setIds] = useState<string[]>([]), [error, setError] = useState("");
  const [dirty, setDirty] = useState(false), [discard, setDiscard] = useState(false), [pending, setPending] = useState(false), [products, setProducts] = useState<ProductList["items"]>([]), [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState(""), [phone, setPhone] = useState("");
  const [name, setName] = useState(""), [address, setAddress] = useState(""), [city, setCity] = useState(""), [carrier, setCarrier] = useState(carriers[0]), [productId, setProductId] = useState(""), [variant, setVariant] = useState(""), [quantity, setQuantity] = useState("1");
  const selected = orders.filter(order => ids.includes(order.id)), order = selected[0], product = products.find(product => product.id === productId);
  const busy = pending || updating;
  useEffect(() => () => load.current?.abort(), []);
  function open(next: OrderAction, nextIds: string[] = []) {
    load.current?.abort(); setMode(next); setIds(nextIds); setError(""); setDirty(false); setDiscard(false);
    const order = orders.find(order => order.id === nextIds[0]); setAddress(order?.address || ""); setCity(order?.city || "");
    dialog.current?.showModal();
    if (next === "manual") {
      setName(""); setEmail(""); setPhone(""); setQuantity("1"); setLoaded(false);
      const controller = new AbortController(); load.current = controller;
      listProducts(slug, new URLSearchParams({status: "live", limit: "100"}), controller.signal).then(result => {
        if (controller.signal.aborted) return;
        setProducts(result.items); setProductId(result.items[0]?.id || ""); setVariant(result.items[0]?.variants[0] || ""); setLoaded(true);
      }).catch(error => {if (!controller.signal.aborted) setError(errorMessage(error));});
    }
  }
  function close() {if (busy) return; if (dirty) {setDiscard(true); return;} load.current?.abort(); dialog.current?.close();}
  function done(message: string) {setDirty(false); setDiscard(false); dialog.current?.close(); onNotice(message);}
  async function write(work: () => Promise<unknown>, message: string) {
    if (writing.current || busy || !ready) return;
    writing.current = true; setPending(true); setError("");
    try {await work(); done(message);} catch (error) {setError(errorMessage(error));} finally {writing.current = false; setPending(false);}
  }
  const unsupported = !["manual", "address", "cancel", "invoice", "customer", "packing", "tracking"].includes(mode);
  const overlay = <dialog ref={dialog} className="ad-dialog ao-dialog" data-order-print={mode} aria-labelledby="order-action-title" onCancel={event => {if (busy || dirty) {event.preventDefault(); if (!busy) setDiscard(true);} else load.current?.abort();}}>
    <div className="ad-dialog-heading"><span className="ad-icon-box blue"><OrderIcon name="local_shipping"/></span><button autoFocus disabled={busy} aria-label="Sipariş penceresini kapat" onClick={close}><OrderIcon name="close"/></button></div>
    <h2 id="order-action-title">{titles[mode]}</h2><p className="ad-demo-note">Siparişler ve stok rezervasyonları sunucuda saklanır. Ödeme, kargo ve mali belge sağlayıcıları henüz bağlı değildir.</p>
    {error && <p role="alert" className="ao-error">{error}</p>}
    {discard && <div className="ao-discard" role="alert"><p>Kaydedilmemiş değişiklikler bırakılacak.</p><button onClick={() => setDiscard(false)}>Düzenlemeye Dön</button><button onClick={() => {setDirty(false); load.current?.abort(); dialog.current?.close();}}>Değişiklikleri Bırak</button></div>}
    {unsupported ? <p className="ao-info">Bu işlem için ödeme/kargo veya iade entegrasyonu henüz hazır değil. Gerçek işlem yapılmadı.</p> : mode === "manual" ? <form inert={busy} onChange={() => setDirty(true)} onSubmit={event => {
      event.preventDefault();
      if (!product || !name.trim() || !address.trim() || !city.trim() || !/^\d{1,2}$/.test(quantity) || Number(quantity) < 1) {setError("Müşteri, adres, ürün ve 1–99 adet bilgilerini doldurun."); return;}
      const input = {customer: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), carrier, lines: [{productId, quantity: Number(quantity), variant}]}, payload = JSON.stringify(input);
      if (attempt.current?.payload !== payload) attempt.current = {payload, id: crypto.randomUUID()};
      const id = attempt.current.id;
      void write(async () => {await createOrder(slug, id, input); attempt.current = null; refresh();}, "Sipariş kaydedildi. Stok 30 dakika ayrıldı; ödeme alınmadı.");
    }}>
      <label>Müşteri Adı<input required maxLength={100} value={name} onChange={event => setName(event.target.value)}/></label>
      <div className="ao-form-pair"><label>E-posta<input type="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)}/></label><label>Telefon<input maxLength={30} value={phone} onChange={event => setPhone(event.target.value)}/></label></div>
      <label>Ürün<select aria-label="Sipariş ürünü" disabled={!loaded} required value={productId} onChange={event => {setProductId(event.target.value); setVariant(products.find(product => product.id === event.target.value)?.variants[0] || "");}}>{products.map(product => <option key={product.id} value={product.id}>{product.name} · {money(product.priceCents)}</option>)}</select></label>
      {!!product?.variants.length && <label>Varyant<select value={variant} onChange={event => setVariant(event.target.value)}>{product.variants.map(variant => <option key={variant}>{variant}</option>)}</select></label>}
      <div className="ao-form-pair"><label>Adet<input required type="number" min={1} max={99} value={quantity} onChange={event => setQuantity(event.target.value)}/></label><label>Kargo Tercihi<select value={carrier} onChange={event => setCarrier(event.target.value)}>{carriers.map(carrier => <option key={carrier}>{carrier}</option>)}</select></label></div>
      <label>İl / İlçe<input required maxLength={120} value={city} onChange={event => setCity(event.target.value)}/></label><label>Teslimat Adresi<textarea required maxLength={400} value={address} onChange={event => setAddress(event.target.value)}/></label>
      <label className="ao-check"><input type="checkbox" disabled checked={false} readOnly/>Ödeme bekliyor · sağlayıcı bağlı değil</label>
      <small>İlk 100 yayınlanmış ürün gösterilir. Fiyat sunucudan alınır; kargo ücreti henüz hesaplanmaz. Ödenmeyen rezervasyon 30 dakika sonra geri bırakılır.</small><button className="ad-button" disabled={!loaded || !product || !ready || busy}>Sipariş Oluştur</button>
    </form> : mode === "packing" ? <div className="ao-print-document"><span className="ao-document-stamp">PAKETLEME LİSTESİ</span>{selected.map(order => <section key={order.id}><h3>#{order.id} · {order.customer}</h3>{order.items.map(line => <p key={`${line.sku}:${line.variant}`}>{line.quantity} × {line.name} · {line.variant} · {line.sku}</p>)}</section>)}<button className="ad-button" disabled={!selected.length} onClick={() => window.print()}>Yazdır / PDF Kaydet</button></div> : !order ? <p>Önce bir sipariş seçin.</p> : mode === "address" ? <form inert={busy} onChange={() => setDirty(true)} onSubmit={event => {event.preventDefault(); void write(() => updateOrder(order.id, current => ({...current, address: address.trim(), city: city.trim()})), "Teslimat adresi kaydedildi.");}}><label>İl / İlçe<input required maxLength={120} value={city} onChange={event => setCity(event.target.value)}/></label><label>Teslimat Adresi<textarea required maxLength={400} value={address} onChange={event => setAddress(event.target.value)}/></label><button className="ad-button" disabled={busy || !ready}>Adresi Kaydet</button></form> : mode === "cancel" ? <div><p>#{order.id} siparişi iptal edilip stok rezervasyonu geri bırakılacak. Ödeme alınmadığı için para iadesi yapılmaz.</p><div className="ao-dialog-actions"><button className="ao-secondary" disabled={busy} onClick={close}>Vazgeç</button><button className="ao-danger" disabled={busy || !ready || order.shipment !== "preparing"} onClick={() => void write(() => updateOrder(order.id, current => ({...current, shipment: "cancelled"})), "Sipariş iptal edildi; stok geri bırakıldı.")}>İptali Onayla</button></div></div> : mode === "invoice" ? <div className="ao-print-document"><span className="ao-document-stamp">SİPARİŞ ÖZETİ · MALİ BELGE DEĞİLDİR</span><h3>Alceix · #{order.id}</h3><p>{order.customer} · {order.address}</p><dl><div><dt>Ara toplam</dt><dd>{money(orderSubtotal(order))}</dd></div><div><dt>Kargo</dt><dd>Henüz hesaplanmadı</dd></div><div><dt>Ürün toplamı</dt><dd>{money(orderTotal(order))}</dd></div><div><dt>Ödeme</dt><dd>{paymentLabels[order.payment]}</dd></div></dl><button className="ad-button" onClick={() => window.print()}>Yazdır / PDF Kaydet</button></div> : mode === "customer" ? <div><h3>{order.customer}</h3><dl><div><dt>E-posta</dt><dd>{order.email || "Belirtilmedi"}</dd></div><div><dt>Telefon</dt><dd>{order.phone || "Belirtilmedi"}</dd></div><div><dt>Konum</dt><dd>{order.city}</dd></div></dl></div> : <div><p className="ao-info">{order.carrier || "Taşıyıcı seçilmedi"} · {order.tracking || "Gönderi oluşturulmadı"}</p><small>Canlı taşıyıcı bağlantısı yok.</small></div>}
  </dialog>;
  return {open, overlay};
}
