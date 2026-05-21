import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import {
  UserPlus, Edit2, Trash2, X, Phone, Mail,
  User, AlertCircle
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  _count?: { appointments: number };
}

const EMPTY_FORM = { name: '', email: '', phone: '' };

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch {
      setError('Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const q = searchTerm.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }, [clients, searchTerm]);

  const openNew = () => {
    setEditingClient(null);
    setFormData(EMPTY_FORM);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name, email: client.email || '', phone: client.phone || '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Nome é obrigatório.'); return; }
    setSaving(true); setError('');
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este cliente? Agendamentos vinculados serão afetados.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch {
      alert('Erro ao remover cliente.');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Clientes</h2>
          <p>{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <UserPlus size={15} /> Novo Cliente
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          {searchTerm && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Filtrando por: "{searchTerm}" — {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          {!searchTerm && (
             <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Use a busca no topo para filtrar clientes
             </span>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contato</th>
              <th>Telefone</th>
              <th>Cadastro</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="table-empty">Carregando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  {searchTerm ? 'Nenhum cliente encontrado para esta busca.' : 'Nenhum cliente cadastrado ainda.'}
                </td>
              </tr>
            ) : filtered.map(client => (
              <tr key={client.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar avatar-sm">{getInitials(client.name)}</div>
                    <span style={{ fontWeight: 500 }}>{client.name}</span>
                  </div>
                </td>
                <td>
                  {client.email ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Mail size={12} />
                      <span style={{ fontSize: 13 }}>{client.email}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                  )}
                </td>
                <td>
                  {client.phone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Phone size={12} />
                      <span style={{ fontSize: 13 }}>{client.phone}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                  )}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    <button
                      className="btn-icon"
                      onClick={() => openEdit(client)}
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingId === client.id}
                      title="Remover"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                </div>
                <div className="modal-subtitle">
                  {editingClient ? editingClient.name : 'Preencha os dados de contato'}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {error && (
                  <div style={{
                    background: 'var(--danger-muted)', borderRadius: 'var(--radius)',
                    padding: '10px 12px', display: 'flex', gap: 8, fontSize: 13, color: 'var(--danger)',
                    border: '1px solid rgba(224,90,90,0.25)'
                  }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label required">Nome completo</label>
                  <div className="input-group">
                    <User className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Maria Oliveira"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <div className="input-group">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="maria@exemplo.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp / Telefone</label>
                  <div className="input-group">
                    <Phone className="input-icon" />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <span className="form-hint">Usado para confirmação via WhatsApp</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;