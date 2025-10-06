import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router as apiRouter } from './routes/api';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(helmet());
  app.use(morgan('dev'));

  app.get('/', (_req, res) => {
    res.json({ status: 'ok', name: 'coinnect-api' });
  });
  app.use('/api', apiRouter);
  return app;
}
