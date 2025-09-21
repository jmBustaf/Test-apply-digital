import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, ContentfulClientApi } from 'contentful';

export const CONTENTFUL_CLIENT = 'CONTENTFUL_CLIENT';
type CFClient = ContentfulClientApi<undefined>;

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CONTENTFUL_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): CFClient => {
        const space = config.getOrThrow<string>('CONTENTFUL_SPACE_ID');
        const accessToken =
          config.get<string>('CONTENTFUL_DELIVERY_TOKEN') ??
          config.getOrThrow<string>('CONTENTFUL_ACCESS_TOKEN');
        const environment = config.get<string>('CONTENTFUL_ENVIRONMENT') ?? 'master';

        return createClient({ space, accessToken, environment });
      },
    },
  ],
  exports: [CONTENTFUL_CLIENT],
})
export class ContentfulModule {}
