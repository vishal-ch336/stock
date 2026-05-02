import { Router, Request, Response } from 'express';
import { Movement } from '../models/Movement';
import { Part } from '../models/Part';
import { AppError } from '../middleware/error';
import { validate } from '../middleware/validate';
import { requireAuth, requireManager } from '../middleware/auth';
import { createPartSchema, updatePartSchema } from '../schemas/part.schema';
import { z } from 'zod';
import { partsQuerySchema } from '../schemas/common.schema';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const query = partsQuerySchema.parse(req.query);

  const filter: any = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.status) {
    if (query.status === 'Low') {
      filter.inStock = { $gt: 0, $lt: '$minStock' };
    } else if (query.status === 'Out') {
      filter.inStock = { $lte: 0 };
    }
  }

  const parts = await Part.find(filter);

  const partsWithDerived = parts.map((p) => {
    const available = Math.max(0, p.inStock - (p.reserved || 0));
    let status: 'Out' | 'Low' | 'OK' = 'Out';
    if (p.inStock > 0) {
      status = p.inStock < p.minStock ? 'Low' : 'OK';
    }

    return {
      ...p.toObject(),
      available,
      status,
      lastMovement: p.lastMovementAt?.toISOString(),
    };
  });

  res.json(partsWithDerived);
});

router.get('/:partId', requireAuth, async (req: Request, res: Response) => {
  const part = await Part.findOne({ partId: req.params.partId });
  if (!part) {
    throw new AppError('Part not found', 404);
  }

  const available = Math.max(0, part.inStock - (part.reserved || 0));
  let status: 'Out' | 'Low' | 'OK' = 'Out';
  if (part.inStock > 0) {
    status = part.inStock < part.minStock ? 'Low' : 'OK';
  }

  res.json({
    ...part.toObject(),
    available,
    status,
    lastMovement: part.lastMovementAt?.toISOString(),
  });
});

router.post('/', requireManager, validate(z.object({ body: createPartSchema })), async (req: Request, res: Response) => {
  const part = await Part.create({
    ...req.body,
    inStock: 0,
    reserved: 0,
  });

  const available = Math.max(0, part.inStock - (part.reserved || 0));
  const status = part.inStock < part.minStock ? 'Low' : 'OK';

  res.status(201).json({
    ...part.toObject(),
    available,
    status,
    lastMovement: part.lastMovementAt?.toISOString(),
  });
});

router.patch('/:partId', requireManager, validate(z.object({ body: updatePartSchema })), async (req: Request, res: Response) => {
  const part = await Part.findOneAndUpdate(
    { partId: req.params.partId },
    { $set: req.body },
    { new: true }
  );

  if (!part) {
    throw new AppError('Part not found', 404);
  }

  const available = Math.max(0, part.inStock - (part.reserved || 0));
  let status: 'Out' | 'Low' | 'OK' = 'Out';
  if (part.inStock > 0) {
    status = part.inStock < part.minStock ? 'Low' : 'OK';
  }

  res.json({
    ...part.toObject(),
    available,
    status,
    lastMovement: part.lastMovementAt?.toISOString(),
  });
});

router.delete('/:partId', requireManager, async (req: Request, res: Response) => {
  await Movement.deleteMany({ partId: req.params.partId });

  const part = await Part.findOneAndDelete({ partId: req.params.partId });
  if (!part) {
    throw new AppError('Part not found', 404);
  }

  res.status(204).send();
});

export default router;

