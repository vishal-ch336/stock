import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './services/stream.service';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection error');
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

