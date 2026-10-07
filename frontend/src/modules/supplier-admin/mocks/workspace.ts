import type { SupplierCompany, SupplierWorkspace } from "../types/supplier-admin";
export const supplierCompanies: SupplierCompany[] = [
  { id: "modatekstil", slug: "modatekstil", name: "ModaTekstil B2B Üretim A.Ş.", initials: "MT", city: "Merter / İstanbul" },
  { id: "firmaadi", slug: "firmaadi", name: "Alceix Örnek Tedarikçi", initials: "AT", city: "İstanbul" },
];
export function getSupplierCompany(slug: string) { return supplierCompanies.find(company => company.slug === slug); }
export function createSupplierWorkspace(company: SupplierCompany): SupplierWorkspace {
  return {
    companyName: company.name, description: "Alceix mağazaları için doğrudan üretim, güncel stok ve tekli dropshipping tedariki.", iban: "", syncEnabled: false,
    products: [
      { id: "knit-01", name: "Kaşmir Dokulu Triko Hırka", sku: "MT-1001", category: "Triko", image: "/dropshipping/cardigan.jpg", costCents: 32000, stock: 84, active: true, minimum: 1 },
      { id: "knit-02", name: "Krem Oversize Hırka", sku: "MT-1002", category: "Triko", image: "/storefront/gallery/cardigan-alternate.png", costCents: 42000, stock: 36, active: true, minimum: 1 },
      { id: "knit-03", name: "Günlük Basic Triko", sku: "MT-1003", category: "Basic", image: "/dropshipping/supplier-knit.jpg", costCents: 21000, stock: 4, active: true, minimum: 1 },
      { id: "knit-04", name: "Yeni Sezon Örme Hırka", sku: "MT-1004", category: "Triko", image: "/dropshipping/cardigan.jpg", costCents: 29000, stock: 0, active: false, minimum: 2 },
    ],
    stores: [
      { id: "heer", name: "Heer Atelier", city: "İstanbul", active: true, products: 3 },
      { id: "luma", name: "Luma Studio", city: "İzmir", active: true, products: 2 },
      { id: "nova", name: "Nova Butik", city: "Ankara", active: true, products: 1 },
    ],
    orders: [
      { id: "B2B-1042", buyerStoreId: "heer", productId: "knit-01", quantity: 2, unitCostCents: 32000, status: "preparing", tracking: "" },
      { id: "B2B-1041", buyerStoreId: "luma", productId: "knit-02", quantity: 1, unitCostCents: 42000, status: "shipped", tracking: "DEMO-1041" },
      { id: "B2B-1040", buyerStoreId: "nova", productId: "knit-03", quantity: 3, unitCostCents: 21000, status: "delivered", tracking: "DEMO-1040" },
    ],
    messages: [
      { id: "msg-1", storeId: "heer", text: "Merhaba, triko koleksiyonunuz için stok güncellemesi alabilir miyiz?", author: "store" },
      { id: "msg-2", storeId: "luma", text: "Siparişimizin paketleme durumunu öğrenmek istiyoruz.", author: "store" },
    ],
  };
}
