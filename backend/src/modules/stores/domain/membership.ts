export type TeamRole = "editor" | "support" | "viewer";
export type StoreCapability =
  | "owner"
  | "read"
  | "catalog-read"
  | "catalog-write"
  | "crm-read"
  | "crm-write"
  | "support-read"
  | "support-write"
  | "settings-write"
  | "orders-read"
  | "orders-write"
  | "collaboration-read"
  | "collaboration-write";
export type Membership = {
  id: string;
  storeId: string;
  email: string;
  role: TeamRole;
  status: "invited" | "active";
  userId?: string;
  version: number;
  tokenHash?: string;
  expiresAt?: Date;
  createdAt: Date;
};
export function roleAllows(role: TeamRole, permission: StoreCapability) {
  const allowed: Record<TeamRole, StoreCapability[]> = {
    editor: [
      "read",
      "catalog-read",
      "catalog-write",
      "settings-write",
      "orders-read",
      "orders-write",
      "collaboration-read",
      "collaboration-write",
    ],
    support: [
      "read",
      "crm-read",
      "crm-write",
      "support-read",
      "support-write",
      "orders-read",
      "collaboration-read",
    ],
    viewer: [
      "read",
      "catalog-read",
      "crm-read",
      "support-read",
      "orders-read",
      "collaboration-read",
    ],
  };
  return allowed[role].includes(permission);
}

export const storeCapabilities: StoreCapability[] = [
  "owner",
  "read",
  "catalog-read",
  "catalog-write",
  "crm-read",
  "crm-write",
  "support-read",
  "support-write",
  "settings-write",
  "orders-read",
  "orders-write",
  "collaboration-read",
  "collaboration-write",
];
