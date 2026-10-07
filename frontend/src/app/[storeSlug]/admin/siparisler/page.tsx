import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
import { OrdersScreen } from "@/modules/customer-admin/screens/orders-screen";
export const metadata:Metadata={title:"Sipariş & Kargo | Alceix",robots:{index:false,follow:false}};
export default async function OrdersPage({params,searchParams}:{params:Promise<{storeSlug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {storeSlug}=await params; const store=getAdminStore(storeSlug); if(!store)notFound();
  const query=await searchParams;
  return <OrdersScreen store={store} initialQuery={{period:typeof query.period==="string"?query.period:"all",q:typeof query.q==="string"?query.q:"",tab:typeof query.tab==="string"?query.tab:"all",carrier:typeof query.carrier==="string"?query.carrier:"all",page:typeof query.page==="string"?query.page:"1"}}/>;
}
