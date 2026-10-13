import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  ACCOUNTS,
  type AccountsRepository,
  type Address,
} from "./accounts.repository";
import { StoresService } from "../../stores/application/stores.service";
import { UsersService } from "../../users/application/users.service";
import {
  TRANSACTIONS,
  type TransactionRunner,
} from "../../../shared/transactions";
import { conflict, notFound } from "../../../shared/errors";
@Injectable()
export class AccountsService {
  constructor(
    @Inject(ACCOUNTS) private readonly repository: AccountsRepository,
    private readonly stores: StoresService,
    private readonly users: UsersService,
    @Inject(TRANSACTIONS) private readonly tx: TransactionRunner,
  ) {}
  async createStore(userId: string, requestId: string, name: string) {
    return this.tx.run(async () => {
      await this.users.lock(userId);
      const old = await this.repository.creation(requestId);
      if (old) {
        if (old.userId !== userId || old.name !== name) throw conflict();
        return this.stores.profile(await this.stores.byId(old.storeId));
      }
      if ((await this.stores.ownedBy(userId)).length >= 5)
        throw conflict("Hesap başına beş mağaza sınırı aşıldı.");
      const store = await this.stores.createOwned(userId, name);
      await this.repository.createStoreRequest({
        id: requestId,
        userId,
        name,
        storeId: store.id,
      });
      return this.stores.profile(store);
    });
  }
  async addresses(userId: string) {
    return (await this.repository.addresses(userId)).map(
      ({ userId: _owner, ...address }) => address,
    );
  }
  async saveAddress(
    userId: string,
    input: Omit<Address, "id" | "userId" | "version" | "createdAt">,
    id?: string,
    version?: number,
  ) {
    return this.tx.run(async () => {
      await this.users.lock(userId);
      const current = id ? await this.repository.address(userId, id) : null;
      if (id && !current) throw notFound();
      if (current && current.version !== version) throw conflict();
      if (!id && (await this.repository.addresses(userId)).length >= 25)
        throw conflict("En fazla 25 adres kaydedilebilir.");
      if (input.isDefault) await this.repository.clearDefault(userId);
      const next = {
        ...input,
        id: id ?? randomUUID(),
        userId,
        version: current?.version ?? 0,
        createdAt: current?.createdAt ?? new Date(),
      };
      if (id) {
        const expectedVersion =
          current!.version + (current!.isDefault && input.isDefault ? 1 : 0);
        const saved = await this.repository.saveAddress(next, expectedVersion);
        if (!saved) throw conflict();
        return saved;
      }
      await this.repository.createAddress(next);
      return next;
    });
  }
  async removeAddress(userId: string, id: string, version: number) {
    return this.tx.run(async () => {
      await this.users.lock(userId);
      if (!(await this.repository.deleteAddress(userId, id, version)))
        throw conflict();
      return { removed: true };
    });
  }
}
