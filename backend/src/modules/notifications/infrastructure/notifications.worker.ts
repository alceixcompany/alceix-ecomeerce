import { CONFIG, type AppConfig } from "../../../config/config";
import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common";
import { NotificationsService } from "../application/notifications.service";
@Injectable()
export class NotificationsWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running?: Promise<void>;
  private readonly logger = new Logger(NotificationsWorker.name);
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly notifications: NotificationsService,
  ) {}
  onModuleInit() {
    if (!this.config.workersEnabled) return;
    this.timer = setInterval(() => {
      if (!this.running)
        this.running = this.run()
          .catch(() =>
            this.logger.error("Notification worker failed; will retry."),
          )
          .finally(() => {
            this.running = undefined;
          });
    }, 1000);
    this.timer.unref();
  }
  private async run() {
    await this.notifications.automateOnce();
    await this.notifications.produceOnce();
    await this.notifications.dispatchOnce();
  }
  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.running;
  }
}
