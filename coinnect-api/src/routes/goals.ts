import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const router = Router();

const goalSchema = z.object({
  name: z.string(),
  targetAmount: z.number().positive(),
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const goals = await prisma.goal.findMany({ where: { userId: req.userId! } });
  res.json(goals);
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const goal = await prisma.goal.create({ data: { ...parsed.data, userId: req.userId! } });
  res.status(201).json(goal);
});

export default router;
