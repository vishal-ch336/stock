import mongoose from 'mongoose';
import { AppError } from '../middleware/error';
import { Movement } from '../models/Movement';
import { Part } from '../models/Part';
import { IngestInvoiceDTO, IngestInvoiceItem, IngestResultDTO } from '../schemas/invoice.schema';

export class InvoiceIngestService {
  async ingestInvoice(dto: IngestInvoiceDTO): Promise<IngestResultDTO> {
    const session = await mongoose.startSession();
    session.startTransaction();

    let createdParts = 0;
    let createdMovements = 0;
    let totalQuantity = 0;
    let totalValue = 0;
    const warnings: string[] = [];

    try {
      const ingestDate = dto.meta?.date ? new Date(dto.meta.date) : new Date();

      for (const item of dto.items) {
        if (item.mode === 'CREATE_NEW_PART') {
          const existing = await Part.findOne({ partId: item.partId }).session(session);
          if (existing) {
            session.abortTransaction();
            throw new AppError(`Part ${item.partId} already exists`, 409);
          }

          if (!item.name || !item.unit) {
            session.abortTransaction();
            throw new AppError('Name and unit required when creating new parts', 400);
          }

          await Part.create(
            [
              {
                partId: item.partId,
                name: item.name,
                unit: item.unit,
                minStock: item.minStock || 0,
                unitCost: item.unitCost,
                supplier: item.supplier || dto.meta?.supplier,
                inStock: 0,
                reserved: 0,
                lastMovementAt: ingestDate,
              },
            ],
            { session }
          );
          createdParts++;
        }

        const part = await Part.findOne({ partId: item.partId }).session(session);
        if (!part) {
          session.abortTransaction();
          throw new AppError(`Part ${item.partId} not found`, 404);
        }

        part.inStock += item.quantity;
        part.lastMovementAt = ingestDate;
        if (item.unitCost) {
          const oldValue = part.inStock * (part.unitCost || 0);
          part.unitCost =
            (oldValue + item.quantity * item.unitCost) / (part.inStock || 1);
        }
        await part.save({ session });

        await Movement.create(
          [
            {
              partId: item.partId,
              type: 'PURCHASE',
              quantity: item.quantity,
              unitCost: item.unitCost,
              counterparty: item.supplier || dto.meta?.supplier,
              note: item.note,
              at: ingestDate,
            },
          ],
          { session }
        );
        createdMovements++;
        totalQuantity += item.quantity;
        if (item.unitCost) {
          totalValue += item.quantity * item.unitCost;
        }
      }

      await session.commitTransaction();

      return {
        createdParts,
        createdMovements,
        totals: {
          quantity: totalQuantity,
          value: totalValue,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const invoiceIngestService = new InvoiceIngestService();

