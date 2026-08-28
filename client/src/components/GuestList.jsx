import React from 'react';
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
      <div className="list-header guest-list-header">
        <div className="guest-list-heading">
          <h2>Lista ({filtered.length}/{invitados.length})</h2>
          <p>Datos cargados desde MongoDB</p>
        </div>

        <label className="search-box guest-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nombre, teléfono o QR"
            aria-label="Buscar invitados"
          />
        </label>
      </div>

      <div className="guest-mobile-list">
        {filtered.map((invitado) => (
          <article className="guest-card" key={invitado._id}>
            <div className="guest-card-main">
              <div className="guest-card-identity">
                <strong>{invitado.nombre}</strong>
                <span>{invitado.telefono || 'Sin teléfono'}</span>
                <small>{invitado.qrToken}</small>
              </div>

              <span className={`status ${invitado.estado.toLowerCase()}`}>
                {invitado.estado}
              </span>
            </div>

            <div className="guest-card-meta">
              <div>
                <span>Accesos</span>
                <strong>{invitado.accesosUsados ?? 0} / {invitado.pases}</strong>
              </div>

              <div>
                <span>Registro</span>
                <strong>{formatDateTime(invitado.fechaRegistro)}</strong>
              </div>

              {invitado.fechaEntrada && (
                <div>
                  <span>Último acceso</span>
                  <strong>{formatDateTime(invitado.fechaEntrada)}</strong>
                </div>
              )}
            </div>

            <div className="guest-card-actions">
              <button type="button" onClick={() => onEdit(invitado)} title="Editar">
                <Edit3 size={17} />
                <span>Editar</span>
              </button>
              <button type="button" onClick={() => onDelete(invitado)} title="Eliminar">
                <Trash2 size={17} />
                <span>Eliminar</span>
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <p className="empty-cell">No hay invitados que coincidan</p>
        )}
      </div>

      <div className="table-wrap guest-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invitado / QR</th>
              <th>Accesos</th>
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
                  <b className="pass-pill">{invitado.accesosUsados ?? 0}/{invitado.pases}</b>
                </td>
                <td>
                  <span className={`status ${invitado.estado.toLowerCase()}`}>
                    {invitado.estado}
                  </span>
                  {invitado.fechaEntrada && (
                    <small>{formatDateTime(invitado.fechaEntrada)}</small>
                  )}
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
