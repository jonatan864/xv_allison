import React from 'react';
import { StatCard } from '../components/StatCard.jsx';

export function Dashboard({ stats, loading, error }) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <h1 className="eyebrow">Panel administrativo</h1>
          <p>Registro, tickets y estados conectados a la base de datos central.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <StatCard label="QR Generados" value={loading ? '...' : stats.invitados} />
        <StatCard label="Invitados" value={loading ? '...' : stats.totalPases} tone="gold" />
        <StatCard label="Vigentes" value={loading ? '...' : stats.vigentes} tone="green" />
        <StatCard label="Caducados" value={loading ? '...' : stats.caducados} tone="dark" />
      </div>
    </div>
  );
}
