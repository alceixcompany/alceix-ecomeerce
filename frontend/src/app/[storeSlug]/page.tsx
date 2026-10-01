import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Storefront } from "@/modules/storefront/components/storefront";
import { getStore } from "@/modules/storefront/server";

type Props = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
async function search(props: Props) {
  const values = await props.searchParams;
  return new URLSearchParams(
    Object.entries(values).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : [],
    ),
  ).toString();
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { storeSlug } = await props.params;
  const store = await getStore(storeSlug, await search(props));
  return {
    title: store
      ? store.seoTitle || `${store.name} | Alceix`
      : "Mağaza bulunamadı | Alceix",
    description: store?.seoDescription || store?.description,
    icons: store?.faviconImage ? { icon: store.faviconImage } : undefined,
  };
}
export default async function StorePage(props: Props) {
  const { storeSlug } = await props.params;
  const store = await getStore(storeSlug, await search(props));
  if (!store) notFound();
  return <Storefront key={store.id ?? store.slug} store={store} />;
}
