import type {
  CommercePolicy,
  Journal,
  BankProfile,
  Withdrawal,
  BankVerificationReceipt,
} from "../domain/finance";
import type { PageQuery } from "../../../shared/page";
export const FINANCE = Symbol("FINANCE");
export interface FinanceRepository {
  bankReceipt(id: string): Promise<BankVerificationReceipt | null>;
  createBankReceipt(receipt: BankVerificationReceipt): Promise<void>;
  policy(scopeId: string): Promise<CommercePolicy | null>;
  savePolicy(
    policy: CommercePolicy,
    version: number,
  ): Promise<CommercePolicy | null>;
  journal(referenceId: string, kind: string): Promise<Journal | null>;
  post(journal: Journal): Promise<void>;
  balance(account: string): Promise<number>;
  debit(account: string, amount: number): Promise<boolean>;
  journals(
    scopeId: string | undefined,
    query: PageQuery,
  ): Promise<{ items: Journal[]; total: number; page: number; pages: number }>;
  bank(scopeId: string): Promise<BankProfile | null>;
  saveBank(bank: BankProfile, version: number): Promise<BankProfile | null>;
  withdrawals(
    scopeId: string | undefined,
    query: PageQuery,
    status?: Withdrawal["status"],
  ): Promise<{
    items: Withdrawal[];
    total: number;
    page: number;
    pages: number;
  }>;
  withdrawal(id: string): Promise<Withdrawal | null>;
  createWithdrawal(withdrawal: Withdrawal): Promise<void>;
  saveWithdrawal(
    withdrawal: Withdrawal,
    version: number,
  ): Promise<Withdrawal | null>;
}
