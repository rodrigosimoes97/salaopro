import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit2, Trash2, Scissors } from 'lucide-react';

const Services: React.FC = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', duration: '' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const response = await api.get('/services');
    setServices(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/services', {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
    });
    setIsModalOpen(false);
    setFormData({ name: '', price: '', duration: '' });
    fetchServices();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ margin: 0, color: '#6b7280', fontSize: '1rem', fontWeight: 500 }}>
          {services.length} serviços cadastrados
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Novo Serviço
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome do Serviço</th>
              <th>Preço</th>
              <th>Duração Média</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service: any) => (
              <tr key={service.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                  <div style={{ padding: '6px', background: '#f0efff', borderRadius: '6px', color: '#4f46e5' }}>
                    <Scissors size={14} />
                  </div>
                  {service.name}
                </td>
                <td style={{ color: '#10b981', fontWeight: 700 }}>R$ {service.price.toFixed(2)}</td>
                <td style={{ color: '#6b7280' }}>{service.duration} minutos</td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', marginRight: '1rem' }}><Edit2 size={16} /></button>
                  <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Novo Serviço</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Ex: Corte Degradê"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duração (minutos)</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    placeholder="30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn"
                  style={{ flex: 1, background: '#f3f4f6' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
