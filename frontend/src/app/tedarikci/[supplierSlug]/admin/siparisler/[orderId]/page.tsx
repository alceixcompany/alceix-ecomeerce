import {SupplierOrderDetail} from "@/modules/supplier-admin/screens/supplier-order-detail";
export const metadata={title:"B2B Sipariş Detayı | Alceix"};
export default async function Page({params}:{params:Promise<{orderId:string}>}){const {orderId}=await params;return <SupplierOrderDetail key={orderId} orderId={orderId}/>;}
