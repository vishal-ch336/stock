import { z } from 'zod';
import { unitSchema } from './common.schema';

export const createPartSchema = z.object({
  partId: z.string().min(1).trim(),
  name: z.string().min(1).trim(),
  category: z.string().trim().optional(),
  location: z.string().trim().optional(),
  unit: unitSchema,
  minStock: z.number().int().nonnegative().default(0),
  unitCost: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  supplier: z.string().trim().optional(),
  wattpics: z.number().nonnegative().optional(),
  powerUnit: z.enum(['wp', 'kw']).optional().default('wp'),
});

export const updatePartSchema = createPartSchema.partial().omit({ partId: true });

export const partResponseSchema = createPartSchema
  .extend({
    inStock: z.number().int().nonnegative(),
    available: z.number().int().nonnegative(),
    status: z.enum(['Out', 'Low', 'OK']),
    lastMovement: z.string().optional(),
  })
  .extend({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .transform((data) => ({
    ...data,
    lastMovement: data.lastMovement,
  }));

export type CreatePartDto = z.infer<typeof createPartSchema>;
export type UpdatePartDto = z.infer<typeof updatePartSchema>;
export type PartResponseDto = z.infer<typeof partResponseSchema>;

