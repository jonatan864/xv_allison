import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createInvitado,
  deleteInvitado,
  fetchInvitados,
  updateInvitado
} from '../services/invitadosService.js';
import { getSocket } from '../services/socket.js';

function upsertInvitado(list, invitado) {
  const exists = list.some((item) => item._id === invitado._id);
  if (exists) {
    return list.map((item) => (item._id === invitado._id ? invitado : item));
  }
  return [invitado, ...list];
}

export function useInvitados(enabled = true) {
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      setInvitados(await fetchInvitados());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();
    socket.connect();

    const onUpsert = (invitado) => setInvitados((current) => upsertInvitado(current, invitado));
    const onDelete = ({ _id }) => setInvitados((current) => current.filter((item) => item._id !== _id));

    socket.on('invitado_creado', onUpsert);
    socket.on('invitado_actualizado', onUpsert);
    socket.on('invitado_validado', onUpsert);
    socket.on('invitado_eliminado', onDelete);
    socket.on('connect_error', () => setError('No se pudo conectar con tiempo real'));

    return () => {
      socket.off('invitado_creado', onUpsert);
      socket.off('invitado_actualizado', onUpsert);
      socket.off('invitado_validado', onUpsert);
      socket.off('invitado_eliminado', onDelete);
      socket.off('connect_error');
    };
  }, [enabled]);

  async function addInvitado(payload) {
    const invitado = await createInvitado(payload);
    setInvitados((current) => upsertInvitado(current, invitado));
    return invitado;
  }

  async function editInvitado(id, payload) {
    const invitado = await updateInvitado(id, payload);
    setInvitados((current) => upsertInvitado(current, invitado));
    return invitado;
  }

  async function removeInvitado(id) {
    await deleteInvitado(id);
    setInvitados((current) => current.filter((item) => item._id !== id));
  }

  const stats = useMemo(() => {
    const totalPases = invitados.reduce((sum, item) => sum + item.pases, 0);
    const usados = invitados.filter((item) => item.estado === 'USADO').length;
    const vigentes = invitados.filter((item) => item.estado === 'VIGENTE').length;

    return {
      invitados: invitados.length,
      totalPases,
      usados,
      vigentes
    };
  }, [invitados]);

  return {
    invitados,
    loading,
    error,
    stats,
    load,
    addInvitado,
    editInvitado,
    removeInvitado
  };
}
