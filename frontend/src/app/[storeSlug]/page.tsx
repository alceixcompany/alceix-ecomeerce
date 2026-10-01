import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Storefront } from "@/modules/storefront/components/storefront";
import { getStore } from "@/modules/storefront/data/stores";

type Props = { params: Promise<{ storeSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = getStore(storeSlug);
  return { title: store ? `${store.name} | Alceix` : "Mağaza bulunamadı | Alceix", description: store?.description };
}
export default async function StorePage({ params }: Props) {
  const { storeSlug } = await params;
  const store = getStore(storeSlug);
  if (!store) notFound();
  return <Storefront store={store} />;
}
