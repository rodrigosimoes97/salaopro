import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api';
import { Plus, X } from 'lucide-react';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const [clientsRes, servicesRes] = await Promise.all([
      api.get('/clients'),
      api.get('/services')
    ]);
    setClients(clientsRes.data);
    setServices(servicesRes.data);
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      const formattedEvents = response.data.map((app: any) => ({
        id: app.id,
        title: `${app.client.name} - ${app.service.name}`,
        start: new Date(app.date),
        end: new Date(new Date(app.date).getTime() + app.service.duration * 60000),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      await api.post('/appointments', {
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        date: dateTime.toISOString(),
        notes: formData.notes
      });
      setIsModalOpen(false);
      setFormData({ clientId: '', serviceId: '', date: '', time: '', notes: '' });
      fetchAppointments();
    } catch (error) {
      alert('Erro ao agendar. Verifique se escolheu cliente e serviço.');
    }
  };

  return (
    <div className="card" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Quadro de Horários</h3>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      <div style={{ flexGrow: 1 }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={{
            next: 'Próximo',
            previous: 'Anterior',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
          }}
          defaultView={Views.WEEK}
          views={['month', 'week', 'day']}
          culture="pt-BR"
        />
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Novo Agendamento</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select 
                  className="form-input" 
                  required
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Serviço</label>
                <select 
                  className="form-input" 
                  required
                  value={formData.serviceId}
                  onChange={e => setFormData({...formData, serviceId: e.target.value})}
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    required 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" style={{ flex: 1, background: '#f3f4f6' }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
