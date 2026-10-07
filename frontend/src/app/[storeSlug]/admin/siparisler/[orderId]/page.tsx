import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/mocks/dashboard";
import { OrderDetailScreen } from "@/modules/customer-admin/screens/order-detail-screen";
export const metadata:Metadata={title:"Sipariş Detayı | Alceix",robots:{index:false,follow:false}};
export default async function OrderDetailPage({params}:{params:Promise<{storeSlug:string;orderId:string}>}) { const {storeSlug,orderId}=await params;const store=getAdminStore(storeSlug);if(!store||! /^(?:HA|MAN)-\d{4,13}$/.test(orderId))notFound();return <OrderDetailScreen key={orderId} store={store} orderId={orderId}/>; }
