import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const router = Router();

const transactionSchema = z.object({
  amount: z.number(),
  description: z.string(),
  category: z.string().optional(),
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const txs = await prisma.transaction.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(txs);
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { amount, description, category } = parsed.data;
  const tx = await prisma.transaction.create({
    data: { userId: req.userId!, amount, description, category: category || 'general' },
  });
  res.status(201).json(tx);
});

export default router;
