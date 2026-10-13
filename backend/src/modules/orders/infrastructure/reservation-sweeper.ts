import { CONFIG, type AppConfig } from "../../../config/config";
import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common";
import { OrdersService } from "../application/orders.service";
@Injectable()
export class ReservationSweeper implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running?: Promise<void>;
  private readonly logger = new Logger(ReservationSweeper.name);
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly orders: OrdersService,
  ) {}
  onModuleInit() {
    if (!this.config.workersEnabled) return;
    this.timer = setInterval(() => {
      void this.run();
    }, 60000);
    this.timer.unref();
  }
  private async run() {
    if (this.running) return;
    this.running = this.orders
      .expireReservations()
      .then(() => {})
      .catch(() => {
        this.logger.error("Reservation cleanup failed; next run will retry.");
      });
    try {
      await this.running;
    } finally {
      this.running = undefined;
    }
  }
  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.running;
  }
}
