import { z } from "zod";
import { api } from "@/lib/http";
export const designSchema = z.object({
  announcement: z.object({enabled: z.boolean(), text: z.string(), tone: z.enum(["blue", "ink", "cream"])}),
  hero: z.object({title: z.string(), description: z.string(), buttonLabel: z.string(), image: z.string()}),
  accent: z.string().regex(/^#[\da-f]{6}$/i), background: z.enum(["white", "beige"]), font: z.enum(["jakarta", "inter", "serif"]),
  sections: z.array(z.object({id: z.string(), kind: z.enum(["hero", "collections", "products", "testimonials", "instagram", "bento", "video", "faq"]), title: z.string(), description: z.string(), visible: z.boolean(), videoUrl: z.string()})),
});
export type PublishedDesign = z.infer<typeof designSchema>;
export const publishedDesignSchema = z.object({design: designSchema.nullable(), publishedAt: z.iso.datetime().nullable()});
const record = z.object({version: z.number().int(), draft: designSchema.nullable(), published: designSchema.nullable(), updatedAt: z.iso.datetime().nullable(), publishedAt: z.iso.datetime().nullable()});
const path = (slug: string) => `/stores/${encodeURIComponent(slug)}/design`;
export const loadDesign = (slug: string, signal?: AbortSignal) => api(path(slug), record, {signal});
export const saveDesign = (slug: string, version: number, design: PublishedDesign, publish: boolean) => api(`${path(slug)}/${publish ? "publish" : "draft"}`, record, {method: publish ? "POST" : "PUT", body: JSON.stringify({version, design})});
