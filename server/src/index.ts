import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDB, disconnectDB } from './db';
import { errorHandler, AppError } from './middleware/error';
import { logger } from './services/stream.service';

import partsRoutes from './routes/parts.routes';
import movementsRoutes from './routes/movements.routes';
import statsRoutes from './routes/stats.routes';
import eventsRoutes from './routes/events.routes';
import exportRoutes from './routes/export.routes';
import importRoutes from './routes/import.routes';
import invoicesRoutes from './routes/invoices.routes';
import resetRoutes from './routes/reset.routes';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/parts', partsRoutes);
app.use('/api/movements', movementsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api', exportRoutes);
app.use('/api', importRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/data', resetRoutes);

app.use('*', (req, res, next) => {
  next(new AppError('Route not found', 404));
});

app.use(errorHandler);

const server = app.listen(config.PORT, async () => {
  await connectDB();
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'Server started');
});

const gracefulShutdown = async () => {
  logger.info('Graceful shutdown initiated');
  server.close();
  await disconnectDB();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;

