export type GatewayRequests = {
  "events.pull": { referenceId: string };
  "identity.phone-start": { referenceId: string; phone: string };
  "identity.phone-verify": {
    referenceId: string;
    challengeReference: string;
    phone: string;
    code: string;
  };
  "invoice.create": {
    referenceId: string;
    orderId: string;
    amountCents: number;
    currency: "TRY";
    seller: {
      legalName: string;
      taxNumber: string;
      taxOffice: string;
      address: string;
      vatBasisPoints: number;
    };
    sellerVersion: number;
    buyer: { name: string; email: string; city: string; address: string };
    lines: {
      name: string;
      sku: string;
      quantity: number;
      grossUnitCents: number;
    }[];
    discountCents: number;
    shippingCents: number;
    pricesIncludeVat: true;
  };
  "invoice.credit": {
    referenceId: string;
    invoiceReference: string;
    amountCents: number;
    currency: "TRY";
  };
  "payment.create": {
    referenceId: string;
    amountCents: number;
    currency: "TRY";
    customerEmail: string;
    returnUrl: string;
  };
  "payment.refund": {
    referenceId: string;
    paymentReference: string;
    amountCents: number;
    currency: "TRY";
  };
  "shipping.quote": {
    referenceId: string;
    shipperScopeId: string;
    city: string;
    address: string;
    items: { quantity: number; sku: string }[];
  };
  "shipping.create": {
    referenceId: string;
    shipperScopeId: string;
    orderId: string;
    carrier: string;
    city: string;
    address: string;
    customer: string;
    phone: string;
    items: { quantity: number; sku: string }[];
  };
  "payout.create": {
    referenceId: string;
    amountCents: number;
    currency: "TRY";
    bankReference: string;
  };
  "identity.onboard": {
    referenceId: string;
    actorId: string;
    scopeId: string;
    name: string;
    email: string;
    returnUrl: string;
  };
  "identity.verify": {
    referenceId: string;
    actorId: string;
    scopeId: string;
    owner: string;
    iban: string;
  };
  "shipping.cancel": { referenceId: string };
  "ai.cancel": { referenceId: string };
  "payout.cancel": { referenceId: string };
  "ai.generate": {
    referenceId: string;
    sourceUrl: string;
    prompt: string;
    mode: "model" | "scene" | "upscale";
    ratio: string;
  };
  "notification.send": {
    referenceId: string;
    channel: "email" | "sms" | "whatsapp";
    recipient: string;
    subject: string;
    message: string;
    unsubscribeUrl: string;
  };
};
export type GatewayResults = {
  "events.pull": {
    events: { payload: string; timestamp: string; signature: string }[];
  };
  "identity.phone-start": { providerReference: string; expiresAt: string };
  "identity.phone-verify": { verified: boolean };
  "invoice.create": { providerReference: string };
  "invoice.credit": { providerReference: string };
  "payment.create": { providerReference: string; checkoutUrl: string };
  "payment.refund": { providerReference: string };
  "shipping.quote": { carrier: string; amountCents: number; expiresAt: string };
  "shipping.create": {
    providerReference: string;
    tracking: string;
    labelUrl: string;
  };
  "payout.create": { providerReference: string };
  "identity.onboard": { providerReference: string; verificationUrl: string };
  "identity.verify": {
    bankReference: string;
    verified: boolean;
    actorId: string;
    scopeId: string;
    holderName: string;
  };
  "shipping.cancel": { cancelled: boolean };
  "ai.cancel": { cancelled: boolean };
  "payout.cancel": { cancelled: boolean };
  "ai.generate": { providerReference: string };
  "notification.send": { providerReference: string };
};
export type GatewayOperation = keyof GatewayRequests;
export const GATEWAY = Symbol("GATEWAY");
export interface GatewayPort {
  configured(): boolean;
  image(referenceId: string, index: number): Promise<Buffer>;
  request<K extends GatewayOperation>(
    operation: K,
    input: GatewayRequests[K],
    key: string,
  ): Promise<GatewayResults[K]>;
}
