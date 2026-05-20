import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Calendar, Users, Scissors, LayoutDashboard } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Calendar, label: 'Agenda de Atendimentos' },
    { path: '/clients', icon: Users, label: 'Gestão de Clientes' },
    { path: '/services', icon: Scissors, label: 'Tabela de Serviços' },
  ];

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 10
      }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#4f46e5', padding: '8px', borderRadius: '10px' }}>
            <Calendar color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.025em' }}>
            99SALÃO <span style={{ color: '#4f46e5' }}>PRO</span>
          </h1>
        </div>

        <nav style={{ padding: '0 0.75rem', flexGrow: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.875rem 1rem',
                  textDecoration: 'none',
                  borderRadius: '0.75rem',
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s',
                  backgroundColor: isActive ? '#f0efff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#4b5563',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <Icon size={20} style={{ marginRight: '0.75rem' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
          © 2026 SalaoPro - Premium Version
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '280px', flexGrow: 1, padding: '2rem 3rem' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Bem-vindo de volta!</p>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {menuItems.find(i => i.path === location.pathname)?.label || 'Visão Geral'}
          </h2>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
