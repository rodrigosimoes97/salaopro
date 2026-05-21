// @ts-nocheck
import React, { useState, useEffect } from 'react';
import api from '../api';
import { TrendingUp, DollarSign, CalendarDays, Users, Clock, Star } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useSearch } from '../context/SearchContext';

interface Appointment {
  id: number;
  date: string;
  client: { id: number; name: string };
  service: { id: number; name: string; price: number; duration: number };
}

const ReportsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    api.get('/appointments').then(res => {
      setAppointments(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = appointments.filter(a => {
    const matchDate = isWithinInterval(new Date(a.date), { 
      start: new Date(dateRange.start + 'T00:00:00'), 
      end: new Date(dateRange.end + 'T23:59:59') 
    });
    const matchSearch = !searchTerm.trim() || 
      a.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchDate && matchSearch;
  });

  const revenue = filtered.reduce((acc, a) => acc + a.service.price, 0);
  const avgTicket = filtered.length > 0 ? revenue / filtered.length : 0;
  const totalMinutes = filtered.reduce((acc, a) => acc + a.service.duration, 0);

  const serviceFrequency: Record<string, { count: number; revenue: number }> = {};
  filtered.forEach(a => {
    const key = a.service.name;
    if (!serviceFrequency[key]) serviceFrequency[key] = { count: 0, revenue: 0 };
    serviceFrequency[key].count++;
    serviceFrequency[key].revenue += a.service.price;
  });

  const topServices = Object.entries(serviceFrequency)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const clientFrequency: Record<string, number> = {};
  filtered.forEach(a => {
    const key = a.client.name;
    clientFrequency[key] = (clientFrequency[key] || 0) + 1;
  });

  const topClients = Object.entries(clientFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const setShortcut = (type: 'thisMonth' | 'lastMonth' | 'today' | 'thisYear' | 'all') => {
    const now = new Date();
    let start = now;
    let end = now;

    if (type === 'thisMonth') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (type === 'lastMonth') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start = startOfMonth(last);
      end = endOfMonth(last);
    } else if (type === 'today') {
      start = now;
      end = now;
    } else if (type === 'thisYear') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else if (type === 'all') {
      start = new Date(2000, 0, 1);
      end = new Date(2100, 11, 31);
    }

    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    });
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Carregando relatórios...
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Relatórios</h2>
          <p>Análise de desempenho e faturamento ({filtered.length} registros)</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Data Início</label>
            <input 
              type="date" 
              className="form-input" 
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Data Fim</label>
            <input 
              type="date" 
              className="form-input" 
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShortcut('today')}>Hoje</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShortcut('thisMonth')}>Este Mês</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShortcut('thisYear')}>Este Ano</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShortcut('all')}>Tudo</button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          {
            label: 'Faturamento do período',
            value: `R$ ${revenue.toFixed(2)}`,
            icon: DollarSign,
            color: 'var(--success)',
            bg: 'var(--success-muted)',
          },
          {
            label: 'Atendimentos',
            value: filtered.length,
            icon: CalendarDays,
            color: 'var(--brand)',
            bg: 'var(--brand-muted)',
          },
          {
            label: 'Ticket médio',
            value: `R$ ${avgTicket.toFixed(2)}`,
            icon: TrendingUp,
            color: 'var(--info)',
            bg: 'var(--info-muted)',
          },
          {
            label: 'Horas trabalhadas',
            value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min`,
            icon: Clock,
            color: 'var(--warning)',
            bg: 'var(--warning-muted)',
          },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg }}>
                <Icon size={16} color={stat.color} />
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value" style={{ fontSize: 22, color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Services */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Serviços mais realizados</div>
              <div className="card-subtitle">no período</div>
            </div>
            <Star size={14} color="var(--brand)" />
          </div>
          {topServices.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
              Sem dados neste período
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topServices.map(([name, data]) => {
                const maxCount = topServices[0][1].count;
                const pct = (data.count / maxCount) * 100;
                return (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {data.count}x — R$ {data.revenue.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: 'var(--brand)', borderRadius: 99,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Clientes mais frequentes</div>
              <div className="card-subtitle">no período</div>
            </div>
            <Users size={14} color="var(--brand)" />
          </div>
          {topClients.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
              Sem dados neste período
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topClients.map(([name, count], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className="avatar avatar-sm"
                    style={{ background: i === 0 ? 'var(--brand)' : undefined }}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
                  </div>
                  <span className="badge badge-brand">{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent appointments */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Histórico de Atendimentos</div>
              <div className="card-subtitle">Exibindo os 50 mais recentes do período</div>
            </div>
          </div>
          <div style={{ maxHeight: 500, overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Duração</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">Nenhum atendimento neste período</td></tr>
                ) : [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50).map(a => (
                  <tr key={a.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {format(new Date(a.date), "dd/MM/yyyy 'às' HH:mm")}
                    </td>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{a.client.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.service.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.service.duration} min</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)', fontSize: 13 }}>
                      R$ {a.service.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;