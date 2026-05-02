import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { connectDB, disconnectDB } from '../db';
import { Part } from '../models/Part';
import { Movement } from '../models/Movement';

describe('Movements API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/movements', () => {
    it('should create PURCHASE movement and increase stock', async () => {
      await Part.create({
        partId: 'TEST-MOVE-001',
        name: 'Stockable Part',
        unit: 'pcs',
        inStock: 10,
      });

      const res = await request(app)
        .post('/api/movements')
        .send({
          partId: 'TEST-MOVE-001',
          type: 'PURCHASE',
          quantity: 5,
          unitCost: 100,
        })
        .expect(201);

      expect(res.body.part.inStock).toBe(15);
    });

    it('should return 400 for SALE when stock insufficient', async () => {
      await Part.create({
        partId: 'TEST-MOVE-002',
        name: 'Low Stock Part',
        unit: 'pcs',
        inStock: 5,
      });

      await request(app)
        .post('/api/movements')
        .send({
          partId: 'TEST-MOVE-002',
          type: 'SALE',
          quantity: 10,
        })
        .expect(400);
    });
  });
});

