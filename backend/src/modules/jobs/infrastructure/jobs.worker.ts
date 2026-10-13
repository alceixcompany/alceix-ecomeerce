import { CONFIG, type AppConfig } from "../../../config/config";
import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@nestjs/common";
import { JobsService } from "../application/jobs.service";
@Injectable()
export class JobsWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running?: Promise<void>;
  private readonly logger = new Logger(JobsWorker.name);
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    private readonly jobs: JobsService,
  ) {}
  onModuleInit() {
    if (!this.config.workersEnabled) return;
    this.timer = setInterval(() => {
      if (!this.running)
        this.running = this.jobs
          .runOnce()
          .then(() => {})
          .catch(() =>
            this.logger.error("Integration worker failed; retry will resume."),
          )
          .finally(() => {
            this.running = undefined;
          });
    }, 1000);
    this.timer.unref();
  }
  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    await this.running;
  }
}
