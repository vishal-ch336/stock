import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { connectDB, disconnectDB } from '../db';
import { Part } from '../models/Part';
import { Movement } from '../models/Movement';

describe('Parts API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/parts', () => {
    it('should create a new part', async () => {
      const partData = {
        partId: 'TEST-PART-001',
        name: 'Test Part',
        unit: 'pcs',
        minStock: 10,
      };

      const res = await request(app)
        .post('/api/parts')
        .send(partData)
        .expect(201);

      expect(res.body.partId).toBe(partData.partId);
      expect(res.body.name).toBe(partData.name);
    });

    it('should return 409 for duplicate partId', async () => {
      const partData = {
        partId: 'TEST-DUPLICATE',
        name: 'Duplicate Part',
        unit: 'pcs',
      };

      await request(app).post('/api/parts').send(partData).expect(201);
      await request(app).post('/api/parts').send(partData).expect(409);
    });
  });

  describe('DELETE /api/parts/:partId', () => {
    it('should return 409 if part has movements', async () => {
      await Part.create({
        partId: 'TEST-DELETE-001',
        name: 'Delete Me',
        unit: 'pcs',
        inStock: 0,
      });

      await Movement.create({
        partId: 'TEST-DELETE-001',
        type: 'PURCHASE',
        quantity: 10,
      });

      await request(app).delete('/api/parts/TEST-DELETE-001').expect(409);
    });

    it('should delete part without movements', async () => {
      await Part.create({
        partId: 'TEST-DELETE-002',
        name: 'Delete Me Too',
        unit: 'pcs',
        inStock: 0,
      });

      await request(app).delete('/api/parts/TEST-DELETE-002').expect(204);
    });
  });

  describe('GET /api/parts', () => {
    it('should return list of parts', async () => {
      const res = await request(app).get('/api/parts').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});

