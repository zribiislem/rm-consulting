import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import departmentsRouter from './routes/departments.js';
import missionsRouter from './routes/missions.js';
import messagesRouter from './routes/messages.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/departments', departmentsRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/messages', messagesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
