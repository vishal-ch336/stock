import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMovement extends Document {
  partId: string;
  type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUST';
  quantity: number;
  unitCost?: number;
  salePrice?: number;
  counterparty?: string;
  taxRate?: number;
  taxAmount?: number;
  totalWithTax?: number;
  wattpics?: number;
  category?: string;
  note?: string;
  invoiceNo?: string;
  at: Date;
  createdAt: Date;
}

const MovementSchema = new Schema<IMovement>(
  {
    partId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['PURCHASE', 'SALE', 'RETURN', 'ADJUST'],
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      validate: {
        validator: function (this: IMovement, value: number) {
          if (this.type === 'SALE' || this.type === 'RETURN') {
            return value < 0;
          }
          return value > 0;
        },
        message: 'Quantity must be positive for PURCHASE/ADJUST and negative for SALE/RETURN'
      }
    },
    unitCost: {
      type: Number,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    counterparty: {
      type: String,
      trim: true,
    },
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      min: 0,
    },
    totalWithTax: {
      type: Number,
      min: 0,
    },
    wattpics: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    invoiceNo: {
      type: String,
      trim: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: -1,
    },
  },
  {
    timestamps: false,
  }
);

MovementSchema.index({ partId: 1, at: -1 });
MovementSchema.index({ type: 1, createdAt: -1 });

// Virtual for id field
MovementSchema.virtual('id').get(function () {
  return this._id.toString();
});

MovementSchema.set('toJSON', { virtuals: true });
MovementSchema.set('toObject', { virtuals: true });

export const Movement: Model<IMovement> = mongoose.model<IMovement>(
  'Movement',
  MovementSchema
);

