import type { Order, OrderQuery, DailySale } from "../domain/order";
export const ORDERS = Symbol("ORDERS");
export interface OrdersRepository {
  dailySales(
    storeId: string | undefined,
    start: Date,
    end: Date,
  ): Promise<DailySale[]>;
  sales(storeId?: string): Promise<{
    paidOrders: number;
    refundedOrders: number;
    paidCents: number;
    refundedCents: number;
    currency: "TRY";
  }>;
  held(storeId: string, buyerId: string): Promise<number>;
  summary(
    storeId: string,
  ): Promise<{ total: number; pending: number; cancelled: number }>;
  create(order: Order): Promise<void>;
  find(storeId: string, id: string): Promise<Order | null>;
  byRequest(
    storeId: string,
    actorId: string,
    requestId: string,
  ): Promise<Order | null>;
  list(
    storeId: string | undefined,
    query: OrderQuery,
    buyerId?: string,
  ): Promise<{
    items: Order[];
    total: number;
    page: number;
    pages: number;
    counts: Record<string, number>;
  }>;
  save(order: Order, version: number): Promise<Order | null>;
  settledReady(now: Date): Promise<Order[]>;
  expired(now: Date, limit: number): Promise<Order[]>;
}
