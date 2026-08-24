import { Save, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const initialForm = {
  nombre: '',
  telefono: '',
  pases: 2
};

export function GuestForm({ selected, onSave, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selected) {
      setForm({
        nombre: selected.nombre,
        telefono: selected.telefono || '',
        pases: selected.pases
      });
    } else {
      setForm(initialForm);
    }
    setError('');
  }, [selected]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onSave({
        ...form,
        pases: Number(form.pases)
      });
      if (!selected) setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel-title">
        <UserPlus size={22} />
        <div>
          <h2>{selected ? 'Editar Invitado' : 'Agregar Invitado'}</h2>
          <p>El QR se genera en backend con token unico</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="guest-form">
        <label>
          Nombre completo *
          <input
            value={form.nombre}
            onChange={(event) => updateField('nombre', event.target.value)}
            placeholder="Ej: Familia Perez o Ana Torres"
            required
          />
        </label>

        <div className="form-grid">
          <label>
            Telefono
            <input
              value={form.telefono}
              onChange={(event) => updateField('telefono', event.target.value)}
              placeholder="999..."
            />
          </label>

          <label>
            Pases
            <select value={form.pases} onChange={(event) => updateField('pases', event.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          {selected && (
            <button className="secondary-button" type="button" onClick={onCancel}>
              <X size={17} />
              Cancelar
            </button>
          )}
          <button className="primary-button" type="submit" disabled={saving}>
            <Save size={18} />
            {saving ? 'Guardando...' : selected ? 'Guardar Cambios' : 'Generar QR + Guardar'}
          </button>
        </div>
      </form>
    </section>
  );
}
