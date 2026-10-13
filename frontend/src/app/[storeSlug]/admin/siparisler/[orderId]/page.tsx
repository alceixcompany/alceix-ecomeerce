import { z } from "zod";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminStore } from "@/modules/customer-admin/server";
import { OrderDetailScreen } from "@/modules/customer-admin/screens/order-detail-screen";
export const metadata:Metadata={title:"Sipariş Detayı | Alceix",robots:{index:false,follow:false}};
export default async function OrderDetailPage({params}:{params:Promise<{storeSlug:string;orderId:string}>}) { const {storeSlug,orderId}=await params;const store=await getAdminStore(storeSlug);if(!store||!z.uuid().safeParse(orderId).success)notFound();return <OrderDetailScreen key={orderId} store={store} orderId={orderId}/>; }
