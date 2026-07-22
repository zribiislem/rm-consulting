import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Reference from './models/Reference.js';

const migrate = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB for migration...');

    const result = await Reference.updateMany(
      { imageUrl: { $exists: false } },
      { $set: { imageUrl: '' } }
    );

    console.log(`Migration terminée : ${result.modifiedCount} référence(s) mise(s) à jour.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrate();