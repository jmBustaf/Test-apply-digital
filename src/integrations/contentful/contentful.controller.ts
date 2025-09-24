import { Controller, Post } from '@nestjs/common';
import { ContentfulService } from './contentful.service';

@Controller('contentful')
export class ContentfulController {
  constructor(private readonly service: ContentfulService) {}

  @Post()
  run() {
    return this.service.syncAll();
  }
}
