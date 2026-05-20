import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Criar novo cliente
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const client = await prisma.client.create({
      data: { name, email, phone },
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: { name, email, phone },
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.client.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

export default router;
