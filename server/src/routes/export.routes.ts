import { Router, Request, Response } from 'express';
import { Movement } from '../models/Movement';
import { Part } from '../models/Part';

const router = Router();

router.get('/export.csv', async (req: Request, res: Response) => {
  const scope = req.query.scope as string;

  if (scope === 'parts') {
    const parts = await Part.find({});
    const csv = ['partId,name,category,unit,inStock,minStock,unitCost,supplier'].join(',') + '\n';
    const rows = parts.map(
      (p) =>
        `"${p.partId}","${p.name}","${p.category || ''}","${p.unit}",${p.inStock},${p.minStock},${p.unitCost || ''},"${p.supplier || ''}"`
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=parts.csv');
    res.send(csv + rows.join('\n'));
  } else if (scope === 'movements') {
    const movements = await Movement.find({}).limit(1000).sort({ createdAt: -1 });
    const csv = ['id,partId,type,quantity,unitCost,at'].join(',') + '\n';
    const rows = movements.map(
      (m) =>
        `"${m._id}","${m.partId}","${m.type}",${m.quantity},${m.unitCost || ''},"${m.createdAt.toISOString()}"`
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=movements.csv');
    res.send(csv + rows.join('\n'));
  } else {
    res.status(400).json({ message: 'Invalid scope. Use parts or movements' });
  }
});

router.get('/export.json', async (req: Request, res: Response) => {
  const scope = req.query.scope as string;

  if (scope === 'parts') {
    const parts = await Part.find({});
    res.json(parts);
  } else if (scope === 'movements') {
    const movements = await Movement.find({}).limit(1000).sort({ createdAt: -1 });
    res.json(movements);
  } else {
    res.status(400).json({ message: 'Invalid scope. Use parts or movements' });
  }
});

export default router;

