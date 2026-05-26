import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations',
  },
  ...(process.env.DATABASE_URL_IAM ? { datasource: { url: process.env.DATABASE_URL_IAM } } : {}),
});
