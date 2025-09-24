import * as Joi from 'joi';

export type NodeEnv = 'development' | 'production';

export interface EnvVars {
  NODE_ENV: NodeEnv;
  PORT: number;

  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ENVIRONMENT: string;
  CONTENTFUL_DELIVERY_TOKEN: string;
  CONTENTFUL_CONTENT_TYPE: string;

  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  SYNC_JOB_NAME: string;
  SYNC_INTERVAL_MS: number;
}

export const envValidationSchema = Joi.object<EnvVars>({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().port().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().min(1).required(),
  DB_NAME: Joi.string().required(),

  CONTENTFUL_SPACE_ID: Joi.string().required(),
  CONTENTFUL_ENVIRONMENT: Joi.string().default('master'),
  CONTENTFUL_DELIVERY_TOKEN: Joi.string().required(),
  CONTENTFUL_CONTENT_TYPE: Joi.string().required(),

  JWT_SECRET: Joi.string(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),

  SYNC_JOB_NAME: Joi.string().default('contentful-hourly-sync'),
  SYNC_INTERVAL_MS: Joi.number()
    .positive()
    .default(60 * 60 * 1000),
});
