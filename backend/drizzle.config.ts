import env from './env';

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: `./drizzle/migrations/${env.NODE_ENV}`,
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.POSTGRES_URL!,
  },
  tablesFilter: ['*' + env.DATABASE_SCHEMA_SUFFIX],
});
