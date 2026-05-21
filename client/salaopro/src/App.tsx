import { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CalendarPage from './pages/Calendar';
import ClientsPage from './pages/Clients';
import ServicesPage from './pages/Services';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import { SearchProvider } from './context/SearchContext';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#222', height: '100vh' }}>
          <h1>Algo deu errado no SalãoPro.</h1>
          <pre style={{ background: '#444', padding: '10px', borderRadius: '4px' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px', cursor: 'pointer' }}>
            Recarregar Aplicativo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  console.log('App renderizando...');
  
  useEffect(() => {
    console.log('App montado. Configurando tema...');
    try {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      console.log('Tema configurado:', savedTheme);
    } catch (e) {
      console.error('Erro ao configurar tema:', e);
    }
  }, []);

  return (
    <ErrorBoundary>
      <SearchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<CalendarPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </ErrorBoundary>
  );
}

export default App;