import * as Joi from 'joi';

export const iamEnvValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  IAM_REST_PORT: Joi.number().default(3001),
  IAM_GRPC_PORT: Joi.number().default(5001),
  IAM_JWT_SECRET: Joi.string().required(),
  IAM_JWT_EXPIRES_IN: Joi.number().default(3600),
  DATABASE_URL_IAM: Joi.string().required(),
  IAM_GRPC_HOST: Joi.string().default('localhost'),
  NOTIFY_GRPC_PORT: Joi.number().default(5002),
});
