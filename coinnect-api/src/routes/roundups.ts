import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

function calculateRoundup(amount: number) {
  const ceil = Math.ceil(amount);
  const roundup = ceil - amount;
  return roundup === 0 ? 1 : Number(roundup.toFixed(2));
}

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const txs = await prisma.transaction.findMany({ where: { userId: req.userId! } });
  const totalRoundup = txs.reduce((sum, t) => sum + calculateRoundup(Math.abs(t.amount)), 0);
  res.json({ totalRoundup: Number(totalRoundup.toFixed(2)) });
});

router.post('/invest', requireAuth, async (req: AuthRequest, res) => {
  const txs = await prisma.transaction.findMany({ where: { userId: req.userId!, invested: false } });
  const totalRoundup = txs.reduce((sum, t) => sum + calculateRoundup(Math.abs(t.amount)), 0);
  const amount = Number(totalRoundup.toFixed(2));
  const investment = await prisma.$transaction(async (tx) => {
    const inv = await tx.investment.create({ data: { userId: req.userId!, amount } });
    await tx.transaction.updateMany({ where: { id: { in: txs.map(t => t.id) } }, data: { invested: true } });
    await tx.user.update({ where: { id: req.userId! }, data: { totalInvested: { increment: amount } } });
    return inv;
  });
  res.json({ investment });
});

export default router;
