import { EventEmitter } from 'events';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import pino from 'pino';
import { Movement } from '../models/Movement';
import { Part } from '../models/Part';

export const logger = pino({
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: { colorize: true },
        }
      : undefined,
});

export class StreamService extends EventEmitter {
  private clients: Map<string, Response> = new Map();
  private changeStreams: any[] = [];

  constructor() {
    super();
    this.setupChangeStreams();
  }

  private enrichPart(part: any) {
    const available = Math.max(0, part.inStock - (part.reserved || 0));
    let status: 'Out' | 'Low' | 'OK' = 'Out';
    if (part.inStock > 0) {
      status = part.inStock < part.minStock ? 'Low' : 'OK';
    }

    // Handle both Mongoose documents and plain objects from change streams
    const partObj = typeof part.toObject === 'function' ? part.toObject() : part;

    return {
      ...partObj,
      available,
      status,
      lastMovement: partObj.lastMovementAt?.toISOString() || partObj.lastMovement,
    };
  }

  private enrichMovement(movement: any, part: any) {
    // Handle both Mongoose documents and plain objects from change streams
    const movementObj = typeof movement.toObject === 'function' ? movement.toObject() : movement;

    return {
      ...movementObj,
      partName: part?.name || '',
      timestamp: movementObj.createdAt?.toISOString() || new Date(movementObj.createdAt || movementObj.timestamp).toISOString(),
    };
  }

  private setupChangeStreams() {
    const movementStream = Movement.watch([], { fullDocument: 'updateLookup' });
    const partStream = Part.watch([], { fullDocument: 'updateLookup' });

    movementStream.on('change', async (change) => {
      if (['insert', 'update', 'replace'].includes(change.operationType)) {
        if (change.operationType === 'insert' && change.fullDocument) {
          // Fetch the updated part to include in the event
          const part = await Part.findOne({ partId: change.fullDocument.partId });
          const enrichedPart = part ? this.enrichPart(part) : null;
          const enrichedMovement = this.enrichMovement(change.fullDocument, part);
          this.broadcastEvent('movement.created', {
            movement: enrichedMovement,
            partAfter: enrichedPart,
          });
        }
      }
    });

    partStream.on('change', (change) => {
      if (['update', 'replace'].includes(change.operationType) && change.fullDocument) {
        const enrichedPart = this.enrichPart(change.fullDocument);
        this.broadcastEvent('part.updated', { part: enrichedPart });
      }
    });

    movementStream.on('error', (err) => logger.error({ err }, 'Movement stream error'));
    partStream.on('error', (err) => logger.error({ err }, 'Part stream error'));

    this.changeStreams = [movementStream, partStream];
  }

  addClient(clientId: string, res: Response) {
    this.clients.set(clientId, res);

    res.on('close', () => {
      this.clients.delete(clientId);
      logger.info({ clientId }, 'Client disconnected');
    });

    logger.info({ clientId, count: this.clients.size }, 'Client connected');
  }

  private broadcastEvent(eventType: string, data: any) {
    // Format event to match frontend expectations: { event: "...", data: {...} }
    const eventPayload = { event: eventType, data };
    const payload = JSON.stringify(eventPayload);
    let activeCount = 0;

    this.clients.forEach((res, clientId) => {
      try {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${payload}\n\n`);
        activeCount++;
      } catch (err) {
        logger.error({ err, clientId }, 'Failed to send event');
        this.clients.delete(clientId);
      }
    });

    if (activeCount > 0) {
      logger.debug({ eventType, clients: activeCount }, 'Broadcast event');
    }
  }

  startHeartbeat(clientId: string, res: Response) {
    const interval = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (err) {
        clearInterval(interval);
        this.clients.delete(clientId);
      }
    }, 15000);

    res.on('close', () => clearInterval(interval));
  }

  shutdown() {
    this.changeStreams.forEach((stream) => stream.close());
    this.clients.forEach((res) => res.end());
    this.clients.clear();
  }
}

export const streamService = new StreamService();

