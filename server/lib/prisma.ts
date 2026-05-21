import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// O PrismaClient automaticamente procura por DATABASE_URL no ambiente
const prisma = new PrismaClient();

export default prisma;