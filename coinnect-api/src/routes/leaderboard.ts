import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, totalInvested: true },
    orderBy: { totalInvested: 'desc' },
    take: 20,
  });
  res.json(users);
});

export default router;
