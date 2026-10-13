import { z } from "zod";
import { api } from "@/lib/http";
import type { AdminOrder } from "../types/order";
export const orderSchema = z.object({
  id: z.uuid(), version: z.number().int(), createdAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  customer: z.string(), email: z.string(), phone: z.string(), address: z.string(), city: z.string(), customerNote: z.string(), internalNote: z.string(),
  items: z.array(z.object({productId: z.uuid(), name: z.string(), sku: z.string(), variant: z.string(), image: z.string(), quantity: z.number().int(), unitCents: z.number().int()})).min(1),
  discountCents: z.number().int(), shippingCents: z.number().int(), shipment: z.enum(["preparing", "cancelled", "shipped", "delivered"]), payment: z.enum(["pending", "paid", "refunded"]),
  carrier: z.string(), tracking: z.string(), reservation: z.enum(["held", "released", "consumed"]),
});
const path = (slug: string) => `/stores/${encodeURIComponent(slug)}/orders`;
export const ordersListSchema = z.object({items: z.array(orderSchema), total: z.number().int(), page: z.number().int(), pages: z.number().int(), limit: z.number().int(), counts: z.record(z.string(), z.number().int())});
export const loadOrders = (slug: string, query: URLSearchParams, signal?: AbortSignal) => api(`${path(slug)}?${query}`, ordersListSchema, {signal});
export const loadOrder = (slug: string, id: string, signal?: AbortSignal) => api(`${path(slug)}/${encodeURIComponent(id)}`, orderSchema, {signal});
export const createOrder = (slug: string, requestId: string, input: {customer: string; city: string; address: string; carrier: string; lines: {productId: string; quantity: number; variant: string}[]}) => api(path(slug), orderSchema, {method: "POST", body: JSON.stringify({...input, requestId})});
export const editOrder = (slug: string, order: AdminOrder) => api(`${path(slug)}/${encodeURIComponent(order.id)}`, orderSchema, {method: "PUT", body: JSON.stringify({version: order.version, address: order.address, city: order.city, internalNote: order.internalNote})});
export const cancelOrder = (slug: string, order: AdminOrder) => api(`${path(slug)}/${encodeURIComponent(order.id)}/cancel`, orderSchema, {method: "POST", body: JSON.stringify({version: order.version})});
