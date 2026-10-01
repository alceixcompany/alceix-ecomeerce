import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsScreen } from "@/modules/customer-admin/screens/products-screen";
import { getAdminStore } from "@/modules/customer-admin/server";
export const metadata: Metadata = { title: "Ürün Yönetimi | Alceix", robots: { index: false, follow: false } };
export default async function ProductsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug }=await params; const store=await getAdminStore(storeSlug);
  if(!store) notFound();
  return <ProductsScreen store={store}/>;
}
