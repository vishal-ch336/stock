import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sungrid?replicaSet=rs0';

console.log('Testing MongoDB connection...');
console.log('URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@'));

try {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✓ MongoDB connected successfully!');
  console.log('  Database:', mongoose.connection.db?.databaseName);
  console.log('  Ready State:', mongoose.connection.readyState, '(1=connected)');
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error('✗ MongoDB connection failed!');
  console.error('  Error:', err.message);
  if (err.message.includes('ECONNREFUSED')) {
    console.error('  → MongoDB server is not reachable');
  } else if (err.message.includes('authentication')) {
    console.error('  → Authentication failed - check username/password');
  } else if (err.message.includes('timeout')) {
    console.error('  → Connection timeout - check network/firewall');
  }
  process.exit(1);
}
