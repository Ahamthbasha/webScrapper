import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function initializeDatabase() {
  try {
    const mongodbUri = process.env.MONGODB_URI;
    
    if (!mongodbUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(mongodbUri);
    
    console.log('✅ Database connection established successfully');
    
    return mongoose;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default mongoose;