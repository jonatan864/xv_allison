export function buildInvitationText(invitado) {
  return [
    `Hola ${invitado.nombre}`,
    'Te compartimos tu invitacion a los XV años de Alison.',
    'Presenta este codigo QR en la entrada.',
    `Pases: ${invitado.pases}`,
    'Te esperamos!'
  ].join('\n');
}

export function openWhatsAppText(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}
