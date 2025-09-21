import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ContentfulSyncService } from '../contentful/contentful.sync.service';

@Injectable()
export class ScheduleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScheduleService.name);
  private running = false;
  private jobName: string;
  private intervalMs: number;

  constructor(
    private readonly scheduler: SchedulerRegistry,
    private readonly sync: ContentfulSyncService,
    private readonly config: ConfigService,
  ) {
    this.jobName = this.config.get<string>('SYNC_JOB_NAME', 'contentful-hourly-sync');
    this.intervalMs = this.config.get<number>('SYNC_INTERVAL_MS', 60 * 60 * 1000);
  }

  async onModuleInit() {
    await this.runOnceSafely();

    const interval = setInterval(() => {
      void this.runOnceSafely();
    }, this.intervalMs);

    this.scheduler.addInterval(this.jobName, interval);
    this.logger.log(`Scheduled ${this.jobName} every ${this.intervalMs / 1000}s from now.`);
  }

  onModuleDestroy() {
    if (this.scheduler.doesExist('interval', this.jobName)) {
      this.scheduler.deleteInterval(this.jobName);
      this.logger.log(`Cleared interval ${this.jobName} on shutdown.`);
    }
  }

  private async runOnceSafely(): Promise<void> {
    if (this.running) {
      this.logger.warn('Skip: sync already running.');
      return;
    }
    this.running = true;
    try {
      const res = await this.sync.syncAll();
      this.logger.log(
        `Sync OK -> total=${res.total}, upserts=${res.upserts}, softDeleted=${res.softDeleted}`,
      );
    } catch (err) {
      this.logger.error('Sync failed', err as Error);
    } finally {
      this.running = false;
    }
  }
}
