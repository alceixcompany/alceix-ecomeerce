import { CONFIG, type AppConfig } from "../../../config/config";
import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common";
import { CommerceService } from "../application/commerce.service";
@Injectable()
export class CommerceWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running?: Promise<void>;
  private readonly logger = new Logger(CommerceWorker.name);
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly commerce: CommerceService,
  ) {}
  onModuleInit() {
    if (!this.config.workersEnabled) return;
    this.timer = setInterval(() => {
      if (!this.running)
        this.running = this.commerce
          .reconcile()
          .then(() => this.commerce.reconcileProviderResults())
          .catch(() =>
            this.logger.error("Commerce reconciliation failed; will retry."),
          )
          .finally(() => {
            this.running = undefined;
          });
    }, 10000);
    this.timer.unref();
  }
  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.running;
  }
}
