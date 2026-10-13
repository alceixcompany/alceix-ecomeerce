import type { OrderMetric, CartMetricInput } from "../domain/customer";
import type {
  Customer,
  CustomerInput,
  CustomerQuery,
  CrmSettings,
  SettingsRecord,
} from "../domain/customer";
import type {
  CommunicationDraft,
  CommunicationInput,
} from "../domain/communication";
export const CRM = Symbol("CRM");
export interface CrmRepository {
  lockRecipient(storeId: string, id: string): Promise<boolean>;
  recordOrder(metric: OrderMetric): Promise<void>;
  refreshCustomer(storeId: string, email: string): Promise<void>;
  recordCart(storeId: string, metric: CartMetricInput): Promise<void>;
  clearCart(storeId: string, hash: string): Promise<void>;
  abandonedCandidate(): Promise<{
    customer: Customer;
    settings: CrmSettings;
  } | null>;
  markReminder(storeId: string, id: string, updatedAt: Date): Promise<boolean>;
  recipientAfter(
    storeId: string,
    segment: CommunicationInput["segment"],
    afterId: string,
    before: Date,
  ): Promise<Customer[]>;
  customer(storeId: string, id: string): Promise<Customer | null>;
  byEmail(storeId: string, email: string): Promise<Customer | null>;
  optOut(storeId: string, id: string, enabled: boolean): Promise<void>;
  recipientPage(
    storeId: string,
    segment: CommunicationInput["segment"],
    page: number,
  ): Promise<Customer[]>;
  draftById(storeId: string, id: string): Promise<CommunicationDraft | null>;
  list(
    storeId: string,
    query: CustomerQuery,
  ): Promise<{ items: Customer[]; total: number; page: number; pages: number }>;
  recipients(
    storeId: string,
    segment: CommunicationInput["segment"],
  ): Promise<{ items: Customer[]; total: number }>;
  communications(
    storeId: string,
    kind: CommunicationInput["kind"],
    page: number,
    limit: number,
  ): Promise<{
    items: CommunicationDraft[];
    total: number;
    page: number;
    pages: number;
  }>;
  communicationByRequest(
    storeId: string,
    requestId: string,
  ): Promise<CommunicationDraft | null>;
  createCommunication(
    draft: CommunicationDraft,
  ): Promise<"created" | "duplicate">;
  updateCommunication(
    storeId: string,
    id: string,
    version: number,
    input: CommunicationInput,
  ): Promise<CommunicationDraft | null>;
  create(customer: Customer): Promise<void>;
  update(
    storeId: string,
    id: string,
    version: number,
    input: CustomerInput,
  ): Promise<Customer | null>;
  settings(storeId: string): Promise<SettingsRecord | null>;
  saveSettings(
    storeId: string,
    version: number,
    settings: CrmSettings,
  ): Promise<SettingsRecord | null>;
}
