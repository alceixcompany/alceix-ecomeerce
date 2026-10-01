import type { AdminProduct, ProductDraft } from "../types/product";
export const productMoney = (cents: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(cents / 100);
export function parsePrice(value: string): number | undefined {
  const clean = value.trim().replace(",", ".");
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(clean)) return undefined;
  const [whole, fraction = ""] = clean.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export function newProductDraft(product?: AdminProduct): ProductDraft {
  return product ? { ...product, price: String(product.priceCents / 100), cost: String(product.costCents / 100), stock: String(product.stock), variants: product.variants.join(", "), images: [...product.images] } : { name: "", category: "Giyim", description: "", sku: "", barcode: "", price: "", cost: "", stock: "0", variants: "", images: [], status: "live", model: "own", seoTitle: "", seoDescription: "" };
}
export function productValidation(draft: ProductDraft, step: number): string {
  if (step === 1) { if (!draft.name.trim()) return "Ürün adını yazın."; if (!draft.category.trim()) return "Bir kategori seçin."; if (!draft.images.length) return "En az bir ürün görseli ekleyin veya örnek görselleri kullanın."; if (draft.barcode && !/^\d{8,14}$/.test(draft.barcode)) return "Barkod 8–14 rakamdan oluşmalı."; }
  if (step === 2) { const price=parsePrice(draft.price),cost=parsePrice(draft.cost || "0"); if(price === undefined || price <= 0) return "Geçerli bir satış fiyatı girin (ör. 890,00)."; if(cost === undefined) return "Geçerli bir maliyet girin."; if(!/^\d{1,7}$/.test(draft.stock)) return "Stok adedi sıfır veya pozitif tam sayı olmalı."; }
  return "";
}
export function isAdminProduct(value: unknown): value is AdminProduct {
  if(!value || typeof value !== "object") return false;
  const record=value as Record<string,unknown>;
  return ["id","name","category","description","sku","barcode","seoTitle","seoDescription","createdAt"].every(key=>typeof record[key] === "string") && ["priceCents","costCents","stock"].every(key=>typeof record[key] === "number" && Number.isSafeInteger(record[key]) && Number(record[key])>=0) && ["variants","images"].every(key=>Array.isArray(record[key]) && (record[key] as unknown[]).every(item=>typeof item === "string")) && ["live","draft"].includes(String(record.status)) && ["own","supplier"].includes(String(record.model));
}
// Prevent user-entered CSV cells from becoming spreadsheet formulas.
export function productCsv(products: AdminProduct[]): string {
  const cell=(value:string|number)=> { const text=String(value);return `"${(/^[=+@\-\t\r]/.test(text) ? "'" : "")+text.replaceAll('"','""')}"`; };
  return "\uFEFF" + [["Ürün","Kategori","SKU","Barkod","Fiyat (TL)","Stok","Durum"],...products.map(p=>[p.name,p.category,p.sku,p.barcode,(p.priceCents/100).toFixed(2),p.stock,p.status === "live" ? "Satışta" : "Taslak"])].map(row=>row.map(cell).join(";")).join("\r\n");
}
