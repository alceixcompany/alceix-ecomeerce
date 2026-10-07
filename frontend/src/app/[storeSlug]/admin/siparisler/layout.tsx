import { OrderWorkspaceProvider } from "@/modules/customer-admin/hooks/order-workspace";
export default async function OrdersLayout({children,params}:{children:React.ReactNode;params:Promise<{storeSlug:string}>}) {
  const {storeSlug}=await params;
  return <OrderWorkspaceProvider key={storeSlug}>{children}</OrderWorkspaceProvider>;
}
