import React, { useState } from 'react';
import { GuestForm } from '../components/GuestForm.jsx';
import { GuestList } from '../components/GuestList.jsx';

export function Guests({ invitados, loading, error, addInvitado, editInvitado, removeInvitado }) {
  const [selected, setSelected] = useState(null);

  async function handleSave(payload) {
    if (selected) {
      await editInvitado(selected._id, payload);
      setSelected(null);
      return;
    }

    await addInvitado(payload);
  }

  async function handleDelete(invitado) {
    const confirmed = window.confirm(`Eliminar a ${invitado.nombre}?`);
    if (!confirmed) return;
    await removeInvitado(invitado._id);
  }

  return (
    <div className="guests-grid">
      <GuestForm selected={selected} onSave={handleSave} onCancel={() => setSelected(null)} />
      <div className="page-stack">
        {error && <div className="alert error">{error}</div>}
        {loading ? (
          <section className="panel loading-panel">Cargando invitados...</section>
        ) : (
          <GuestList invitados={invitados} onEdit={setSelected} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
