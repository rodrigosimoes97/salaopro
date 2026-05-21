import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (typeof window !== 'undefined') {
  window.onerror = (msg, url, line, col, error) => {
    console.error('Captura Global:', { msg, url, line, col, error });
  };
  window.onunhandledrejection = (event) => {
    console.error('Promessa não tratada:', event.reason);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
