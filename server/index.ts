import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clients';
import serviceRoutes from './routes/services';
import appointmentRoutes from './routes/appointments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.vercel\.app$/] 
    : '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
