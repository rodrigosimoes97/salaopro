import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import {
  Plus, Scissors, Edit2, Trash2, X, DollarSign,
  Clock, AlertCircle
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  createdAt: string;
}

const EMPTY_FORM = { name: '', price: '', duration: '', category: 'Cabelo' };

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch {
      setError('Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchSearch = !searchTerm.trim() || s.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [services, searchTerm]);

  const openNew = () => {
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: 'Cabelo'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Nome é obrigatório.'); return; }
    if (!formData.price || isNaN(parseFloat(formData.price))) { setError('Preço inválido.'); return; }
    if (!formData.duration || isNaN(parseInt(formData.duration))) { setError('Duração inválida.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };
      if (editingService) {
        await api.put(`/services/${editingService.id}`, payload);
      } else {
        await api.post('/services', payload);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este serviço?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch {
      alert('Erro ao remover. Verifique se há agendamentos vinculados.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Serviços & Preços</h2>
          <p>{services.length} serviço{services.length !== 1 ? 's' : ''} cadastrado{services.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={15} /> Novo Serviço
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total de serviços</div>
          <div className="stat-value">{services.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ticket médio</div>
          <div className="stat-value" style={{ color: 'var(--brand)', fontSize: 22 }}>
            {services.length > 0
              ? `R$ ${(services.reduce((a, s) => a + s.price, 0) / services.length).toFixed(2)}`
              : '—'
            }
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Duração média</div>
          <div className="stat-value">
            {services.length > 0
              ? `${Math.round(services.reduce((a, s) => a + s.duration, 0) / services.length)} min`
              : '—'
            }
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          {searchTerm && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Filtrando por: "{searchTerm}" — {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          {!searchTerm && (
             <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Use a busca no topo para filtrar serviços
             </span>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Duração</th>
              <th>Preço</th>
              <th>Rentabilidade/h</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="table-empty">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  {searchTerm ? 'Nenhum serviço encontrado para esta busca.' : 'Nenhum serviço cadastrado ainda.'}
                </td>
              </tr>
            ) : filtered.map(service => {
              const pricePerHour = (service.price / service.duration) * 60;
              return (
                <tr key={service.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--brand-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Scissors size={14} color="var(--brand)" />
                      </div>
                      <span style={{ fontWeight: 500 }}>{service.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <Clock size={12} />
                      {service.duration} min
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--success)', fontSize: 14 }}>
                      R$ {service.price.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      R$ {pricePerHour.toFixed(0)}/h
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                      <button
                        className="btn-icon"
                        onClick={() => openEdit(service)}
                        title="Editar"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
                        title="Remover"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </div>
                <div className="modal-subtitle">
                  {editingService ? editingService.name : 'Defina o procedimento e o preço'}
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
                    padding: '10px 12px', display: 'flex', gap: 8, fontSize: 13,
                    color: 'var(--danger)', border: '1px solid rgba(224,90,90,0.25)'
                  }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label required">Nome do Serviço</label>
                  <div className="input-group">
                    <Scissors className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Corte Degradê, Hidratação Capilar..."
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row col-2">
                  <div className="form-group">
                    <label className="form-label required">Preço (R$)</label>
                    <div className="input-group">
                      <DollarSign className="input-icon" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-input"
                        placeholder="0,00"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Duração (min)</label>
                    <div className="input-group">
                      <Clock className="input-icon" />
                      <input
                        type="number"
                        min="5"
                        step="5"
                        className="form-input"
                        placeholder="30"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        required
                      />
                    </div>
                    <span className="form-hint">Múltiplos de 5 recomendados</span>
                  </div>
                </div>

                {formData.price && formData.duration && !isNaN(parseFloat(formData.price)) && !isNaN(parseInt(formData.duration)) && (
                  <div style={{
                    background: 'var(--brand-muted)', border: '1px solid var(--border-brand)',
                    borderRadius: 'var(--radius)', padding: '10px 14px',
                    fontSize: 12, color: 'var(--brand)'
                  }}>
                    💡 Rentabilidade: <strong>R$ {((parseFloat(formData.price) / parseInt(formData.duration)) * 60).toFixed(2)}/hora</strong>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;