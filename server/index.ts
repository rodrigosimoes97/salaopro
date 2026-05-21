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
  origin: '*', // Em produção, você pode restringir para o domínio da sua Vercel
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
