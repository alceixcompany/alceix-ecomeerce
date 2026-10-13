import type { PlatformStaff, AccountControl } from "./platform-access";
export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  phone?: string;
  city?: string;
  bio?: string;
  profileVersion?: number;
  platformAdmin?: boolean;
  platformStaff?: PlatformStaff;
  accountControl?: AccountControl;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  marketing?: { email: boolean; sms: boolean; version: number };
  operationsVersion?: number;
};
export type PublicUser = Pick<User, "id" | "name" | "email">;
export function publicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}
