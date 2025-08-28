import { CorsOptions } from 'cors';

import env from '../../env';

const corsOptions: CorsOptions = {
  origin: env.CORS_WHITELIST.split(','),
  credentials: true,
};

export default corsOptions;
