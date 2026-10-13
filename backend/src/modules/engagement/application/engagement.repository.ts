export type CartLine = {
  productId: string;
  quantity: number;
  variant?: string;
};
export type Cart = {
  hash: string;
  storeId: string;
  lines: CartLine[];
  version: number;
  expiresAt: Date;
  buyerId?: string;
  email?: string;
};
export const ENGAGEMENT = Symbol("ENGAGEMENT");
export interface EngagementRepository {
  cart(hash: string, storeId: string): Promise<Cart>;
  saveCart(
    hash: string,
    storeId: string,
    lines: CartLine[],
    version: number,
    identity?: { buyerId: string; email: string },
  ): Promise<Cart | null>;
  followed(storeId: string, userId: string): Promise<boolean>;
  follow(storeId: string, userId: string, enabled: boolean): Promise<void>;
}
