import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  CalendarDays, Users, Scissors, BarChart3, Settings,
  Bell, Search, Menu, ChevronDown, X
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';

const navItems = [
  {
    section: 'Principal',
    items: [
      { path: '/', icon: CalendarDays, label: 'Agenda', badge: null },
      { path: '/clients', icon: Users, label: 'Clientes', badge: null },
      { path: '/services', icon: Scissors, label: 'Serviços', badge: null },
      { path: '/reports', icon: BarChart3, label: 'Relatórios', badge: 'Novo' },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { path: '/settings', icon: Settings, label: 'Configurações', badge: null },
    ]
  }
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Agenda', subtitle: 'Gerencie seus agendamentos' },
  '/clients': { title: 'Clientes', subtitle: 'Sua base de clientes' },
  '/services': { title: 'Serviços', subtitle: 'Tabela de preços e procedimentos' },
  '/reports': { title: 'Relatórios', subtitle: 'Visão financeira do negócio' },
  '/settings': { title: 'Configurações', subtitle: 'Personalize seu espaço' },
};

const Layout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();
  const page = pageTitles[location.pathname] || { title: 'Página', subtitle: '' };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">CM</div>
          <div>
            <div className="logo-text">Carol <span>Maxi</span></div>
          </div>
          <button 
            className="btn-icon" 
            style={{ marginLeft: 'auto', display: sidebarOpen ? 'flex' : 'none' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {navItems.map(section => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-label">{section.section}</div>
              {section.items.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="nav-icon" />
                    {item.label}
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">CM</div>
            <div className="user-info">
              <div className="user-name">Carol Maxi</div>
              <div className="user-role">Plano Pro</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-sub">{page.subtitle}</div>
          </div>

          <div className="topbar-actions">
            <div className="search-bar" style={{ display: 'flex' }}>
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="btn-icon" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--brand)', border: '1.5px solid var(--bg-card)'
              }} />
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;