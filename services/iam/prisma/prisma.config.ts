import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const url = process.env['DATABASE_URL_IAM'];
if (!url) throw new Error('DATABASE_URL_IAM is not set');

export default defineConfig({
  schema: 'schema.prisma',
  migrations: { path: 'migrations' },
  datasource: { url },
});
