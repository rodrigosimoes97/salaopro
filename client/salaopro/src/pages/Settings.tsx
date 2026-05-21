import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Layout, Bell, Shield, Database } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Configurações</h2>
          <p>Personalize sua experiência no Salão Pro</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Appearance Section */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Aparência</div>
              <div className="card-subtitle">Escolha entre o modo claro e escuro</div>
            </div>
            <Layout size={16} color="var(--text-muted)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div 
              className={`stat-card ${theme === 'light' ? 'active' : ''}`}
              style={{ 
                cursor: 'pointer', 
                borderColor: theme === 'light' ? 'var(--brand)' : undefined,
                background: theme === 'light' ? 'var(--brand-muted)' : undefined,
                textAlign: 'center'
              }}
              onClick={() => setTheme('light')}
            >
              <div style={{ marginBottom: 12, color: theme === 'light' ? 'var(--brand)' : 'var(--text-muted)' }}>
                <Sun size={24} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Modo Claro</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Ideal para ambientes iluminados</div>
            </div>

            <div 
              className={`stat-card ${theme === 'dark' ? 'active' : ''}`}
              style={{ 
                cursor: 'pointer', 
                borderColor: theme === 'dark' ? 'var(--brand)' : undefined,
                background: theme === 'dark' ? 'var(--brand-muted)' : undefined,
                textAlign: 'center'
              }}
              onClick={() => setTheme('dark')}
            >
              <div style={{ marginBottom: 12, color: theme === 'dark' ? 'var(--brand)' : 'var(--text-muted)' }}>
                <Moon size={24} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Modo Escuro</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Confortável para os olhos</div>
            </div>
          </div>
        </div>

        {/* Other sections (placeholders) */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Notificações</div>
              <div className="card-subtitle">Gerencie alertas e confirmações</div>
            </div>
            <Bell size={16} color="var(--text-muted)" />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Funcionalidade de notificações disponível em breve.
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Segurança & Dados</div>
              <div className="card-subtitle">Backup e permissões</div>
            </div>
            <Shield size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" disabled>
              <Database size={14} /> Exportar Backup
            </button>
            <button className="btn btn-ghost btn-sm" disabled>
              Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;