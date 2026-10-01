import "server-only";
import { cache } from "react";
import { catalogQuery } from "./utils/catalog-query";
import { serverApi } from "@/lib/server-http";
import { ApiError } from "@/lib/http";
import {
  publicStoreSchema,
  publicListSchema,
  toStoreProduct,
} from "./services/storefront-api";
import type { Store } from "./data/stores";
export const getStore = cache(
  async (slug: string, search = ""): Promise<Store | undefined> => {
    try {
      const { query, invalidRange } = catalogQuery(new URLSearchParams(search));
      const [profile, list] = await Promise.all([
        serverApi(
          `/public/stores/${encodeURIComponent(slug)}`,
          publicStoreSchema,
        ),
        serverApi(
          `/public/stores/${encodeURIComponent(slug)}/products?${query}`,
          publicListSchema,
        ),
      ]);
      const social = [
        {
          platform: "Instagram",
          icon: "photo_camera",
          url: profile.instagram
            ? `https://www.instagram.com/${encodeURIComponent(profile.instagram.replace(/^@/, ""))}`
            : undefined,
        },
        {
          platform: "TikTok",
          icon: "music_note",
          url: profile.tiktok
            ? `https://www.tiktok.com/@${encodeURIComponent(profile.tiktok.replace(/^@/, ""))}`
            : undefined,
        },
        {
          platform: "YouTube",
          icon: "smart_display",
          url: profile.youtube || undefined,
        },
        {
          platform: "WhatsApp",
          icon: "chat",
          url: profile.whatsapp
            ? `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`
            : undefined,
        },
      ];
      return {
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        initials: profile.name
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
          .toLocaleUpperCase("tr-TR"),
        tagline: profile.bio,
        description: profile.bio,
        about: profile.bio,
        socials: social.filter((item) => item.url),
        products: invalidRange ? [] : list.items.map(toStoreProduct),
        catalogPage: list.page,
        catalogPageCount: list.pageCount,
        catalogQuery: query.toString(),
        catalogAll: list.counts.all,
        bannerImage: profile.bannerImage,
        logoImage: profile.logoImage,
        faviconImage: profile.faviconImage,
        seoTitle: profile.seoTitle,
        seoDescription: profile.seoDescription,
        canPurchase: profile.canPurchase,
        catalogTotal: list.total,
        categories: list.categories,
        categoryCounts: list.categoryCounts,
        real: true,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined;
      throw error;
    }
  },
);
