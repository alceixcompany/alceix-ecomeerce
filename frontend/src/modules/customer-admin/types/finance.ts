export type FinanceTransaction = { id: string; title: string; detail: string; date: string; type: "sale" | "transfer" | "refund"; method: string; grossCents: number; commissionCents: number; netCents: number };
export type BankAccount = { owner: string; bank: string; iban: string };
