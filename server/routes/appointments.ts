import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Listar todos os agendamentos
router.get('/', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        service: true,
      },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Criar novo agendamento
router.post('/', async (req, res) => {
  const { date, clientId, serviceId, notes } = req.body;
  try {
    const startDate = new Date(date);
    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
    
    const endDate = new Date(startDate.getTime() + service.duration * 60000);

    // Verificar conflitos
    const conflict = await prisma.appointment.findFirst({
      where: {
        OR: [
          {
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
          {
            date: {
              lte: startDate,
            },
            service: {
              is: {
                duration: {
                  gt: 0 // Apenas para garantir a estrutura do filtro
                }
              }
            }
          }
        ]
      },
      include: { service: true }
    });

    // Refinar busca de conflito (Prisma doesn't easily support dynamic end date calculated fields in 'where')
    const allAppsOnDay = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(startDate.setHours(0,0,0,0)),
          lte: new Date(startDate.setHours(23,59,59,999)),
        }
      },
      include: { service: true, client: true }
    });

    const realConflict = allAppsOnDay.find((app: any) => {
      const appStart = new Date(app.date).getTime();
      const appEnd = appStart + app.service.duration * 60000;
      const newStart = new Date(date).getTime();
      const newEnd = newStart + service.duration * 60000;
      
      return (newStart < appEnd && newEnd > appStart);
    });

    if (realConflict) {
      return res.status(400).json({ error: `Conflito de horário com agendamento de ${realConflict.client.name}` });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        clientId: Number(clientId),
        serviceId: Number(serviceId),
        notes,
      },
      include: {
        client: true,
        service: true,
      },
    });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, clientId, serviceId, notes } = req.body;
  try {
    const appointmentId = Number(id);
    const existingApp = await prisma.appointment.findUnique({ 
      where: { id: appointmentId },
      include: { service: true }
    });
    
    if (!existingApp) return res.status(404).json({ error: 'Agendamento não encontrado' });

    const newDate = date ? new Date(date) : new Date(existingApp.date);
    const sId = serviceId ? Number(serviceId) : existingApp.serviceId;
    
    const service = await prisma.service.findUnique({ where: { id: sId } });
    if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });

    // Verificar conflitos
    const allAppsOnDay = await prisma.appointment.findMany({
      where: {
        id: { not: appointmentId },
        date: {
          gte: new Date(new Date(newDate).setHours(0,0,0,0)),
          lte: new Date(new Date(newDate).setHours(23,59,59,999)),
        }
      },
      include: { service: true, client: true }
    });

    const realConflict = allAppsOnDay.find((app: any) => {
      const appStart = new Date(app.date).getTime();
      const appEnd = appStart + app.service.duration * 60000;
      const newStart = newDate.getTime();
      const newEnd = newStart + service.duration * 60000;
      
      return (newStart < appEnd && newEnd > appStart);
    });

    if (realConflict) {
      return res.status(400).json({ error: `Conflito de horário com agendamento de ${realConflict.client.name}` });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: newDate,
        clientId: clientId ? Number(clientId) : undefined,
        serviceId: sId,
        notes,
      },
      include: {
        client: true,
        service: true,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

// Deletar agendamento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.appointment.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Agendamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
});

export default router;
