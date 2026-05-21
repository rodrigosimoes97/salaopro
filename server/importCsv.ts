import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import prisma from './lib/prisma';

// Utilitário para converter duração (ex: "30min", "1h") para minutos
function parseDuration(durationStr: string): number {
  if (!durationStr) return 30;
  if (durationStr.includes('h')) {
    const hours = parseInt(durationStr);
    return hours * 60;
  }
  return parseInt(durationStr) || 30;
}

// Utilitário para converter preço (ex: "45,00") para float
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(',', '.'));
}

// Utilitário para converter data e hora legadas para Date
// data: 20240806, horario: 1300
function parseDateTime(dateStr: string, timeStr: string): Date {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  // Garantir que timeStr tenha 4 dígitos (ex: "930" -> "0930")
  const fullTimeStr = timeStr.padStart(4, '0');
  const hours = fullTimeStr.substring(0, 2);
  const minutes = fullTimeStr.substring(2, 4);
  
  return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
}

async function importServices() {
  console.log('Importando serviços...');
  const servicesPath = path.resolve(__dirname, 'csv', 'servico.csv');
  const servicesMap = new Map<string, number>();

  if (!fs.existsSync(servicesPath)) {
    console.error('Arquivo servico.csv não encontrado');
    return servicesMap;
  }

  const results: any[] = [];
  await new Promise((resolve) => {
    fs.createReadStream(servicesPath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', resolve);
  });

  for (const row of results) {
    const serviceName = row.Servico;
    if (!serviceName) continue;

    const service = await prisma.service.upsert({
      where: { id: -1 }, // Truque para sempre tentar criar se não existir pelo nome (Prisma 1:1 match)
      // Como não temos unique no nome no schema, vamos buscar primeiro
      create: {
        name: serviceName,
        price: parsePrice(row['Preço (R$)']),
        duration: parseDuration(row.Duracao),
      },
      update: {},
    });

    // Como o schema não tem unique name, vamos apenas criar e mapear
    const existing = await prisma.service.findFirst({ where: { name: serviceName } });
    if (existing) {
      servicesMap.set(serviceName, existing.id);
    } else {
      const created = await prisma.service.create({
        data: {
          name: serviceName,
          price: parsePrice(row['Preço (R$)']),
          duration: parseDuration(row.Duracao),
        }
      });
      servicesMap.set(serviceName, created.id);
    }
  }

  console.log(`${servicesMap.size} serviços processados.`);
  return servicesMap;
}

async function importClients() {
  console.log('Importando clientes...');
  const clientsPath = path.resolve(__dirname, 'csv', 'cliente_dados.csv');
  const clientsMap = new Map<string, number>();

  if (!fs.existsSync(clientsPath)) {
    console.error('Arquivo cliente_dados.csv não encontrado');
    return clientsMap;
  }

  const results: any[] = [];
  await new Promise((resolve) => {
    fs.createReadStream(clientsPath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', resolve);
  });

  for (const row of results) {
    const legacyId = row.id_cliente;
    const name = row.nome;
    if (!name || !legacyId) continue;

    // Buscar por nome e telefone para evitar duplicatas básicas
    let client = await prisma.client.findFirst({
      where: { name, phone: row.telefone_1 }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: name,
          email: row.email || null,
          phone: row.telefone_1 || null,
        }
      });
    }
    clientsMap.set(legacyId, client.id);
  }

  console.log(`${clientsMap.size} clientes processados.`);
  return clientsMap;
}

async function importAppointments(clientsMap: Map<string, number>, servicesMap: Map<string, number>) {
  console.log('Importando atendimentos...');
  const pathApp = path.resolve(__dirname, 'csv', 'atendimento.csv');

  if (!fs.existsSync(pathApp)) {
    console.error('Arquivo atendimento.csv não encontrado');
    return;
  }

  const results: any[] = [];
  await new Promise((resolve) => {
    fs.createReadStream(pathApp)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', resolve);
  });

  let count = 0;
  for (const row of results) {
    const clientId = clientsMap.get(row.id_cliente);
    let serviceId = servicesMap.get(row.servico);

    if (!clientId) continue;

    // Se o serviço não existe, cria um genérico
    if (!serviceId) {
      const serviceName = row.servico || 'Serviço Legado';
      const existing = await prisma.service.findFirst({ where: { name: serviceName } });
      if (existing) {
        serviceId = existing.id;
      } else {
        const newService = await prisma.service.create({
          data: {
            name: serviceName,
            price: parsePrice(row.valor_total),
            duration: 30, // Default
          }
        });
        serviceId = newService.id;
        servicesMap.set(serviceName, serviceId);
      }
    }

    try {
      await prisma.appointment.create({
        data: {
          date: parseDateTime(row.data, row.horario_inicio),
          clientId: clientId,
          serviceId: serviceId!,
          notes: `Importado do sistema antigo. Colaborador: ${row.colaborador}. Status original: ${row.status}`,
        }
      });
      count++;
    } catch (e) {
      // Ignorar erros de data inválida ou outros
    }
  }

  console.log(`${count} atendimentos importados.`);
}

async function runImport() {
  const servicesMap = await importServices();
  const clientsMap = await importClients();
  await importAppointments(clientsMap, servicesMap);
  console.log('Importação concluída com sucesso!');
}

runImport()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
