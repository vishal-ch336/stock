import { Router, Request, Response } from 'express';
import { uploadHandler } from '../middleware/upload';
import { invoiceExtractService } from '../services/invoice-extract.service';
import { invoiceIngestService } from '../services/invoice-ingest.service';
import { validate } from '../middleware/validate';
import { requireManager } from '../middleware/auth';
import { ingestInvoiceDTOSchema } from '../schemas/invoice.schema';
import { z } from 'zod';
import { AppError } from '../middleware/error';

const router = Router();

router.post('/parse', requireManager, uploadHandler, async (req: Request, res: Response) => {
  const file = (req as any).file;

  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  const parsed = await invoiceExtractService.extractInvoice(file.buffer);

  res.json(parsed);
});

router.post('/ingest', requireManager, validate(z.object({ body: ingestInvoiceDTOSchema })), async (req: Request, res: Response) => {
  const result = await invoiceIngestService.ingestInvoice(req.body);
  res.json(result);
});

export default router;

