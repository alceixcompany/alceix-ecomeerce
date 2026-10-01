import {
  Global,
  Module,
  Inject,
  Injectable,
  OnModuleDestroy,
} from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";
import {
  createConnection,
  type Connection,
  type ClientSession,
} from "mongoose";
import { CONFIG, type AppConfig } from "../config/config";
export const DATABASE = Symbol("DATABASE");
import { TRANSACTIONS, type TransactionRunner } from "../shared/transactions";
@Injectable()
export class MongoTransactions implements TransactionRunner {
  private readonly storage = new AsyncLocalStorage<ClientSession>();
  constructor(@Inject(DATABASE) private readonly db: Connection) {}
  get session() {
    return this.storage.getStore();
  }
  async run<T>(work: () => Promise<T>): Promise<T> {
    if (this.session) return work();
    return this.db.transaction((session) => this.storage.run(session, work));
  }
}
@Injectable()
class ConnectionLifecycle implements OnModuleDestroy {
  constructor(@Inject(DATABASE) private readonly db: Connection) {}
  async onModuleDestroy() {
    await this.db.close();
  }
}
@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      inject: [CONFIG],
      useFactory: async (config: AppConfig) => {
        const connection = await createConnection(config.mongoUri, {
          autoIndex: config.environment !== "production",
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 20,
        }).asPromise();
        const hello = await connection.db!.admin().command({ hello: 1 });
        if (!hello.setName && hello.msg !== "isdbgrid") {
          await connection.close();
          throw new Error(
            "MongoDB replica set is required for atomic registration.",
          );
        }
        return connection;
      },
    },
    MongoTransactions,
    { provide: TRANSACTIONS, useExisting: MongoTransactions },
    ConnectionLifecycle,
  ],
  exports: [DATABASE, TRANSACTIONS, MongoTransactions],
})
export class DatabaseModule {}
