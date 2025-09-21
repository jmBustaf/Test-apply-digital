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

  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

export const envValidationSchema = Joi.object<EnvVars>({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().port().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().min(1).required(),
  DB_NAME: Joi.string().required(),

  JWT_SECRET: Joi.string(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
});
