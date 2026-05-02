import { z } from 'zod';
import { unitSchema } from './common.schema';

export const parsedInvoiceItemSchema = z.object({
  rawDescription: z.string(),
  suggested: z.object({
    partId: z.string().optional(),
    name: z.string().optional(),
    unit: unitSchema.optional(),
    quantity: z.number().optional(),
    unitCost: z.number().optional(),
    supplier: z.string().optional(),
  }),
  confidence: z.number().min(0).max(1),
});

export const parsedInvoiceDTOSchema = z.object({
  vendor: z.string().optional(),
  currency: z.string().optional(),
  invoiceNo: z.string().optional(),
  date: z.string().optional(),
  items: z.array(parsedInvoiceItemSchema),
});

export const ingestInvoiceItemSchema = z.object({
  mode: z.enum(['CREATE_NEW_PART', 'MAP_EXISTING_PART']),
  partId: z.string().min(1),
  name: z.string().min(1).optional(),
  unit: unitSchema.optional(),
  minStock: z.number().int().nonnegative().optional(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative().optional(),
  supplier: z.string().trim().optional(),
  note: z.string().optional(),
});

export const ingestInvoiceDTOSchema = z.object({
  meta: z
    .object({
      invoiceNo: z.string().optional(),
      date: z.string().optional(),
      currency: z.string().optional(),
      supplier: z.string().trim().optional(),
    })
    .optional(),
  items: z.array(ingestInvoiceItemSchema).min(1),
});

export const ingestResultDTOSchema = z.object({
  createdParts: z.number().int().nonnegative(),
  createdMovements: z.number().int().nonnegative(),
  totals: z.object({
    quantity: z.number().nonnegative(),
    value: z.number().nonnegative().optional(),
  }),
  warnings: z.array(z.string()).optional(),
});

export type ParsedInvoiceDTO = z.infer<typeof parsedInvoiceDTOSchema>;
export type IngestInvoiceDTO = z.infer<typeof ingestInvoiceDTOSchema>;
export type IngestInvoiceItem = z.infer<typeof ingestInvoiceItemSchema>;
export type IngestResultDTO = z.infer<typeof ingestResultDTOSchema>;

