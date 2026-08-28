import React from 'react';
import { StatCard } from '../components/StatCard.jsx';

export function Dashboard({ stats, loading, error }) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Panel administrativo</p>
          <h2>XV Alison</h2>
          <p>Registro, tickets y estados conectados a la base de datos central.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <StatCard label="QR Generados" value={loading ? '...' : stats.invitados} />
        <StatCard label="Invitados" value={loading ? '...' : stats.totalPases} tone="gold" />
        <StatCard label="Vigentes" value={loading ? '...' : stats.vigentes} tone="green" />
        <StatCard label="Usados" value={loading ? '...' : stats.usados} tone="dark" />
      </div>
    </div>
  );
}
