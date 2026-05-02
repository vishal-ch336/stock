import { Router, Request, Response } from 'express';
import { statsService } from '../services/stats.service';
import { z } from 'zod';

const router = Router();

router.get('/overview', async (req: Request, res: Response) => {
  const stats = await statsService.getOverview();
  res.json(stats);
});

router.get('/top-skus', async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
  const topSkus = await statsService.getTopSkus(limit);
  res.json(topSkus);
});

router.get('/daily-net', async (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string) : 30;
  const dailyNet = await statsService.getDailyNet(days);
  res.json(dailyNet);
});

router.get('/net-worth', async (req: Request, res: Response) => {
  const netWorth = await statsService.getInventoryNetWorth();
  res.json(netWorth);
});

export default router;

