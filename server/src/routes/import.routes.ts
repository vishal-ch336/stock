import { Router, Request, Response } from 'express';

const router = Router();

router.post('/import', async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Import not yet implemented' });
});

export default router;

