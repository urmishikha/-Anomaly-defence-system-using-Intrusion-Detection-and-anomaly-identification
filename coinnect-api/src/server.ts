import dotenv from 'dotenv';
import { pino } from 'pino';
import { createApp } from './app';

dotenv.config();

const app = createApp();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => {
  logger.info({ port }, 'coinnect-api listening');
});
