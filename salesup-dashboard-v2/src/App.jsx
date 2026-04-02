import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './components/auth/LoginPage';
import ClientesPage from './pages/ClientesPage';
import CloserKpiPage from './pages/CloserKpiPage';
import SetterKpiPage from './pages/SetterKpiPage';
import ClientControlPage from './pages/ClientControlPage';
import PagosEquipoPage from './pages/PagosEquipoPage';
import IngestaPage from './pages/IngestaPage';
import ConfigPage from './pages/ConfigPage';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('clientes');

  const renderPage = () => {
    switch (activeTab) {
      case 'clientes': return <ClientesPage />;
      case 'closers': return <CloserKpiPage />;
      case 'setters': return <SetterKpiPage />;
      case 'control-clientes': return <ClientControlPage />;
      case 'pagos-equipo': return <PagosEquipoPage />;
      case 'ingesta': return <IngestaPage />;
      case 'config': return <ConfigPage />;
      default: return <ClientesPage />;
    }
  };

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderPage()}
    </AppShell>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 text-xl font-bold animate-pulse">SALESUP</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <ConfigProvider>
      <Dashboard />
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
