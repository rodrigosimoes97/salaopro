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
    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        date: date ? new Date(date) : undefined,
        clientId: clientId ? Number(clientId) : undefined,
        serviceId: serviceId ? Number(serviceId) : undefined,
        notes,
      },
      include: {
        client: true,
        service: true,
      },
    });
    res.json(appointment);
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
