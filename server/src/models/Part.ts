import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPart extends Document {
  partId: string;
  name: string;
  category?: string;
  location?: string;
  unit: 'pcs' | 'pair' | 'm' | 'set' | 'roll';
  minStock: number;
  inStock: number;
  reserved: number;
  unitCost?: number;
  taxRate?: number;
  supplier?: string;
  wattpics?: number;
  powerUnit?: 'wp' | 'kw';
  lastMovementAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PartSchema = new Schema<IPart>(
  {
    partId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ['pcs', 'pair', 'm', 'set', 'roll'],
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Number,
      default: 0,
      index: true,
    },
    reserved: {
      type: Number,
      default: 0,
    },
    unitCost: {
      type: Number,
      min: 0,
    },
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    supplier: {
      type: String,
      trim: true,
    },
    wattpics: {
      type: Number,
      min: 0,
    },
    powerUnit: {
      type: String,
      enum: ['wp', 'kw'],
      default: 'wp',
    },
    lastMovementAt: {
      type: Date,
      index: -1,
    },
  },
  {
    timestamps: true,
  }
);

PartSchema.index({ name: 'text', partId: 'text' });

// Virtual for id field
PartSchema.virtual('id').get(function () {
  return this._id.toString();
});

PartSchema.set('toJSON', { virtuals: true });
PartSchema.set('toObject', { virtuals: true });

export const Part: Model<IPart> = mongoose.model<IPart>('Part', PartSchema);

