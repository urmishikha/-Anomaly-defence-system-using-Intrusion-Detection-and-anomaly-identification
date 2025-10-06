import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ id: user.id, email: user.email, name: user.name, balance: user.balance, totalInvested: user.totalInvested });
});

export default router;
