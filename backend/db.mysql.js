// MongoDB connection setup
import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    // Using database name 'Sih2025'
    return client.db('Sih2025');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

export { client };