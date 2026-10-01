import type { AdminProduct } from "../types/product";
export const productCategories = ["Giyim", "Bakım", "Ev & Yaşam", "Aksesuar"];
const samples = [
  { name: "Oversize Kaşmir Triko Hırka", category: "Giyim", priceCents: 89000, costCents: 58000, stock: 84, image: "cardigan", sku: "KSM-8842", variants: ["S","M","L","XL"] },
  { name: "Minimal Deri Kartlık", category: "Aksesuar", priceCents: 49000, costCents: 28000, stock: 220, image: "cardholder", sku: "DRI-1409", variants: ["Standart"] },
  { name: "Doğal Dokulu Triko Hırka", category: "Giyim", priceCents: 74000, costCents: 49000, stock: 2, image: "cardigan", sku: "TRK-4011", variants: ["M","L","XL"] },
  { name: "C Vitamini Bakım Serumu", category: "Bakım", priceCents: 62000, costCents: 28000, stock: 4, image: "serum", sku: "SRM-098", variants: ["30 ml"] },
  { name: "Meşe Masa Üstü Telefon Standı", category: "Ev & Yaşam", priceCents: 38000, costCents: 21000, stock: 16, image: "phone-stand", sku: "MES-9002", variants: ["Doğal meşe"] },
  { name: "Zamansız Deri Kartlık", category: "Aksesuar", priceCents: 42000, costCents: 19000, stock: 65, image: "cardholder", sku: "KRT-5501", variants: ["Kahverengi"] },
  { name: "Yumuşak Dokulu Hırka", category: "Giyim", priceCents: 69000, costCents: 42000, stock: 0, image: "cardigan", sku: "HRK-6701", variants: ["S","M"] },
  { name: "Günlük Bakım Serumu", category: "Bakım", priceCents: 34000, costCents: 18000, stock: 0, image: "serum", sku: "BAK-7701", variants: ["30 ml"] },
  { name: "Çalışma Masası Standı", category: "Ev & Yaşam", priceCents: 45000, costCents: 25000, stock: 30, image: "phone-stand", sku: "STD-3301", variants: ["Standart"] },
];
export const demoProducts: AdminProduct[] = samples.map((product,index)=>({id:`demo-product-${index+1}`,name:product.name,category:product.category,description:"Özenle seçilmiş malzemeler ve gündelik hayata eşlik eden sade tasarım. Bu ürün örnek katalog verisidir.",sku:product.sku,barcode:`86900000000${String(index+1).padStart(2,"0")}`,priceCents:product.priceCents,costCents:product.costCents,stock:product.stock,variants:product.variants,images:[`/dropshipping/${product.image}.jpg`,`/storefront/gallery/${product.image}-alternate.png`],status:index>5 ? "draft":"live",model:"own",seoTitle:product.name,seoDescription:"Alceix mağazamızın özenle seçilmiş koleksiyonunu keşfedin.",createdAt:`2026-09-${String(20-index).padStart(2,"0")}T10:00:00Z`}));
