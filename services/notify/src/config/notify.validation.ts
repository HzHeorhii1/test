import * as Joi from 'joi';

export const notifyEnvValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  NOTIFY_REST_PORT: Joi.number().default(3002),
  NOTIFY_GRPC_PORT: Joi.number().default(5002),
  DATABASE_URL_NOTIFY: Joi.string().required(),
  IAM_GRPC_HOST: Joi.string().default('localhost'),
  IAM_GRPC_PORT_INTERNAL: Joi.number().default(5001),
  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().default(1025),
  SMTP_FROM: Joi.string().default('noreply@spherax.local'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
});
