import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  PORT: z.string().transform(Number).default('8080'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/sungrid?replicaSet=rs0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  REALTIME_WS: z.string().transform(val => val === 'true').default('false'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('180'),
  MAX_UPLOAD_MB: z.string().transform(Number).default('25'),
  ENABLE_OCR: z.string().transform(val => val === 'true').default('false'),
  TESSERACT_LANG: z.string().default('eng'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  INVOICE_PARSE_API_URL: z.string().optional(),
  INVOICE_PARSE_API_KEY: z.string().optional(),
  INVOICE_PARSE_API_FORMAT: z.enum(['json', 'multipart']).optional().default('json'),
});

export const config = configSchema.parse(process.env);

export default config;

