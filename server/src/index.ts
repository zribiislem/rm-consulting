import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import departmentsRouter from './routes/departments.js';
import missionsRouter from './routes/missions.js';
import messagesRouter from './routes/messages.js';
import appointmentsRouter from './routes/appointments.js';
import availableDatesRouter from './routes/available-dates.js';
import sendEmailRouter from './routes/send-email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/departments', departmentsRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/available-dates', availableDatesRouter);
app.use('/api/send-email', sendEmailRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
