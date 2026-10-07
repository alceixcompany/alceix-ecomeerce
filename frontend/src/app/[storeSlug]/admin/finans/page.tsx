import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinanceScreen } from "@/modules/customer-admin/screens/finance-screen";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
export const metadata: Metadata = { title: "Cüzdan & Finans | Alceix", robots: { index: false, follow: false } };
export default async function FinancePage({params}:{params:Promise<{storeSlug:string}>}) {
  const {storeSlug}=await params;const store=getAdminStore(storeSlug);if(!store)notFound();return <FinanceScreen store={store}/>;
}
