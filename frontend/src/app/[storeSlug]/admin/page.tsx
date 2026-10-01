import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerDashboard } from "@/modules/customer-admin/screens/customer-dashboard";
import { getAdminStore, getDashboard } from "@/modules/customer-admin/server";
export const metadata: Metadata = { title: "Mağaza Yönetimi | Alceix", robots: { index: false, follow: false } };
export default async function AdminPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const store = await getAdminStore(storeSlug);
  if (!store) notFound();
  return <CustomerDashboard store={store} summary={await getDashboard(store.slug)} />;
}
