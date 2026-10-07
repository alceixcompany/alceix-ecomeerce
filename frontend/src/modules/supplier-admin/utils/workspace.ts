import {isAdminProduct} from "@/modules/admin-editors";
import type { ConnectedStore, SupplierWorkspace, WholesaleOrder } from "../types/supplier-admin";
export const money = (cents: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(cents / 100);
export function canSellToStore(stores: ConnectedStore[], buyerId: string) { return stores.some(store => store.id === buyerId && store.active); }
export function createWholesaleOrder(workspace: SupplierWorkspace, buyerId: string, productId: string, quantity: number, id: string): WholesaleOrder {
  const product = workspace.products.find(item => item.id === productId);
  if (!canSellToStore(workspace.stores, buyerId)) throw new Error("Yalnızca bağlı ve aktif Alceix mağazalarına sipariş oluşturulabilir.");
  if (!product?.active || product.costCents<=0 || !Number.isSafeInteger(quantity) || quantity < product.minimum || quantity > product.stock) throw new Error("Aktif ürün, minimum sipariş ve kullanılabilir stok bilgilerini kontrol edin.");
  return { id, buyerStoreId: buyerId, productId, quantity, unitCostCents: product.costCents, status: "preparing", tracking: "" };
}
export function isSupplierWorkspace(value: unknown): value is SupplierWorkspace {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.companyName !== "string" || v.companyName.length > 120 || typeof v.description !== "string" || v.description.length > 1000 || typeof v.iban !== "string" || v.iban.length > 34 || typeof v.syncEnabled !== "boolean") return false;
  if (!Array.isArray(v.products)) return false;
  const products = v.products as unknown[];
  if (products.length > 100 || !products.every(p => {
    if (!p || typeof p !== "object") return false;
    const item = p as Record<string, unknown>;
    return ["id", "name", "sku", "category"].every(key => typeof item[key] === "string" && (item[key] as string).length <= 120) && typeof item.image === "string" && (/^\/(dropshipping|storefront\/gallery)\/[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(item.image) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(item.image)&&item.image.length<=22000000) && (item.details===undefined || isAdminProduct(item.details)&&item.details.images.length<=6) && typeof item.active === "boolean" && Number.isSafeInteger(item.costCents) && Number(item.costCents) >= 0 && (!item.active || Number(item.costCents)>0) && Number(item.costCents) <= 100000000 && Number.isSafeInteger(item.stock) && Number(item.stock) >= 0 && Number(item.stock) <= 1000000 && Number.isSafeInteger(item.minimum) && Number(item.minimum) >= 1 && Number(item.minimum)<=1000000;
  })) return false;
  if (!Array.isArray(v.stores) || v.stores.length > 100 || !v.stores.every(s => s && typeof s === "object" && typeof s.id === "string" && typeof s.name === "string" && typeof s.city === "string" && typeof s.active === "boolean" && Number.isSafeInteger(s.products))) return false;
  if (!Array.isArray(v.orders) || v.orders.length > 1000 || !v.orders.every(o => o && typeof o === "object" && typeof o.id === "string" && v.stores instanceof Array && v.stores.some(s => s.id === o.buyerStoreId) && products.some(p => (p as Record<string, unknown>).id === o.productId) && Number.isSafeInteger(o.quantity) && o.quantity > 0 && Number.isSafeInteger(o.unitCostCents) && o.unitCostCents > 0 && ["preparing", "shipped", "delivered", "cancelled"].includes(o.status) && typeof o.tracking === "string" && (o.address===undefined||typeof o.address==="string"&&o.address.length<=500) && (o.internalNote===undefined||typeof o.internalNote==="string"&&o.internalNote.length<=500))) return false;
  return Array.isArray(v.messages) && v.messages.length <= 1000 && v.messages.every(m => m && typeof m === "object" && typeof m.id === "string" && typeof m.text === "string" && m.text.length <= 2000 && ["supplier", "store"].includes(m.author) && v.stores instanceof Array && v.stores.some(s => s.id === m.storeId));
}

export function cancelWholesaleOrder(workspace:SupplierWorkspace,id:string):SupplierWorkspace {
 const order=workspace.orders.find(o=>o.id===id);if(!order||order.status!=="preparing")throw new Error("Yalnızca hazırlanan siparişler iptal edilebilir.");
 const product=workspace.products.find(p=>p.id===order.productId);if(!product||product.stock+order.quantity>1000000)throw new Error("Stok iade limiti aşıldı.");
 return {...workspace,orders:workspace.orders.map(o=>o.id===id?{...o,status:"cancelled"}:o),products:workspace.products.map(p=>p.id===order.productId?{...p,stock:p.stock+order.quantity}:p)};
}
