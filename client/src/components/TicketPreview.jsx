import { Download, MessageCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useEffect, useRef, useState } from 'react';
import { qrTokenToDataUrl } from '../utils/qr.js';
import { buildInvitationText, openWhatsAppText } from '../utils/share.js';

export function TicketPreview({ invitado }) {
  const ticketRef = useRef(null);
  const [qrUrl, setQrUrl] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    if (!invitado) {
      setQrUrl('');
      return;
    }

    qrTokenToDataUrl(invitado.qrToken).then((url) => {
      if (alive) setQrUrl(url);
    });

    return () => {
      alive = false;
    };
  }, [invitado]);

  async function ticketToBlob() {
    if (!ticketRef.current) return null;
    const dataUrl = await toPng(ticketRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });
    const response = await fetch(dataUrl);
    return response.blob();
  }

  async function downloadTicket() {
    if (!invitado) return;
    setBusy(true);
    try {
      const blob = await ticketToBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ticket_${invitado.nombre.replace(/\s+/g, '_')}_${invitado.qrToken}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function shareTicket() {
    if (!invitado) return;
    const text = buildInvitationText(invitado);

    try {
      const blob = await ticketToBlob();
      const file = new File([blob], `Ticket_${invitado.nombre}.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: 'Invitacion XV Allison',
          text,
          files: [file]
        });
        return;
      }
    } catch {
      // Fallback below.
    }

    openWhatsAppText(text);
  }

  if (!invitado) {
    return (
      <section className="panel empty-ticket">
        <p>Selecciona un invitado para ver su ticket</p>
      </section>
    );
  }

  return (
    <section className="ticket-area">
      <article className="ticket-card" ref={ticketRef}>
        <div className="ticket-ribbon" />
        <div className="ticket-head">
          <p>XV ANOS • MARIPOSAS AZULES</p>
          <h2>MIS XV ANOS</h2>
          <h1>ALLISON</h1>
        </div>

        <div className="ticket-guest">
          <span>INVITACION PARA</span>
          <strong>{invitado.nombre}</strong>
          <b>{invitado.pases} {invitado.pases === 1 ? 'PASE' : 'PASES'}</b>
        </div>

        <div className="ticket-details">
          <div>
            <span>MISA</span>
            <strong>4:00 PM</strong>
            <p>Iglesia del Senor de las Angustias</p>
          </div>
          <div>
            <span>FIESTA</span>
            <strong>5:00 PM</strong>
            <p>Salon La Palapa del Puas</p>
          </div>
        </div>

        <div className="qr-box">{qrUrl && <img src={qrUrl} alt={`QR ${invitado.nombre}`} />}</div>
        <code>{invitado.qrToken}</code>
        <p className="ticket-note">Valido solo el 19 Sept 2026 - Un solo ingreso</p>
        <div className="ticket-foot">DISENADO CON AMOR • XV ALLISON</div>
      </article>

      <div className="ticket-actions">
        <button className="primary-button" type="button" onClick={downloadTicket} disabled={busy}>
          <Download size={18} />
          Descargar PNG
        </button>
        <button className="whatsapp-button" type="button" onClick={shareTicket}>
          <MessageCircle size={18} />
          Compartir invitacion
        </button>
      </div>
    </section>
  );
}
