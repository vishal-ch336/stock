import { z } from 'zod';
import { movementTypeSchema } from './common.schema';

export const createMovementSchema = z.object({
  partId: z.string().min(1),
  type: movementTypeSchema,
  quantity: z.number().int(),
  unitCost: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  counterparty: z.string().trim().optional(),
  supplier: z.string().trim().optional(), // Frontend sends 'supplier', map to counterparty
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().nonnegative().optional(),
  totalWithTax: z.number().nonnegative().optional(),
  wattpics: z.number().nonnegative().optional(),
  category: z.string().trim().optional(),
  note: z.string().trim().optional(),
  invoiceNo: z.string().trim().optional(),
  at: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.type === 'SALE' || data.type === 'RETURN') {
      return data.quantity < 0; // SALE and RETURN should be negative
    }
    return data.quantity > 0; // PURCHASE and ADJUST should be positive
  },
  {
    message: "Quantity must be positive for PURCHASE/ADJUST and negative for SALE/RETURN",
    path: ["quantity"],
  }
);

export const movementResponseSchema = z.object({
  id: z.string(),
  partId: z.string().min(1),
  type: movementTypeSchema,
  quantity: z.number().int(),
  unitCost: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  counterparty: z.string().trim().optional(),
  supplier: z.string().trim().optional(), // Map counterparty to supplier for frontend
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().nonnegative().optional(),
  totalWithTax: z.number().nonnegative().optional(),
  wattpics: z.number().nonnegative().optional(),
  category: z.string().trim().optional(),
  note: z.string().trim().optional(),
  invoiceNo: z.string().trim().optional(),
  at: z.string().datetime().optional(),
  partName: z.string(),
  timestamp: z.string().datetime(),
});

export const updateMovementSchema = z.object({
  partId: z.string().min(1).optional(),
  type: movementTypeSchema.optional(),
  quantity: z.number().int().optional(),
  unitCost: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  counterparty: z.string().trim().optional(),
  supplier: z.string().trim().optional(), // Frontend sends 'supplier', map to counterparty
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().nonnegative().optional(),
  totalWithTax: z.number().nonnegative().optional(),
  wattpics: z.number().nonnegative().optional(),
  category: z.string().trim().optional(),
  note: z.string().trim().optional(),
  invoiceNo: z.string().trim().optional(),
  at: z.string().datetime().optional(),
});

export type CreateMovementDto = z.infer<typeof createMovementSchema>;
export type UpdateMovementDto = z.infer<typeof updateMovementSchema>;
export type MovementResponseDto = z.infer<typeof movementResponseSchema>;

