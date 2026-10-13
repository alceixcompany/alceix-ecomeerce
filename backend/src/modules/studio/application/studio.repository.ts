import type {
  StudioPolicy,
  StudioJob,
  CreditLot,
  CreditPurchase,
} from "../domain/studio";
import type { PageQuery } from "../../../shared/page";
export const STUDIO = Symbol("STUDIO");
export interface StudioRepository {
  policy(): Promise<StudioPolicy | null>;
  savePolicy(
    policy: StudioPolicy,
    version: number,
  ): Promise<StudioPolicy | null>;
  job(id: string): Promise<StudioJob | null>;
  createJob(job: StudioJob): Promise<void>;
  saveJob(job: StudioJob, version: number): Promise<boolean>;
  list(
    scopeId: string,
    query: PageQuery,
  ): Promise<{
    items: StudioJob[];
    total: number;
    page: number;
    pages: number;
  }>;
  lot(id: string): Promise<CreditLot | null>;
  createLot(lot: CreditLot): Promise<void>;
  reserveLot(
    scopeId: string,
    limit: number,
  ): Promise<{ lotId: string; credits: number } | null>;
  releaseLot(id: string, credits: number, consume: boolean): Promise<boolean>;
  refundLot(id: string, credits: number): Promise<boolean>;
  balance(
    scopeId: string,
  ): Promise<{ available: number; held: number; spent: number }>;
  purchaseByRefund(id: string): Promise<CreditPurchase | null>;
  restoreLot(id: string, credits: number): Promise<boolean>;
  purchase(id: string): Promise<CreditPurchase | null>;
  createPurchase(purchase: CreditPurchase): Promise<void>;
  savePurchase(
    purchase: CreditPurchase,
    status: CreditPurchase["status"],
  ): Promise<boolean>;
}
