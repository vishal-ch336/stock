import { Router, Request, Response } from 'express';
import { Movement } from '../models/Movement';
import { Part } from '../models/Part';
import { inventoryService } from '../services/inventory.service';
import { validate } from '../middleware/validate';
import { createMovementSchema, updateMovementSchema } from '../schemas/movement.schema';
import { z } from 'zod';
import { movementsQuerySchema } from '../schemas/common.schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const query = movementsQuerySchema.parse(req.query);

  const filter: any = {};

  if (query.partId) {
    filter.partId = query.partId;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }

  const movements = await Movement.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);

  const enriched = await Promise.all(
    movements.map(async (m) => {
      const part = await Part.findOne({ partId: m.partId });
      const movementObj = m.toObject();
      return {
        ...movementObj,
        supplier: movementObj.counterparty, // Map counterparty to supplier for frontend
        partName: part?.name || '',
        timestamp: m.createdAt.toISOString(),
      };
    })
  );

  res.json(enriched);
});

router.post('/', validate(z.object({ body: createMovementSchema })), async (req: Request, res: Response) => {
  const { partId, type, quantity, ...rest } = req.body;

  const result = await inventoryService.processMovement(
    { partId, ...rest },
    type,
    quantity
  );

  const available = Math.max(0, result.partAfter.inStock - (result.partAfter.reserved || 0));
  let status: 'Out' | 'Low' | 'OK' = 'Out';
  if (result.partAfter.inStock > 0) {
    status = result.partAfter.inStock < result.partAfter.minStock ? 'Low' : 'OK';
  }

  const movementObj = result.movement.toObject();
  res.status(201).json({
    movement: {
      ...movementObj,
      supplier: movementObj.counterparty, // Map counterparty to supplier for frontend
      partName: result.partAfter.name,
      timestamp: result.movement.createdAt.toISOString(),
    },
    part: {
      ...result.partAfter.toObject(),
      available,
      status,
      lastMovement: result.partAfter.lastMovementAt?.toISOString(),
    },
  });
});

router.patch('/:id', validate(z.object({ body: updateMovementSchema })), async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Map supplier to counterparty if provided
  if ((updates as any).supplier !== undefined) {
    (updates as any).counterparty = (updates as any).supplier;
    delete (updates as any).supplier;
  }

  const movement = await Movement.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );

  if (!movement) {
    return res.status(404).json({ message: 'Movement not found' });
  }

  const part = await Part.findOne({ partId: movement.partId });
  const movementObj = movement.toObject();
  
  return res.json({
    ...movementObj,
    supplier: movementObj.counterparty, // Map counterparty to supplier for frontend
    partName: part?.name || '',
    timestamp: movement.createdAt.toISOString(),
  });
});

export default router;

