import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreSettingsScreen } from "@/modules/customer-admin/screens/store-settings-screen";
import { getAdminStore } from "@/modules/customer-admin/server";
export const metadata: Metadata = { title: "Mağaza Profili & Ayarlar | Alceix", robots: { index: false, follow: false } };
export default async function StoreSettingsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const store = await getAdminStore(storeSlug);
  if (!store) notFound();
  return <StoreSettingsScreen store={store} />;
}
