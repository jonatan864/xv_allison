import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useInvitados } from './hooks/useInvitados.js';
import { Dashboard } from './pages/Dashboard.jsx';
import { Guests } from './pages/Guests.jsx';
import { Login } from './pages/Login.jsx';
import { Scanner } from './pages/Scanner.jsx';
import { Tickets } from './pages/Tickets.jsx';
import { disconnectSocket } from './services/socket.js';


export function App() {
  const auth = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const invitadosState = useInvitados(Boolean(auth.usuario && auth.isAdmin));

  useEffect(() => {
    if (auth.usuario?.rol === 'ACCESO') setActivePage('scanner');
    if (auth.usuario?.rol === 'ADMIN') setActivePage('dashboard');
  }, [auth.usuario]);

  if (auth.loading) {
    return <div className="boot-screen">Cargando XV Allison...</div>;
  }

  if (!auth.usuario) {
    return <Login onLogin={auth.login} error={auth.error} setError={auth.setError} />;
  }

  function handleLogout() {
    disconnectSocket();
    auth.logout();
  }

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      usuario={auth.usuario}
      onLogout={handleLogout}
    >
      {activePage === 'dashboard' && auth.isAdmin && (
        <Dashboard
          stats={invitadosState.stats}
          loading={invitadosState.loading}
          error={invitadosState.error}
        />
      )}
      {activePage === 'guests' && auth.isAdmin && <Guests {...invitadosState} />}
      {activePage === 'tickets' && auth.isAdmin && <Tickets invitados={invitadosState.invitados} />}
      {activePage === 'scanner' && <Scanner />}
    </Layout>
  );
}
