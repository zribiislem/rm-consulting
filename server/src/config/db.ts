import mongoose from 'mongoose';

const RETRY_DELAY_MS = 15000;

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in environment variables');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    console.error(`Retrying connection in ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected. Reconnecting...');
  setTimeout(connectDB, RETRY_DELAY_MS);
});

export default connectDB;
