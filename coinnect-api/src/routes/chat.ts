import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const messageSchema = z.object({
  message: z.string().min(1),
});

router.post('/', async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { message } = parsed.data;
  // Simple rule-based responses for now
  let reply = "I can help explain investing basics. Ask about SIPs, ETFs, or budgeting.";
  if (/round.?up/i.test(message)) reply = "Round-up invests spare change from each transaction automatically.";
  if (/goal/i.test(message)) reply = "Create savings goals and track progress with auto-investments.";
  if (/(ETF|index)/i.test(message)) reply = "ETFs are baskets of assets tracking an index; great for diversification.";
  res.json({ reply });
});

export default router;
