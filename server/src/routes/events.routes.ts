import { Router, Request, Response } from 'express';
import { streamService } from '../services/stream.service';

const router = Router();

router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = `${Date.now()}-${Math.random()}`;
  streamService.addClient(clientId, res);
  streamService.startHeartbeat(clientId, res);
});

export default router;

