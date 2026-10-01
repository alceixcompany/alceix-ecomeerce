export type CartLine = { productId: string; quantity: number };
export type Cart = {
  hash: string;
  storeId: string;
  lines: CartLine[];
  version: number;
  expiresAt: Date;
};
export const ENGAGEMENT = Symbol("ENGAGEMENT");
export interface EngagementRepository {
  cart(hash: string, storeId: string): Promise<Cart>;
  saveCart(
    hash: string,
    storeId: string,
    lines: CartLine[],
    version: number,
  ): Promise<Cart | null>;
  followed(storeId: string, userId: string): Promise<boolean>;
  follow(storeId: string, userId: string, enabled: boolean): Promise<void>;
}
