import React, { useMemo, useState } from 'react';
import { TicketPreview } from '../components/TicketPreview.jsx';

export function Tickets({ invitados }) {
  const [selectedId, setSelectedId] = useState('');

  const selected = useMemo(() => {
    return invitados.find((item) => item._id === selectedId) || invitados[0] || null;
  }, [invitados, selectedId]);

  return (
    <div className="tickets-grid">
      <section className="panel selector-panel">
        <h2>Seleccionar Invitado</h2>
        <div className="selector-list">
          {invitados.map((invitado) => (
            <button
              className={selected?._id === invitado._id ? 'guest-option active' : 'guest-option'}
              key={invitado._id}
              type="button"
              onClick={() => setSelectedId(invitado._id)}
            >
              <strong>{invitado.nombre}</strong>
              <span>{invitado.pases} pases • {invitado.estado}</span>
            </button>
          ))}
          {invitados.length === 0 && <p className="muted">Aun no hay invitados registrados</p>}
        </div>
      </section>

      <TicketPreview invitado={selected} />
    </div>
  );
}
