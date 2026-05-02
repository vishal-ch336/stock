import mongoose from 'mongoose';
import { AppError } from '../middleware/error';
import { Movement, IMovement } from '../models/Movement';
import { Part, IPart } from '../models/Part';

export interface MovementResult {
  movement: IMovement;
  partAfter: IPart;
}

export class InventoryService {
  async processMovement(
    data: Partial<IMovement>,
    type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUST',
    quantity: number
  ): Promise<MovementResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const part = await Part.findOne({ partId: data.partId }).session(session);
      if (!part) {
        throw new AppError('Part not found', 404);
      }

      const beforeStock = part.inStock;

      switch (type) {
        case 'PURCHASE':
          if (quantity <= 0) {
            throw new AppError('Purchase quantity must be positive', 400);
          }
          part.inStock += quantity;
          break;

        case 'SALE':
          if (quantity >= 0) {
            throw new AppError('Sale quantity must be negative', 400);
          }
          const saleQuantity = Math.abs(quantity);
          if (saleQuantity > part.inStock) {
            throw new AppError('Insufficient stock', 400);
          }
          part.inStock -= saleQuantity;
          break;

        case 'RETURN':
          if (quantity >= 0) {
            throw new AppError('Return quantity must be negative', 400);
          }
          part.inStock += Math.abs(quantity);
          break;

        case 'ADJUST':
          if (quantity <= 0) {
            throw new AppError('Adjustment quantity must be positive', 400);
          }
          part.inStock += quantity;
          if (!data.note) {
            throw new AppError('Note required for adjustments', 400);
          }
          break;
      }

      part.lastMovementAt = data.at || new Date();

      if (data.unitCost && (type === 'PURCHASE' || type === 'RETURN')) {
        const qty = type === 'RETURN' ? Math.abs(quantity) : quantity; // RETURN quantity is negative, convert to positive
        const totalValue = beforeStock * (part.unitCost || 0) + qty * data.unitCost;
        const totalQuantity = beforeStock + qty;
        part.unitCost = totalValue / totalQuantity;
      }

      await part.save({ session });

      // Map supplier to counterparty (frontend sends 'supplier', backend stores as 'counterparty')
      const counterparty = (data as any).supplier || data.counterparty;

      const movement = await Movement.create(
        [
          {
            partId: data.partId,
            type,
            quantity, // Store as-is: positive for PURCHASE/ADJUST, negative for SALE/RETURN
            unitCost: data.unitCost,
            salePrice: data.salePrice,
            counterparty,
            taxRate: (data as any).taxRate,
            taxAmount: (data as any).taxAmount,
            totalWithTax: (data as any).totalWithTax,
            wattpics: (data as any).wattpics,
            category: (data as any).category,
            note: data.note,
            invoiceNo: (data as any).invoiceNo,
            at: data.at || new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        movement: movement[0],
        partAfter: part,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const inventoryService = new InventoryService();

