import type { AdminOrder, ShipmentStatus } from "../types/order";
export const shipmentLabels: Record<ShipmentStatus, string> = { preparing: "Paket Hazırlanıyor", shipped: "Kargoda / Yolda", delivered: "Teslim Edildi", cancelled: "İptal Edildi" };
export const paymentLabels = { paid: "Ödendi", pending: "Ödeme Bekliyor", refunded: "İade Edildi" };
export const orderSubtotal = (order: AdminOrder) => order.items.reduce((sum, line) => sum + line.quantity * line.unitCents, 0);
export const orderTotal = (order: AdminOrder) => orderSubtotal(order) - order.discountCents + order.shippingCents;
export function canAdvanceOrder(order: AdminOrder): boolean { return order.payment === "paid" && (order.shipment === "preparing" && !!order.tracking || order.shipment === "shipped"); }
export function advanceOrder(order: AdminOrder): AdminOrder {
  if (!canAdvanceOrder(order)) return order;
  return { ...order, shipment: order.shipment === "preparing" ? "shipped" : "delivered" };
}
export function ordersCsv(orders: AdminOrder[]): string {
  const cell = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
  return "\uFEFF" + [["Sipariş", "Müşteri", "Tutar (TL)", "Kargo", "Takip", "Durum"], ...orders.map(order => [order.id, order.customer, (orderTotal(order) / 100).toFixed(2), order.carrier, order.tracking, shipmentLabels[order.shipment]])].map(row => row.map(cell).join(";")).join("\r\n");
}
