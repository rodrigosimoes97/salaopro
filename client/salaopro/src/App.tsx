import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CalendarPage from './pages/Calendar';
import ClientsPage from './pages/Clients';
import ServicesPage from './pages/Services';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import { SearchProvider } from './context/SearchContext';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
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
  );
}

export default App;