export type Address = {
  id: string;
  userId: string;
  title: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  isDefault: boolean;
  version: number;
  createdAt: Date;
};
export type StoreCreation = {
  id: string;
  userId: string;
  name: string;
  storeId: string;
};
export const ACCOUNTS = Symbol("ACCOUNTS");
export interface AccountsRepository {
  addresses(userId: string): Promise<Address[]>;
  address(userId: string, id: string): Promise<Address | null>;
  createAddress(address: Address): Promise<void>;
  saveAddress(address: Address, version: number): Promise<Address | null>;
  deleteAddress(userId: string, id: string, version: number): Promise<boolean>;
  clearDefault(userId: string): Promise<void>;
  creation(id: string): Promise<StoreCreation | null>;
  createStoreRequest(creation: StoreCreation): Promise<void>;
}
