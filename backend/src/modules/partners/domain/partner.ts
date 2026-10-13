export type PartnerKind = "supplier" | "influencer";
export type Partner = {
  id: string;
  ownerId: string;
  accountSuspended?: boolean;
  applicationId: string;
  kind: PartnerKind;
  slug: string;
  name: string;
  bio: string;
  city: string;
  category: string;
  logo: string;
  links: { platform: string; url: string }[];
  portfolio: { id: string; title: string; image: string; url: string }[];
  status: "active" | "suspended";
  version: number;
  createdAt: Date;
};
export type PartnerProfile = Pick<
  Partner,
  "name" | "bio" | "city" | "category" | "logo" | "links" | "portfolio"
>;
export type SupplyProduct = {
  id: string;
  partnerId: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  priceCents: number;
  stock: number;
  reservedStock: number;
  minimum: number;
  images: string[];
  active: boolean;
  version: number;
  createdAt: Date;
};
export type SupplyInput = Omit<
  SupplyProduct,
  "id" | "partnerId" | "reservedStock" | "version" | "createdAt"
>;
export function partnerView({
  accountSuspended: _suspended,
  ownerId: _owner,
  applicationId: _application,
  version: _v,
  ...partner
}: Partner) {
  return partner;
}
