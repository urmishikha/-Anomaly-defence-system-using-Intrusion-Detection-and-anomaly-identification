import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import transactionsRouter from './transactions';
import roundupsRouter from './roundups';
import goalsRouter from './goals';
import leaderboardRouter from './leaderboard';
import chatRouter from './chat';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/transactions', transactionsRouter);
router.use('/roundups', roundupsRouter);
router.use('/goals', goalsRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/chat', chatRouter);

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});
