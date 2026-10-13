import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common";
import { CONFIG, type AppConfig } from "../../../config/config";
import { MediaService } from "../application/media.service";
@Injectable()
export class MediaCleanupWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running?: Promise<unknown>;
  private readonly logger = new Logger(MediaCleanupWorker.name);
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly service: MediaService,
  ) {}
  onModuleInit() {
    if (!this.config.workersEnabled || !this.config.uploadCleanup.enabled)
      return;
    this.timer = setInterval(() => {
      if (!this.running)
        this.running = this.service
          .cleanup(
            new Date(Date.now() - this.config.uploadCleanup.hours * 3600000),
          )
          .catch(() =>
            this.logger.error("Unclaimed upload cleanup failed; will retry."),
          )
          .finally(() => {
            this.running = undefined;
          });
    }, 60000);
    this.timer.unref();
  }
  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.running;
  }
}
