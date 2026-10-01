"use client";
import { ProgressiveImage as Image } from "@/components/catalog/progressive-image";
import { Pagination } from "@/components/catalog/pagination";
import { ProductsSkeleton } from "../components/products-skeleton";
import { useDebouncedValue } from "@/components/hooks/use-debounced-value";
import { adminCatalogQuery } from "../utils/catalog-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { storeRoutes } from "@/config/store-routes";
import { AdminShell } from "../components/admin-shell";
import { ProductEditor } from "../components/product-editor";
import type { AdminStore } from "../types/store";
import {
  listProducts,
  saveProduct,
  duplicateProduct,
  adjustStock,
  type ProductList,
} from "../services/admin-api";
import { errorMessage } from "@/lib/http";
import type { AdminProduct } from "../types/product";
import { productCsv, productMoney } from "../utils/product";
import "../store-settings.css";
import "../products.css";
function Icon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {name}
    </span>
  );
}
export function ProductsScreen({ store }: { store: AdminStore }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [notice, setNotice] = useState("");
  const [list, setList] = useState<ProductList>();
  const [revision, setRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [editing, setEditing] = useState<AdminProduct>();
  const [editorVersion, setEditorVersion] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const params = useSearchParams();
  const search = params.toString();
  const debouncedSearch = useDebouncedValue(search);
  const [loadError, setLoadError] = useState("");
  const pending = isLoading || search !== debouncedSearch;
  const invalidRange = adminCatalogQuery(search).invalidRange;
  const categories = list?.categories || [];
  const query = params.get("q") || "";
  const rawStatus = params.get("status") || "all";
  const status = ["all", "live", "critical", "draft"].includes(rawStatus)
    ? rawStatus
    : "all";
  const category = params.get("category") || "all";
  const sort = ["newest", "price-asc", "price-desc", "stock"].includes(
    params.get("sort") || "",
  )
    ? params.get("sort")!
    : "newest";
  const requestedPage = Math.max(1, Number(params.get("page")) || 1);
  useEffect(() => {
    const controller = new AbortController(),
      { query, invalidRange } = adminCatalogQuery(debouncedSearch);
    setLoadError("");
    if (invalidRange) {
      setProducts([]);
      setList(undefined);
      setIsLoading(false);
      return () => controller.abort();
    }
    setIsLoading(true);
    listProducts(store.slug, query, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setList(result);
        setProducts(result.items);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoadError(errorMessage(error));
          setProducts([]);
          setList(undefined);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [store.slug, debouncedSearch, revision]);
  function changeFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all" || value === "newest") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    window.history.replaceState(
      null,
      "",
      `${storeRoutes.products(store.slug)}${next.size ? `?${next}` : ""}`,
    );
  }
  const pageCount = list?.pageCount || 1;
  const page = list?.page || Math.floor(requestedPage);
  const visible = products;
  const total = list?.total || 0;
  const counts = list?.counts || { all: 0, live: 0, critical: 0, draft: 0 };
  const tabs = [
    { id: "all", label: "Tüm Ürünler", count: counts.all },
    { id: "live", label: "Satışta (Canlı)", count: counts.live },
    { id: "critical", label: "Kritik Stok", count: counts.critical },
    { id: "draft", label: "Taslaklar", count: counts.draft },
  ];
  function openEditor(product?: AdminProduct) {
    setEditing(product);
    setEditorVersion((version) => version + 1);
  }
  async function save(product: AdminProduct) {
    try {
      await saveProduct(store.slug, product, !!editing);
      setRevision((value) => value + 1);
      setNotice("Ürün kaydedildi. Yayınlanan ürünler vitrinde görünür.");
      return undefined;
    } catch (error) {
      return errorMessage(error);
    }
  }
  async function mutate(work: () => Promise<unknown>, success: string) {
    if (isMutating) return;
    setIsMutating(true);
    try {
      await work();
      setRevision((value) => value + 1);
      setNotice(success);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }
  function toggle(product: AdminProduct) {
    if (
      product.status === "draft" &&
      (!product.priceCents || !product.images.length)
    ) {
      openEditor(product);
      return;
    }
    void mutate(
      () =>
        saveProduct(
          store.slug,
          { ...product, status: product.status === "live" ? "draft" : "live" },
          true,
        ),
      "Satış durumu güncellendi.",
    );
  }
  function addStock(product: AdminProduct) {
    void mutate(
      () => adjustStock(store.slug, product.id, 10),
      "Ürün stoğuna 10 adet eklendi.",
    );
  }
  function duplicate(product: AdminProduct) {
    void mutate(
      () => duplicateProduct(store.slug, product.id),
      "Ürün kopyası taslak olarak oluşturuldu.",
    );
  }
  async function exportCsv() {
    if (isMutating) return;
    setIsMutating(true);
    try {
      const exported: AdminProduct[] = [];
      const { query, invalidRange } = adminCatalogQuery(search, 100);
      if (invalidRange) throw new Error("Fiyat aralığını kontrol edin.");
      let page = 1;
      while (true) {
        query.set("page", String(page));
        const result = await listProducts(store.slug, query);
        exported.push(...result.items);
        if (page >= result.pageCount) break;
        page++;
      }
      const blob = new Blob([productCsv(exported)], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `alceix-${store.slug}-urunler.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`${exported.length} ürün indirildi.`);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <AdminShell
      store={store}
      active="products"
      onNotice={setNotice}
      overlay={
        editorVersion > 0 ? (
          <ProductEditor
            key={editorVersion}
            dialogRef={dialog}
            initial={editing}
            categories={categories}
            storeSlug={store.slug}
            onSave={save}
          />
        ) : undefined
      }
    >
      <header className="ap-page-heading">
        <div>
          <h1>
            Ürünler <span>{counts.all} ürün</span>
          </h1>
          <p>
            Mağazanızdaki ürünleri, fiyatları ve stokları tek yerden yönetin.
          </p>
        </div>
        <div>
          <button
            className="ap-secondary"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-expanded={isFilterOpen}
          >
            <Icon name="tune" />
            Filtrele & Dışa Aktar
          </button>
          <button className="ad-button" onClick={() => openEditor()}>
            <Icon name="add" />
            Yeni Ürün Ekle
          </button>
        </div>
      </header>
      <div
        className="ap-status-tabs"
        role="group"
        aria-label="Ürün satış durumu filtresi"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={tab.id}
            aria-pressed={status === tab.id}
            onClick={() => changeFilter("status", tab.id)}
          >
            <i />
            {tab.label}
            <span>{tab.count}</span>
          </button>
        ))}
        <small>
          <Icon name="check_circle" />
          Mağaza kataloğu
        </small>
      </div>
      {isFilterOpen && (
        <section className="ap-filter-panel">
          <div>
            <h2>Filtrelenmiş ürünleri dışa aktar</h2>
            <p>CSV dosyası arama ve kategori sonuçlarını içerir.</p>
          </div>
          <button
            className="ap-secondary"
            onClick={() =>
              window.history.replaceState(
                null,
                "",
                storeRoutes.products(store.slug),
              )
            }
          >
            Filtreleri Temizle
          </button>
          <button
            className="ad-button"
            disabled={isMutating || pending || invalidRange}
            onClick={exportCsv}
          >
            <Icon name="download" />
            CSV İndir ({total})
          </button>
          <div className="ap-extra-filters">
            <label>
              En az fiyat (TL)
              <input
                type="number"
                min="0"
                step="0.01"
                value={params.get("min") || ""}
                onChange={(event) => changeFilter("min", event.target.value)}
              />
            </label>
            <label>
              En çok fiyat (TL)
              <input
                type="number"
                min="0"
                step="0.01"
                value={params.get("max") || ""}
                onChange={(event) => changeFilter("max", event.target.value)}
              />
            </label>
            <label>
              Stok durumu
              <select
                value={params.get("availability") || "all"}
                onChange={(event) =>
                  changeFilter("availability", event.target.value)
                }
              >
                <option value="all">Tümü</option>
                <option value="in-stock">Stokta olanlar</option>
                <option value="out-of-stock">Stok tükenenler</option>
              </select>
            </label>
            <label>
              Satış modeli
              <select
                value={params.get("model") || "all"}
                onChange={(event) => changeFilter("model", event.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="own">Kendi ürünüm</option>
                <option value="supplier">Tedarikçi ürünü</option>
              </select>
            </label>
          </div>
        </section>
      )}
      <div className="ap-toolbar">
        <div className="ap-search">
          <Icon name="search" />
          <input
            aria-label="Ürün ara"
            placeholder="Ürün adı, barkod, SKU veya kategori ara…"
            value={query}
            maxLength={120}
            onChange={(event) => changeFilter("q", event.target.value)}
          />
          {query && (
            <button
              aria-label="Aramayı temizle"
              onClick={() => changeFilter("q", "")}
            >
              <Icon name="close" />
            </button>
          )}
        </div>
        <div
          className="ap-category-tabs"
          role="group"
          aria-label="Ürün kategorileri"
        >
          {["all", ...categories].map((value) => (
            <button
              key={value}
              aria-pressed={category === value}
              onClick={() => changeFilter("category", value)}
            >
              {value === "all" ? "Tümü" : value}
            </button>
          ))}
        </div>
        <label className="ap-sort">
          <Icon name="sort" />
          <select
            aria-label="Ürün sıralaması"
            value={sort}
            onChange={(event) => changeFilter("sort", event.target.value)}
          >
            <option value="newest">En son eklenenler</option>
            <option value="price-asc">Fiyat: Düşükten yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten düşüğe</option>
            <option value="stock">Stok: Azdan çoğa</option>
          </select>
        </label>
      </div>
      <p className="ap-mobile-hint">
        Fiyat, stok ve işlem sütunları için tabloyu yana kaydırın.
      </p>
      {pending && (
        <p role="status" className="ap-visually-hidden">
          Ürünler yükleniyor…
        </p>
      )}
      {invalidRange && (
        <p role="alert" className="ap-editor-error">
          En az fiyat, en çok fiyattan büyük olamaz.
        </p>
      )}
      <div className="ap-table-scroll">
        <table className="ap-table" aria-busy={pending}>
          <caption className="ap-visually-hidden">
            Mağazanın ürün kataloğu
          </caption>
          <thead>
            <tr>
              <th scope="col">Ürün Detayı</th>
              <th scope="col">Fiyat (Birim)</th>
              <th scope="col">Stok Durumu</th>
              <th scope="col">Satış Durumu</th>
              <th scope="col">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {pending ? (
              <ProductsSkeleton />
            ) : (
              visible.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="ap-product-detail">
                      <button
                        className="ap-row-image"
                        aria-label={`${product.name} ürününü düzenle`}
                        onClick={() => openEditor(product)}
                      >
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={68}
                            height={68}
                            unoptimized={product.images[0].startsWith("data:")}
                          />
                        ) : (
                          <Icon name="image" />
                        )}
                        {product.stock <= 2 && <i />}
                      </button>
                      <div>
                        <button
                          className="ap-product-name"
                          onClick={() => openEditor(product)}
                        >
                          {product.name}
                        </button>
                        <p>
                          <span>{product.category}</span>
                          <b>·</b>
                          {product.variants.length
                            ? `${product.variants.length} seçenek (${product.variants.join(", ")})`
                            : "Standart"}
                          <b>·</b>
                          <small>SKU: {product.sku}</small>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong className="ap-product-price">
                      {productMoney(product.priceCents)}
                    </strong>
                    <small
                      className={
                        product.priceCents >= product.costCents
                          ? "ap-profit"
                          : "ap-loss"
                      }
                    >
                      {product.priceCents
                        ? `%${Math.round(((product.priceCents - product.costCents) / product.priceCents) * 100)} brüt marj`
                        : "Fiyat bekleniyor"}
                    </small>
                  </td>
                  <td>
                    <div className="ap-stock">
                      <span
                        className={
                          product.stock <= 2
                            ? "critical"
                            : product.stock <= 5
                              ? "low"
                              : product.stock >= 50
                                ? "good"
                                : "normal"
                        }
                      >
                        <i />
                        {product.stock === 0
                          ? "Stok tükendi"
                          : `${product.stock} adet`}
                      </span>
                      {product.stock <= 2 ? (
                        <button
                          disabled={isMutating}
                          onClick={() => addStock(product)}
                        >
                          +10 Stok Ekle
                        </button>
                      ) : (
                        <small>
                          {product.stock <= 5
                            ? "Tükeniyor"
                            : product.stock >= 50
                              ? "Bol stok"
                              : "Yeterli"}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="ap-sales">
                      <button
                        className="ap-switch"
                        role="switch"
                        aria-label={`${product.name} satış durumu`}
                        aria-checked={product.status === "live"}
                        disabled={isMutating}
                        onClick={() => toggle(product)}
                      >
                        <span />
                      </button>
                      <span>
                        {product.status === "live" ? "Satışta" : "Taslak"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="ap-row-actions">
                      <button
                        aria-label={`${product.name} düzenle`}
                        onClick={() => openEditor(product)}
                      >
                        <Icon name="edit" />
                      </button>
                      <details>
                        <summary aria-label={`${product.name} diğer işlemler`}>
                          <Icon name="more_vert" />
                        </summary>
                        <div>
                          <button onClick={() => openEditor(product)}>
                            <Icon name="visibility" />
                            Detayları Gör
                          </button>
                          <button onClick={() => duplicate(product)}>
                            <Icon name="content_copy" />
                            Taslak Kopyası Oluştur
                          </button>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!pending && !visible.length && (
        <div className="ap-empty">
          <Icon name="search_off" />
          <h2>{loadError ? "Ürünler yüklenemedi" : "Ürün bulunamadı"}</h2>
          <p>{loadError || "Arama terimini veya filtreleri değiştirin."}</p>
          {loadError && (
            <button
              type="button"
              className="ap-secondary"
              onClick={() => setRevision((value) => value + 1)}
            >
              Tekrar dene
            </button>
          )}
          <button
            className="ap-secondary"
            onClick={() =>
              window.history.replaceState(
                null,
                "",
                storeRoutes.products(store.slug),
              )
            }
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
      <footer className="ap-pagination">
        <span>
          {total} ürün · {total ? (page - 1) * 6 + 1 : 0}–
          {Math.min(page * 6, total)} arası gösteriliyor
        </span>
        <Pagination
          page={page}
          pageCount={pageCount}
          disabled={pending}
          onChange={(value) => changeFilter("page", String(value))}
        />
      </footer>
      <p className="ap-demo-note">
        <Icon name="science" />
        Ürün bilgileri sunucuda saklanır. Satıştaki ürünler vitrininizde
        gösterilir.
      </p>
      {notice && (
        <div className="ad-notice" role="status">
          <Icon name="info" />
          <span>{notice}</span>
          <button aria-label="Bildirimi kapat" onClick={() => setNotice("")}>
            <Icon name="close" />
          </button>
        </div>
      )}
    </AdminShell>
  );
}
