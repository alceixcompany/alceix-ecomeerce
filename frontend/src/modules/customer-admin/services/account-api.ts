import { z } from "zod";
import { api } from "@/lib/http";
import type { Profile } from "../types/collaboration";
export const profileSchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  city: z.string(),
  bio: z.string(),
  version: z.number().int().nonnegative(),
});
export type AccountProfile = z.infer<typeof profileSchema>;
export const loadProfile = (signal?: AbortSignal) =>
  api("/auth/profile", profileSchema, { signal });
export function saveProfile(profile: Profile, version: number) {
  const { name, phone, city, bio } = profile;
  return api("/auth/profile", profileSchema, {
    method: "PUT",
    body: JSON.stringify({ name, phone, city, bio, version }),
  });
}
