import { Inject, Injectable } from "@nestjs/common";
import { CouponsService } from "../../coupons/application/coupons.service";
import { UsersService } from "../../users/application/users.service";
import { CONFIG, type AppConfig } from "../../../config/config";
import { randomUUID } from "node:crypto";
import { ORDERS, type OrdersRepository } from "./orders.repository";
import { CatalogService } from "../../catalog/application/catalog.service";
import { StoresService } from "../../stores/application/stores.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
import type { OrderInput, Order, OrderQuery } from "../domain/order";
import { orderView, buyerOrderView } from "../domain/order";
@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS) private readonly repository: OrdersRepository,
    private readonly catalog: CatalogService,
    private readonly stores: StoresService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
    private readonly users: UsersService,
    private readonly coupons: CouponsService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}
  private same(previous: Order, input: OrderInput, buyerId: string) {
    if (
      previous.buyerId !== buyerId ||
      JSON.stringify(previous.initialInput) !== JSON.stringify(input)
    )
      throw conflict("İstek kimliği farklı sipariş için kullanılmış.");
    return buyerId ? buyerOrderView(previous) : orderView(previous);
  }
  async create(
    storeId: string,
    actorId: string,
    requestId: string,
    input: OrderInput,
    buyer = false,
  ) {
    const normalized: OrderInput = {
      ...input,
      lines: [...input.lines].sort(
        (a, b) =>
          a.productId.localeCompare(b.productId) ||
          a.variant.localeCompare(b.variant),
      ),
    };
    try {
      return await this.tx.run(async () => {
        const previous = await this.repository.byRequest(
          storeId,
          actorId,
          requestId,
        );
        if (previous)
          return this.same(previous, normalized, buyer ? actorId : "");
        if (buyer) {
          await this.users.lock(actorId);
          if (
            (await this.repository.held(storeId, actorId)) >=
            this.config.maxReservations
          )
            throw conflict("Aktif rezervasyon sınırı aşıldı.");
        }
        const store = await this.stores.byId(storeId);
        if (!store.isOpen || store.mode !== "normal" || store.platformSuspended)
          throw conflict("Mağaza satışa açık değil.");
        const items: Order["items"] = [];
        for (const line of normalized.lines) {
          const product = await this.catalog.reserve(
            storeId,
            line.productId,
            line.quantity,
            line.variant,
          );
          const option = product.options?.find(
            (o) => o.id === line.variant || o.name === line.variant,
          );
          if (
            product.options?.length
              ? !option
              : product.variants.length
                ? !product.variants.includes(line.variant)
                : !!line.variant
          )
            throw conflict("Ürün varyantı geçersiz.");
          if (!product.priceCents || !product.images.length)
            throw conflict("Ürün satışa uygun değil.");
          items.push({
            productId: product.id,
            name: product.name,
            sku: option?.sku ?? product.sku,
            variant: option?.name ?? line.variant,
            variantId: option?.id,
            image: product.images[0],
            quantity: line.quantity,
            unitCents: option?.priceCents ?? product.priceCents,
          });
        }
        const totalCents = items.reduce(
          (total, item) => total + item.quantity * item.unitCents,
          0,
        );
        if (!Number.isSafeInteger(totalCents) || totalCents > 9999999999)
          throw conflict("Sipariş tutarı sınırı aşıldı.");
        const now = new Date();
        const { lines: _lines, ...contact } = normalized;
        const order: Order = {
          ...contact,
          id: randomUUID(),
          storeId,
          buyerId: buyer ? actorId : "",
          createdBy: actorId,
          requestId,
          initialInput: normalized,
          version: 0,
          createdAt: now,
          expiresAt: new Date(now.getTime() + 30 * 60000),
          items,
          totalCents,
          currency: "TRY",
          discountCents: 0,
          shippingCents: 0,
          internalNote: "",
          tracking: "",
          payment: "pending",
          shipment: "preparing",
          reservation: "held",
          cancellationReason: "",
        };
        await this.repository.create(order);
        return buyer ? buyerOrderView(order) : orderView(order);
      });
    } catch (error) {
      const previous = await this.repository.byRequest(
        storeId,
        actorId,
        requestId,
      );
      if (previous)
        return this.same(previous, normalized, buyer ? actorId : "");
      throw error;
    }
  }
  summary(storeId: string) {
    return this.repository.summary(storeId);
  }
  async list(storeId: string, query: OrderQuery, buyerId?: string) {
    const result = await this.repository.list(storeId, query, buyerId);
    return {
      ...result,
      limit: query.limit,
      items: result.items.map(buyerId ? buyerOrderView : orderView),
    };
  }
  async get(storeId: string, id: string, buyerId?: string) {
    const order = await this.repository.find(storeId, id);
    if (!order || (buyerId && order.buyerId !== buyerId)) throw notFound();
    return order;
  }
  async edit(
    storeId: string,
    id: string,
    version: number,
    input: { address: string; city: string; internalNote: string },
  ) {
    return this.tx.run(async () => {
      const order = await this.get(storeId, id);
      if (
        order.version !== version ||
        order.shipment !== "preparing" ||
        order.checkoutLocked ||
        order.payment !== "pending" ||
        order.expiresAt.getTime() <= Date.now()
      )
        throw conflict();
      const saved = await this.repository.save({ ...order, ...input }, version);
      if (!saved) throw conflict();
      return orderView(saved);
    });
  }
  async cancel(
    storeId: string,
    id: string,
    version: number,
    reason: "merchant" | "buyer" | "expired" | "payment-failed",
    buyerId?: string,
  ) {
    return this.tx.run(async () => {
      const order = await this.get(storeId, id, buyerId);
      if (order.reservation === "released")
        return buyerId ? buyerOrderView(order) : orderView(order);
      if (
        order.version !== version ||
        order.payment !== "pending" ||
        order.shipment !== "preparing"
      )
        throw conflict();
      if (reason === "expired" && order.expiresAt.getTime() > Date.now())
        throw conflict();
      for (const item of order.items)
        await this.catalog.release(
          storeId,
          item.productId,
          item.quantity,
          item.variantId ?? item.variant,
        );
      await this.coupons.release(order.id);
      const saved = await this.repository.save(
        {
          ...order,
          shipment: "cancelled",
          reservation: "released",
          cancellationReason: reason,
        },
        version,
      );
      if (!saved) throw conflict();
      return buyerId ? buyerOrderView(saved) : orderView(saved);
    });
  }
  async expireReservations() {
    const orders = await this.repository.expired(new Date(), 100);
    let released = 0;
    for (const order of orders) {
      try {
        await this.cancel(order.storeId, order.id, order.version, "expired");
        released++;
      } catch (error) {
        if (!(
          error instanceof Error &&
          "status" in error &&
          error.status === 409
        ))
          throw error;
      }
    }
    return { released };
  }
  async save(order: Order, version: number) {
    const saved = await this.repository.save(order, version);
    if (!saved) throw conflict();
    return saved;
  }
  async price(
    storeId: string,
    id: string,
    version: number,
    input: {
      shippingCents: number;
      discountCents: number;
      commissionBasisPoints: number;
      returnDays: number;
      pricingVersion: number;
    },
  ) {
    return this.tx.run(async () => {
      const order = await this.get(storeId, id);
      if (
        order.version !== version ||
        order.payment !== "pending" ||
        order.reservation !== "held" ||
        order.expiresAt.getTime() <= Date.now()
      )
        throw conflict();
      const totalCents =
        order.items.reduce(
          (sum, item) => sum + item.quantity * item.unitCents,
          0,
        ) +
        input.shippingCents -
        input.discountCents;
      if (
        !Number.isSafeInteger(totalCents) ||
        totalCents < 1 ||
        totalCents > 9999999999
      )
        throw conflict("Sipariş tutarı sınırı aşıldı.");
      return this.save(
        {
          ...order,
          ...input,
          totalCents,
          pricingComplete: true,
          financialState: "pending",
        },
        version,
      );
    });
  }
  async capture(storeId: string, id: string, amount: number) {
    return this.tx.run(async () => {
      const order = await this.get(storeId, id);
      if (order.totalCents !== amount || !order.pricingComplete)
        throw conflict("Ödeme tutarı veya fiyatlandırma eşleşmiyor.");
      if (order.payment === "paid") return { order, accepted: true };
      if (order.payment !== "pending") throw conflict();
      if (
        order.reservation !== "held" ||
        order.expiresAt.getTime() <= Date.now()
      ) {
        if (order.reservation === "held")
          await this.cancel(storeId, id, order.version, "expired");
        return { order: await this.get(storeId, id), accepted: false };
      }
      for (const item of order.items)
        await this.catalog.consume(
          storeId,
          item.productId,
          item.quantity,
          item.variantId ?? item.variant,
        );
      await this.coupons.consume(order.id);
      const saved = await this.save(
        {
          ...order,
          payment: "paid",
          paidAt: new Date(),
          reservation: "consumed",
          financialState: "pending",
        },
        order.version,
      );
      return { order: saved, accepted: true };
    });
  }
  async shipped(
    storeId: string,
    id: string,
    tracking: string,
    carrier: string,
  ) {
    const order = await this.get(storeId, id);
    if (order.payment !== "paid" || order.shipment !== "preparing")
      throw conflict();
    return this.save(
      { ...order, shipment: "shipped", tracking, carrier },
      order.version,
    );
  }
  async delivered(storeId: string, id: string) {
    const order = await this.get(storeId, id);
    if (order.payment !== "paid" || order.shipment !== "shipped")
      throw conflict();
    const now = new Date();
    return this.save(
      {
        ...order,
        shipment: "delivered",
        deliveredAt: now,
        settleAt: new Date(now.getTime() + (order.returnDays ?? 0) * 86400000),
      },
      order.version,
    );
  }
  async refund(storeId: string, id: string, restock: boolean) {
    const order = await this.get(storeId, id);
    if (order.payment !== "paid") throw conflict();
    if (restock)
      for (const item of order.items)
        await this.catalog.restock(
          storeId,
          item.productId,
          item.quantity,
          item.variantId ?? item.variant,
        );
    await this.coupons.release(order.id, true);
    return this.save(
      {
        ...order,
        payment: "refunded",
        shipment: "cancelled",
        financialState: "refunded",
      },
      order.version,
    );
  }
  settledReady() {
    return this.repository.settledReady(new Date());
  }
  async dailySales(storeId: string | undefined, days: number) {
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    end.setUTCDate(end.getUTCDate() + 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days);
    const rows = await this.repository.dailySales(storeId, start, end),
      byDate = new Map(rows.map((row) => [row.date, row]));
    const items = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + i);
      const key = date.toISOString().slice(0, 10);
      items.push(
        byDate.get(key) ?? {
          date: key,
          orders: 0,
          grossCents: 0,
          refundedCents: 0,
          netCents: 0,
        },
      );
    }
    return {
      currency: "TRY",
      timezone: "UTC",
      timestampSource: "application-payment-confirmation",
      legacyTimestampPolicy: "excluded",
      items,
    };
  }
  sales(storeId?: string) {
    return this.repository.sales(storeId);
  }
  async platformList(query: OrderQuery) {
    const result = await this.repository.list(undefined, query);
    return {
      ...result,
      items: result.items.map((order) => ({
        ...orderView(order),
        storeId: order.storeId,
      })),
    };
  }
}
