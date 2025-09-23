import { Controller, Post } from '@nestjs/common';
import { ContentfulService } from './contentful.service';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('contentful')
@Controller('contentful')
export class ContentfulController {
  constructor(private readonly service: ContentfulService) {}

  @Post()
  @ApiOperation({ summary: 'Ejecuta sincronización completa con Contentful' })
  @ApiOkResponse({ description: 'Sincronización ejecutada' })
  run() {
    return this.service.syncAll();
  }
}
