export type PartnerRole = "operations" | "finance" | "support" | "viewer";
export type PartnerCapability =
  | "read"
  | "catalog-read"
  | "catalog-write"
  | "orders-read"
  | "orders-write"
  | "collaboration-read"
  | "collaboration-write"
  | "settings-write"
  | "studio-write"
  | "finance-read"
  | "support-read"
  | "support-write";
export type PartnerMembership = {
  id: string;
  partnerId: string;
  email: string;
  role: PartnerRole;
  status: "invited" | "active" | "paused";
  userId?: string;
  version: number;
  tokenHash?: string;
  expiresAt?: Date;
  createdAt: Date;
};
export const partnerCapabilities: PartnerCapability[] = [
  "read",
  "catalog-read",
  "catalog-write",
  "orders-read",
  "orders-write",
  "collaboration-read",
  "collaboration-write",
  "settings-write",
  "studio-write",
  "finance-read",
  "support-read",
  "support-write",
];
const read: PartnerCapability[] = [
  "read",
  "catalog-read",
  "orders-read",
  "collaboration-read",
  "support-read",
];
export function partnerRoleAllows(
  role: PartnerRole,
  capability: PartnerCapability,
) {
  const rules: Record<PartnerRole, PartnerCapability[]> = {
    operations: [
      ...read,
      "catalog-write",
      "orders-write",
      "collaboration-write",
      "settings-write",
      "studio-write",
    ],
    finance: ["read", "orders-read", "finance-read"],
    support: [
      "read",
      "orders-read",
      "collaboration-read",
      "collaboration-write",
      "support-read",
      "support-write",
    ],
    viewer: read,
  };
  return rules[role].includes(capability);
}
