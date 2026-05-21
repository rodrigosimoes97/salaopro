import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// No Prisma 7+, se você não usa um adaptador específico (como edge functions), 
// a URL pode ser passada diretamente ou via prisma.config.ts.
// Para PostgreSQL padrão no Render, o construtor busca automaticamente ou aceita o datasources.
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;