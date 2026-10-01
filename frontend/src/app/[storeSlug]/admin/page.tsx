import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerDashboard } from "@/modules/customer-admin/screens/customer-dashboard";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
export const metadata: Metadata = { title: "Mağaza Yönetimi | Alceix", robots: { index: false, follow: false } };
export default async function AdminPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const store = getAdminStore(storeSlug);
  if (!store) notFound();
  return <CustomerDashboard store={store} />;
}
