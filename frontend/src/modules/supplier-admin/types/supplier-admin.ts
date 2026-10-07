import type {AdminProduct} from "@/modules/admin-editors";
export type SupplierSection = "dashboard" | "products" | "orders" | "stores" | "finance" | "messages" | "settings" | "api" | "support" | "studio" | "team" | "reviews";
export type SupplierCompany = { id: string; slug: string; name: string; initials: string; city: string };
export type WholesaleProduct = { id: string; name: string; sku: string; category: string; image: string; costCents: number; stock: number; active: boolean; minimum: number; details?: AdminProduct };
export type ConnectedStore = { id: string; name: string; city: string; active: boolean; products: number };
export type WholesaleOrder = { id: string; buyerStoreId: string; productId: string; quantity: number; unitCostCents: number; status: "preparing" | "shipped" | "delivered" | "cancelled"; tracking: string; address?:string; internalNote?:string };
export type SupplierMessage = { id: string; storeId: string; text: string; author: "supplier" | "store" };
export type SupplierWorkspace = { products: WholesaleProduct[]; orders: WholesaleOrder[]; stores: ConnectedStore[]; messages: SupplierMessage[]; companyName: string; description: string; iban: string; syncEnabled: boolean };
