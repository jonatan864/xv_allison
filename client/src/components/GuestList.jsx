import { Edit3, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDateTime } from '../utils/date.js';

export function GuestList({ invitados, onEdit, onDelete }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return invitados;

    return invitados.filter((invitado) => {
      return (
        invitado.nombre.toLowerCase().includes(normalized) ||
        invitado.telefono?.toLowerCase().includes(normalized) ||
        invitado.qrToken.toLowerCase().includes(normalized)
      );
    });
  }, [invitados, query]);

  return (
    <section className="panel list-panel">
      <div className="list-header">
        <div>
          <h2>Lista ({filtered.length}/{invitados.length})</h2>
          <p>Datos cargados desde MongoDB</p>
        </div>
        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nombre, telefono o QR"
          />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invitado / QR</th>
              <th>Pases</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invitado) => (
              <tr key={invitado._id}>
                <td>
                  <strong>{invitado.nombre}</strong>
                  <span>{invitado.qrToken}</span>
                  <small>{invitado.telefono || 'Sin telefono'}</small>
                </td>
                <td>
                  <b className="pass-pill">{invitado.pases}</b>
                </td>
                <td>
                  <span className={`status ${invitado.estado.toLowerCase()}`}>{invitado.estado}</span>
                  {invitado.fechaEntrada && <small>{formatDateTime(invitado.fechaEntrada)}</small>}
                </td>
                <td>{formatDateTime(invitado.fechaRegistro)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => onEdit(invitado)} title="Editar">
                      <Edit3 size={17} />
                    </button>
                    <button type="button" onClick={() => onDelete(invitado)} title="Eliminar">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-cell">
                  No hay invitados que coincidan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
