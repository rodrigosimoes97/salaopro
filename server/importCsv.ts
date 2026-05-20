import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import prisma from './lib/prisma';

async function importClients() {
  const clientsPath = path.resolve(__dirname, 'data', 'clients.csv');
  if (!fs.existsSync(clientsPath)) return;

  fs.createReadStream(clientsPath)
    .pipe(csv())
    .on('data', async (row) => {
      await prisma.client.create({
        data: {
          name: row.name,
          email: row.email,
          phone: row.phone,
        },
      });
    })
    .on('end', () => {
      console.log('Clientes importados com sucesso');
    });
}

async function importServices() {
  const servicesPath = path.resolve(__dirname, 'data', 'services.csv');
  if (!fs.existsSync(servicesPath)) return;

  fs.createReadStream(servicesPath)
    .pipe(csv())
    .on('data', async (row) => {
      await prisma.service.create({
        data: {
          name: row.name,
          price: parseFloat(row.price),
          duration: parseInt(row.duration),
        },
      });
    })
    .on('end', () => {
      console.log('Serviços importados com sucesso');
    });
}

// Nota: A importação de agendamentos requer que clientes e serviços já existam para vincular corretamente.
// Este é um exemplo simplificado.
async function runImport() {
  await importClients();
  await importServices();
}

runImport()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
