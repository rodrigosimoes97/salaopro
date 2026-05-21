import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api';
import {
  Plus, X, Clock, User, Scissors, FileText, CalendarDays, AlertCircle
} from 'lucide-react';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface Appointment {
  id: number;
  date: string;
  notes: string | null;
  client: { id: number; name: string; phone?: string };
  service: { id: number; name: string; price: number; duration: number };
}

interface EventItem {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

const STATUS_COLORS = [
  'var(--brand)',
  'var(--info)',
  'var(--success)',
];

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<any>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    notes: ''
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, clientsRes, servicesRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/clients'),
        api.get('/services'),
      ]);
      setClients(clientsRes.data);
      setServices(servicesRes.data);
      const formatted: EventItem[] = appsRes.data.map((app: Appointment) => ({
        id: app.id,
        title: `${app.client.name}`,
        start: new Date(app.date),
        end: new Date(new Date(app.date).getTime() + app.service.duration * 60000),
        resource: app,
      }));
      setEvents(formatted);
    } catch {
      setError('Erro ao carregar dados. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openNewModal = (slotInfo?: { start: Date }) => {
    const d = slotInfo?.start ?? new Date();
    setFormData({
      clientId: '',
      serviceId: '',
      date: format(d, 'yyyy-MM-dd'),
      time: format(d, 'HH:mm'),
      notes: ''
    });
    setSelectedEvent(null);
    setIsModalOpen(true);
    setError('');
  };

  const openEditModal = (event: EventItem) => {
    setFormData({
      clientId: String(event.resource.client.id),
      serviceId: String(event.resource.service.id),
      date: format(event.start, 'yyyy-MM-dd'),
      time: format(event.start, 'HH:mm'),
      notes: event.resource.notes || ''
    });
    setSelectedEvent(event); // Mantemos o evento selecionado para saber que é edição
    setIsModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.serviceId) {
      setError('Selecione um cliente e um serviço.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const payload = {
        clientId: Number(formData.clientId),
        serviceId: Number(formData.serviceId),
        date: dateTime.toISOString(),
        notes: formData.notes || null,
      };

      if (selectedEvent) {
        // Modo Edição
        await api.put(`/appointments/${selectedEvent.id}`, payload);
      } else {
        // Modo Criação
        await api.post('/appointments', payload);
      }
      
      setIsModalOpen(false);
      setSelectedEvent(null);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Cancelar este agendamento?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setSelectedEvent(null);
      fetchAll();
    } catch {
      alert('Erro ao cancelar agendamento.');
    }
  };

  const selectedService = services.find(s => String(s.id) === formData.serviceId);

  const eventStyleGetter = (event: EventItem) => ({
    style: {
      background: 'var(--brand)',
      border: 'none',
      borderRadius: '6px',
      color: '#0D0C0B',
      fontSize: '12px',
      fontWeight: '500',
      padding: '2px 6px',
    }
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Agenda de Atendimentos</h2>
          <p>{events.length} agendamento{events.length !== 1 ? 's' : ''} no período</p>
        </div>
        <button className="btn btn-primary" onClick={() => openNewModal()}>
          <Plus size={15} /> Novo Agendamento
        </button>
      </div>

      <div className="card" style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', padding: '16px' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Carregando agenda...
          </div>
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectSlot={openNewModal}
            onSelectEvent={(event) => setSelectedEvent(event as EventItem)}
            selectable
            view={currentView}
            onView={(view) => setCurrentView(view)}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            views={['month', 'week', 'day']}
            culture="pt-BR"
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              showMore: (total) => `+${total} mais`,
              noEventsInRange: 'Nenhum agendamento neste período',
            }}
            popup
          />
        )}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Detalhes do Agendamento</div>
                <div className="modal-subtitle">
                  {format(selectedEvent.start, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedEvent(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="avatar avatar-md">
                    {selectedEvent.resource.client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedEvent.resource.client.name}</div>
                    {selectedEvent.resource.client.phone && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedEvent.resource.client.phone}</div>
                    )}
                  </div>
                </div>

                <div className="divider" style={{ margin: '0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Scissors size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Serviço</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedEvent.resource.service.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Horário</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {format(selectedEvent.start, 'HH:mm')} – {format(selectedEvent.end, 'HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <CalendarDays size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Duração</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedEvent.resource.service.duration} min</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <FileText size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Valor</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>
                        R$ {selectedEvent.resource.service.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedEvent.resource.notes && (
                  <>
                    <div className="divider" style={{ margin: '0' }} />
                    <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Observações</div>
                      <div style={{ fontSize: 13 }}>{selectedEvent.resource.notes}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(selectedEvent.id)}
              >
                Cancelar Agendamento
              </button>
              <div style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={() => openEditModal(selectedEvent)}>
                Editar
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEvent(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New appointment modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedEvent ? 'Editar Agendamento' : 'Novo Agendamento'}</div>
                <div className="modal-subtitle">
                  {selectedEvent ? 'Altere os dados do atendimento' : 'Preencha os dados do atendimento'}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && (
                  <div style={{
                    background: 'var(--danger-muted)',
                    border: '1px solid rgba(224,90,90,0.25)',
                    borderRadius: 'var(--radius)',
                    padding: '10px 12px',
                    display: 'flex', gap: 8, alignItems: 'center',
                    fontSize: 13, color: 'var(--danger)'
                  }}>
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="form-row col-2">
                  <div className="form-group">
                    <label className="form-label required">Cliente</label>
                    <div className="input-group">
                      <User className="input-icon" />
                      <select
                        className="form-select"
                        style={{ paddingLeft: 34 }}
                        value={formData.clientId}
                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                      >
                        <option value="">Selecione o cliente</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Serviço</label>
                    <div className="input-group">
                      <Scissors className="input-icon" />
                      <select
                        className="form-select"
                        style={{ paddingLeft: 34 }}
                        value={formData.serviceId}
                        onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                      >
                        <option value="">Selecione o serviço</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} — R$ {s.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-row col-2">
                  <div className="form-group">
                    <label className="form-label required">Data</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Horário</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {selectedService && (
                  <div style={{
                    background: 'var(--brand-muted)',
                    border: '1px solid var(--border-brand)',
                    borderRadius: 'var(--radius)',
                    padding: '10px 14px',
                    display: 'flex', gap: 16, alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Duração</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>{selectedService.duration} min</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'var(--border-brand)' }} />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Valor</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>R$ {selectedService.price.toFixed(2)}</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'var(--border-brand)' }} />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Término previsto</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>
                        {(() => {
                          const d = new Date(`${formData.date}T${formData.time}`);
                          d.setMinutes(d.getMinutes() + selectedService.duration);
                          return format(d, 'HH:mm');
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Alergia a produtos, preferências, informações importantes..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Confirmar Agendamento'}
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