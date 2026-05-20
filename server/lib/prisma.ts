import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL || 'file:./dev.db';

// No Prisma 7, o adaptador pode precisar de um objeto de configuração ou do cliente.
// O erro TS2345 sugere que ele quer o objeto de configuração (Config) que contém 'url'.
const adapter = new PrismaLibSql({
  url: url,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
