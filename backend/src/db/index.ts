import env from '../../env';
import { drizzle as LocalDrizzle } from 'drizzle-orm/node-postgres';
import { drizzle as NeonDrizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

const db =
  env.NODE_ENV === 'production' || env.NODE_ENV === 'preview'
    ? NeonDrizzle(env.POSTGRES_URL!, { schema })
    : LocalDrizzle(env.POSTGRES_URL!, { schema });

export { db };
