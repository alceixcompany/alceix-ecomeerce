import "server-only";
import { redirect, notFound } from "next/navigation";
import { serverApi } from "@/lib/server-http";
import { ApiError } from "@/lib/http";
import { authSchema } from "@/modules/marketing-auth";
import {
  settingsSchema,
  dashboardSchema,
  type AdminStore,
} from "./types/store";
export async function getAdminStore(slug: string): Promise<AdminStore> {
  try {
    const me = await serverApi("/auth/me", authSchema, true);
    const settings = await serverApi(
      `/stores/${encodeURIComponent(slug)}`,
      settingsSchema,
      true,
    );
    return {
      ...settings,
      initials: settings.name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toLocaleUpperCase("tr-TR"),
      storefrontSlug: settings.slug,
      account: me.user,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      redirect(`/giris-yap?next=${encodeURIComponent(`/${slug}/admin`)}`);
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
export function getDashboard(slug: string) {
  return serverApi(
    `/stores/${encodeURIComponent(slug)}/dashboard`,
    dashboardSchema,
    true,
  );
}
