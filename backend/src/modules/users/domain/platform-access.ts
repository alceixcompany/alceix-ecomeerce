export const platformPages = [
  "overview",
  "members",
  "sales",
  "works",
  "messages",
  "audit",
  "team",
  "smtp",
  "sms",
  "email",
  "support",
  "live",
  "finance",
  "reviews",
  "referrals",
] as const;
export type PlatformPage = (typeof platformPages)[number];
export type PlatformStaff = {
  role: "operations" | "support" | "finance" | "marketing" | "custom";
  pages: PlatformPage[];
  write: boolean;
  status: "active" | "paused";
  version: number;
};
export type AccountControl = {
  status: "active" | "review" | "paused";
  verified: boolean;
  note: string;
  version: number;
};
export function platformAccess(user: {
  platformAdmin?: boolean;
  platformStaff?: PlatformStaff;
}) {
  if (user.platformAdmin)
    return { role: "owner" as const, pages: [...platformPages], write: true };
  return user.platformStaff?.status === "active"
    ? {
        role: user.platformStaff.role,
        pages: user.platformStaff.pages,
        write: user.platformStaff.write,
      }
    : null;
}
