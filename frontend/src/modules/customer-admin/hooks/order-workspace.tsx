"use client";
import { createContext, useContext, useState } from "react";
import { demoOrders } from "../mocks/orders";
import type { AdminOrder } from "../types/order";
type OrderWorkspace = { orders: AdminOrder[]; updateOrder: (id: string, update: (order: AdminOrder) => AdminOrder) => void; addOrder: (order: AdminOrder) => void };
const OrderContext = createContext<OrderWorkspace | null>(null);
// This provider is scoped to one tenant's order routes. Demo changes stay in memory.
export function OrderWorkspaceProvider({children}:{children:React.ReactNode}) {
  const [orders,setOrders] = useState<AdminOrder[]>(demoOrders);
  return <OrderContext.Provider value={{orders,updateOrder:(id,update)=>setOrders(current=>current.map(order=>order.id===id?update(order):order)),addOrder:order=>setOrders(current=>[order,...current])}}>{children}</OrderContext.Provider>;
}
export function useOrderWorkspace() { const workspace=useContext(OrderContext); if(!workspace)throw new Error("Order workspace is missing"); return workspace; }
