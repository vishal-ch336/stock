import mongoose from 'mongoose';
import { config } from '../config';
import { connectDB, disconnectDB } from '../db';
import { Part } from '../models/Part';
import { Movement } from '../models/Movement';
import { logger } from '../services/stream.service';

const demoParts = [
  {
    partId: 'SP-PNL-450M',
    name: '450W Monocrystalline Solar Panel',
    category: 'Panels',
    unit: 'pcs' as const,
    minStock: 10,
    inStock: 25,
    unitCost: 8500,
    supplier: 'SolarTech India',
    lastMovementAt: new Date(),
  },
  {
    partId: 'SP-INV-5KW',
    name: '5KW String Inverter',
    category: 'Inverters',
    unit: 'pcs' as const,
    minStock: 5,
    inStock: 12,
    unitCost: 45000,
    supplier: 'InverterPro',
    lastMovementAt: new Date(),
  },
  {
    partId: 'SP-MNT-RAIL',
    name: 'Solar Panel Mounting Rails',
    category: 'Mounting',
    unit: 'm' as const,
    minStock: 100,
    inStock: 250,
    unitCost: 85,
    supplier: 'MountPro',
    lastMovementAt: new Date(),
  },
  {
    partId: 'SP-CONN-MC4',
    name: 'MC4 Connectors (Pair)',
    category: 'Accessories',
    unit: 'pair' as const,
    minStock: 50,
    inStock: 150,
    unitCost: 120,
    supplier: 'ConnectCo',
    lastMovementAt: new Date(),
  },
  {
    partId: 'SP-BAT-LFP-100',
    name: '100Ah LiFePO4 Battery',
    category: 'Batteries',
    unit: 'pcs' as const,
    minStock: 8,
    inStock: 3,
    unitCost: 18000,
    supplier: 'BatteryMax',
    lastMovementAt: new Date(),
  },
  {
    partId: 'SP-CABLE-SOLAR',
    name: 'Solar DC Cable 6mm²',
    category: 'Cables',
    unit: 'm' as const,
    minStock: 200,
    inStock: 180,
    unitCost: 45,
    supplier: 'CableCorp',
    lastMovementAt: new Date(),
  },
];

async function seed() {
  try {
    await connectDB();

    await Movement.deleteMany({});
    await Part.deleteMany({});

    const parts = await Part.insertMany(demoParts);

    const demoMovements = [
      {
        partId: 'SP-PNL-450M',
        type: 'PURCHASE' as const,
        quantity: 50,
        unitCost: 8500,
        counterparty: 'SolarTech India',
        note: 'Initial stock',
        at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        partId: 'SP-PNL-450M',
        type: 'SALE' as const,
        quantity: 25,
        salePrice: 12000,
        note: 'Customer order #12345',
        at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        partId: 'SP-INV-5KW',
        type: 'PURCHASE' as const,
        quantity: 20,
        unitCost: 45000,
        counterparty: 'InverterPro',
        at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        partId: 'SP-INV-5KW',
        type: 'SALE' as const,
        quantity: 8,
        salePrice: 65000,
        at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    await Movement.insertMany(demoMovements);

    logger.info(`Seeded ${parts.length} parts and ${demoMovements.length} movements`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Seed failed');
    await disconnectDB();
    process.exit(1);
  }
}

seed();

