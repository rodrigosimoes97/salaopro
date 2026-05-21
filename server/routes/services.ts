import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// Criar novo serviço
router.post('/', async (req, res) => {
  const { name, price, duration } = req.body;
  try {
    const service = await prisma.service.create({
      data: { name, price, duration },
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// Atualizar serviço
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, duration } = req.body;
  try {
    const service = await prisma.service.update({
      where: { id: Number(id) },
      data: { name, price, duration },
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// Deletar serviço
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Serviço deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
});

export default router;
