import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// O Prisma Client lerá automaticamente a DATABASE_URL do ambiente
// Para o Neon, certifique-se que a URL termina com ?sslmode=require
const prisma = new PrismaClient();

export default prisma;
