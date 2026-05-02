import { z } from 'zod';

export const unitSchema = z.enum(['pcs', 'pair', 'm', 'set', 'roll']);
export const movementTypeSchema = z.enum(['PURCHASE', 'SALE', 'RETURN', 'ADJUST']);
export const partStatusSchema = z.enum(['Out', 'Low', 'OK']);

export const paginationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  pageSize: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

export const partsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

export const movementsQuerySchema = paginationQuerySchema.extend({
  partId: z.string().optional(),
  type: movementTypeSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type Unit = z.infer<typeof unitSchema>;
export type MovementType = z.infer<typeof movementTypeSchema>;
export type PartStatus = z.infer<typeof partStatusSchema>;

