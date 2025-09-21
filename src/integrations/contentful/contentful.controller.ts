import { Controller, Post } from '@nestjs/common';
import { ContentfulSyncService } from './contentful.sync.service';

@Controller('contentful/sync')
export class ContentfulSyncController {
  constructor(private readonly syncService: ContentfulSyncService) {}

  @Post()
  run() {
    return this.syncService.syncAll();
  }
}
