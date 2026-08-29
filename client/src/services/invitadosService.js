import { apiRequest } from './api.js';

export async function fetchInvitados() {
  const data = await apiRequest('/invitados');
  return data.data;
}

export async function createInvitado(payload) {
  const data = await apiRequest('/invitados', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function updateInvitado(id, payload) {
  const data = await apiRequest(`/invitados/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function deleteInvitado(id) {
  await apiRequest(`/invitados/${id}`, {
    method: 'DELETE'
  });
}

export async function consultarQr(qrToken) {
  return apiRequest('/invitados/consultar-qr', {
    method: 'POST',
    body: JSON.stringify({ qrToken })
  });
}

export async function validarQr(qrToken, cantidad = 1) {
  return apiRequest('/invitados/validar-qr', {
    method: 'POST',
    body: JSON.stringify({
      qrToken,
      cantidad
    })
  });
}
