"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { AdminOrder } from "../types/order";
import { cancelOrder, editOrder, loadOrder, loadOrders } from "../services/orders-api";
import { errorMessage } from "@/lib/http";
type OrderWorkspace = {
  slug: string; orders: AdminOrder[]; ready: boolean; pending: boolean; error: string; total: number; pages: number; page: number; counts: Record<string, number>;
  refresh: () => void;
  updateOrder: (id: string, update: (order: AdminOrder) => AdminOrder) => Promise<void>;
};
const OrderContext = createContext<OrderWorkspace | null>(null);
export function OrderWorkspaceProvider({children, slug}: {children: React.ReactNode; slug: string}) {
  const params = useSearchParams(), pathname = usePathname(), writing = useRef(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]), [ready, setReady] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState("");
  const [total, setTotal] = useState(0), [page, setPage] = useState(1), [pages, setPages] = useState(1), [counts, setCounts] = useState<Record<string, number>>({}), [reload, setReload] = useState(0);
  const queryString = params.toString();
  useEffect(() => {
    const controller = new AbortController(); setReady(false); setError(""); setOrders([]);
    const timer = setTimeout(async () => {
      try {
        const id = pathname.split("/").at(-1);
        if (id !== "siparisler") {
          const order = await loadOrder(slug, id || "", controller.signal);
          if (controller.signal.aborted) return;
          setOrders([order]); setTotal(1); setPage(1); setPages(1);
        } else {
          const input = new URLSearchParams(queryString), query = new URLSearchParams();
          for (const field of ["q", "tab", "carrier", "period", "page"]) if (input.get(field)) query.set(field, input.get(field)!);
          query.set("limit", "5");
          const result = await loadOrders(slug, query, controller.signal);
          if (controller.signal.aborted) return;
          setOrders(result.items); setTotal(result.total); setPage(result.page); setPages(result.pages); setCounts(result.counts);
        }
        setReady(true); setError("");
      } catch (error) { if (!controller.signal.aborted) setError(errorMessage(error)); }
    }, 200);
    return () => {clearTimeout(timer); controller.abort();};
  }, [slug, pathname, queryString, reload]);
  async function updateOrder(id: string, update: (order: AdminOrder) => AdminOrder) {
    if (!ready || writing.current) throw new Error("İşlem sürüyor. Biraz sonra tekrar deneyin.");
    const order = orders.find(order => order.id === id);
    if (!order) throw new Error("Sipariş bulunamadı.");
    writing.current = true; setPending(true);
    try {
      const next = update(order);
      const saved = next.shipment === "cancelled" ? await cancelOrder(slug, order) : await editOrder(slug, next);
      setOrders(current => current.map(order => order.id === saved.id ? saved : order));
      setReload(n => n + 1);
    } finally {writing.current = false; setPending(false);}
  }
  return <OrderContext.Provider value={{slug, orders, ready, pending, error, total, pages, page, counts, refresh: () => setReload(n => n+1), updateOrder}}>{children}</OrderContext.Provider>;
}
export function useOrderWorkspace() { const workspace = useContext(OrderContext); if (!workspace) throw new Error("Order workspace is missing"); return workspace; }
