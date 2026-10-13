export type SellerInput = {
  legalName: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  vatBasisPoints: number;
};
export type Seller = SellerInput & { storeId: string; version: number };
export type Invoice = {
  id: string;
  storeId: string;
  orderId: string;
  actorId: string;
  amountCents: number;
  status: "requested" | "issued" | "credited";
  refunded: boolean;
  providerReference: string;
  number: string;
  documentUrl: string;
  creditJobId: string;
  creditDocumentUrl: string;
  version: number;
  createdAt: Date;
};
