export type InboxNotification = {
  id: string;
  userId: string;
  sourceId: string;
  title: string;
  text: string;
  url: string;
  read: boolean;
  createdAt: Date;
};
export type DeliveryBatch = {
  id: string;
  storeId: string;
  draftId: string;
  source?: "store" | "platform";
  recipients?: string[];
  draftVersion?: number;
  dispatchLock?: number;
  actorId: string;
  subject: string;
  message: string;
  channel: "email" | "sms" | "whatsapp";
  segment: "all" | "new" | "vip" | "cart" | "inactive";
  cursor: string;
  status: "queued" | "producing" | "enqueued" | "cancelled";
  version: number;
  createdAt: Date;
};
export type Delivery = {
  id: string;
  batchId: string;
  audience?: "marketing" | "transactional" | "platform";
  storeId: string;
  customerId: string;
  status: "queued" | "awaiting" | "sent" | "failed" | "skipped";
  availableAt: Date;
  createdAt: Date;
};
export type Subscription = {
  storeId: string;
  customerId: string;
  active: boolean;
};
export type OptOutToken = { hash: string; storeId: string; customerId: string };
export const NOTIFICATIONS = Symbol("NOTIFICATIONS");
export interface NotificationsRepository {
  inbox(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    items: InboxNotification[];
    total: number;
    page: number;
    pages: number;
  }>;
  notify(notification: InboxNotification): Promise<void>;
  read(userId: string, id: string): Promise<boolean>;
  subscription(
    storeId: string,
    customerId: string,
  ): Promise<Subscription | null>;
  saveSubscription(subscription: Subscription): Promise<void>;
  token(hash: string): Promise<OptOutToken | null>;
  createToken(token: OptOutToken): Promise<void>;
  batch(id: string): Promise<DeliveryBatch | null>;
  createBatch(batch: DeliveryBatch): Promise<void>;
  nextBatch(): Promise<DeliveryBatch | null>;
  lockBatch(id: string): Promise<boolean>;
  saveBatch(batch: DeliveryBatch, version: number): Promise<boolean>;
  delivery(id: string): Promise<Delivery | null>;
  createDelivery(delivery: Delivery): Promise<void>;
  nextDelivery(): Promise<Delivery | null>;
  saveDelivery(
    id: string,
    status: Delivery["status"],
    availableAt?: Date,
  ): Promise<void>;
  stats(batchId: string): Promise<Record<string, number>>;
}
