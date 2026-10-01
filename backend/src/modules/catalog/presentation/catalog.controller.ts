import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { CatalogService } from "../application/catalog.service";
import { StoresService } from "../../stores/application/stores.service";
import { SessionGuard } from "../../auth/presentation/session.guard";
import {
  ApiInput,
  parse,
  text,
  idSchema,
  listSchema,
  moneySchema,
} from "../../../shared/validation";
import { notFound } from "../../../shared/errors";
import type { AuthRequest } from "../../../shared/http";
const productSchema = z
  .object({
    name: text(120).min(1),
    category: text(40).min(1),
    description: text(2000),
    sku: text(50).min(1),
    barcode: z.union([z.literal(""), z.string().regex(/^\d{8,14}$/)]),
    priceCents: moneySchema,
    costCents: moneySchema,
    currency: z.literal("TRY").default("TRY"),
    stock: z.number().int().min(0).max(9_999_999),
    variants: z.array(text(40).min(1)).max(30),
    images: z.array(text(200).min(1)).max(6),
    status: z.enum(["live", "draft"]),
    model: z.enum(["own", "supplier"]),
    seoTitle: text(70),
    seoDescription: text(160),
  })
  .strict();
const updateSchema = productSchema.extend({ version: z.number().int().min(0) });
const stockSchema = z
  .object({
    amount: z
      .number()
      .int()
      .min(-9_999_999)
      .max(9_999_999)
      .refine((value) => value !== 0),
  })
  .strict();
const sampleSchema = z
  .object({
    sampleId: z.enum(["cardigan", "serum", "phone-stand", "cardholder"]),
  })
  .strict();
const categorySchema = z.object({ name: text(40).min(1) }).strict();
@ApiTags("catalog")
@UseGuards(SessionGuard)
@Controller("stores/:slug")
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly stores: StoresService,
  ) {}
  private store(slug: string, request: AuthRequest) {
    return this.stores.owned(slug, request.actor!.id);
  }
  @Get("products") async list(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Query() query: unknown,
  ) {
    return this.catalog.list(
      (await this.store(slug, request)).id,
      parse(listSchema, query),
    );
  }
  @Get("products/:id") async product(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() request: AuthRequest,
  ) {
    return this.catalog.product(
      (await this.store(slug, request)).id,
      parse(idSchema, id),
    );
  }
  @Post("products") @ApiInput(productSchema) async create(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.catalog.create(
      (await this.store(slug, request)).id,
      parse(productSchema, body),
    );
  }
  @Put("products/:id") @ApiInput(updateSchema) async update(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() request: AuthRequest,
    @Body() body: unknown,
  ) {
    const { version, ...input } = parse(updateSchema, body);
    return this.catalog.update(
      (await this.store(slug, request)).id,
      parse(idSchema, id),
      input,
      version,
    );
  }
  @Post("products/:id/duplicate") async duplicate(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() request: AuthRequest,
  ) {
    return this.catalog.duplicate(
      (await this.store(slug, request)).id,
      parse(idSchema, id),
    );
  }
  @Post("products/:id/stock") @ApiInput(stockSchema) async stock(
    @Param("slug") slug: string,
    @Param("id") id: string,
    @Req() request: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.catalog.adjustStock(
      (await this.store(slug, request)).id,
      parse(idSchema, id),
      parse(stockSchema, body).amount,
    );
  }
  @Post("sample-products") @ApiInput(sampleSchema) async importSample(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.catalog.importSample(
      (await this.store(slug, request)).id,
      parse(sampleSchema, body).sampleId,
    );
  }
  @Get("categories") async categories(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
  ) {
    return this.catalog.categories((await this.store(slug, request)).id);
  }
  @Post("categories") @ApiInput(categorySchema) async category(
    @Param("slug") slug: string,
    @Req() request: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.catalog.addCategory(
      (await this.store(slug, request)).id,
      parse(categorySchema, body).name,
    );
  }
}
export function publicProduct(product: import("../domain/product").Product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    priceCents: product.priceCents,
    currency: product.currency,
    images: product.images,
    stock: product.stock,
  };
}
@ApiTags("storefront")
@Controller("public/stores/:slug")
export class StorefrontController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly stores: StoresService,
  ) {}
  @Get() async store(@Param("slug") slug: string) {
    const store = await this.stores.publicBySlug(slug);
    return {
      id: store.id,
      slug: store.slug,
      name: store.name,
      bio: store.bio,
      instagram: store.instagram,
      tiktok: store.tiktok,
      whatsapp: store.whatsapp,
      youtube: store.youtube,
      seoTitle: store.seoTitle,
      seoDescription: store.seoDescription,
      bannerImage: store.bannerImage,
      logoImage: store.logoImage,
      faviconImage: store.faviconImage,
      isOpen: store.isOpen,
      mode: store.mode,
      canPurchase: store.isOpen && store.mode === "normal",
    };
  }
  @Get("products") async list(
    @Param("slug") slug: string,
    @Query() query: unknown,
  ) {
    const store = await this.stores.publicBySlug(slug),
      list = await this.catalog.list(store.id, parse(listSchema, query), true);
    return { ...list, items: list.items.map(publicProduct) };
  }
  @Get("products/:id") async product(
    @Param("slug") slug: string,
    @Param("id") id: string,
  ) {
    const store = await this.stores.publicBySlug(slug),
      product = await this.catalog.product(store.id, parse(idSchema, id));
    if (product.status !== "live") throw notFound();
    return publicProduct(product);
  }
}
