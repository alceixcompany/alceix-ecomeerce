import type {
  PaymentIntent,
  Shipment,
  RefundRequest,
  CheckoutReceipt,
} from "../domain/commerce";
export const COMMERCE = Symbol("COMMERCE");
export interface CommerceRepository {
  checkout(id: string): Promise<CheckoutReceipt | null>;
  createCheckout(receipt: CheckoutReceipt): Promise<void>;
  payment(id: string): Promise<PaymentIntent | null>;
  orderPayment(orderId: string): Promise<PaymentIntent | null>;
  createPayment(payment: PaymentIntent): Promise<void>;
  savePayment(
    payment: PaymentIntent,
    version: number,
  ): Promise<PaymentIntent | null>;
  shipment(id: string): Promise<Shipment | null>;
  orderShipment(orderId: string): Promise<Shipment | null>;
  createShipment(shipment: Shipment): Promise<void>;
  saveShipment(shipment: Shipment, version: number): Promise<Shipment | null>;
  compensations(): Promise<RefundRequest[]>;
  refund(id: string): Promise<RefundRequest | null>;
  orderRefund(orderId: string): Promise<RefundRequest | null>;
  createRefund(refund: RefundRequest): Promise<void>;
  saveRefund(
    refund: RefundRequest,
    version: number,
  ): Promise<RefundRequest | null>;
}
