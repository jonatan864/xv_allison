import { Camera, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { QRScanner } from '../components/QRScanner.jsx';
import { consultarQr, validarQr } from '../services/invitadosService.js';

const resultIcons = { ACCESO_PERMITIDO: CheckCircle2, QR_CADUCADO: ShieldAlert, QR_NO_VALIDO: XCircle, ACCESO_INSUFICIENTE: ShieldAlert };

function buildErrorResult(err) {
  return { resultado: 'QR_NO_VALIDO', mensaje: err?.message || 'Error al validar el QR', accesosUsados: 0, pases: 0, accesosRestantes: 0, invitado: null };
}

export function Scanner() {
  const [qrToken, setQrToken] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [pendingQr, setPendingQr] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cantidadError, setCantidadError] = useState('');
  const [confirmAccess, setConfirmAccess] = useState(null);
  const [resultModal, setResultModal] = useState(null);

  const addHistory = (response) => setHistory((current) => [response, ...current].slice(0, 20));
  const openResult = (response) => { setResult(response); setResultModal(response); addHistory(response); };

  const processQr = async (token) => {
    if (!token?.trim() || loading || pendingQr || confirmAccess || resultModal) return;
    setLoading(true); setResult(null); setCantidadError('');
    try {
      const response = await consultarQr(token.trim());
      if (response.resultado !== 'QR_DISPONIBLE') { openResult(response); setQrToken(''); return; }
      setPendingQr({ token: token.trim(), response }); setCantidad(1); setQrToken('');
    } catch (err) { openResult(buildErrorResult(err)); }
    finally { setLoading(false); }
  };

  const handleValidate = async (event) => { event.preventDefault(); await processQr(qrToken); };
  const handleQrScan = useCallback(async (decodedText) => { await processQr(decodedText); }, [loading, pendingQr, confirmAccess, resultModal]);

  // Primero se elige la cantidad; todavía no se quema nada.
  const handleRequestConfirmation = () => {
    if (!pendingQr || loading) return;
    const max = Number(pendingQr.response.accesosRestantes || 0);
    const value = Number(cantidad);
    if (!Number.isInteger(value) || value < 1) return setCantidadError('Ingresa un número entero mayor o igual a 1.');
    if (value > max) return setCantidadError(`No puedes quemar ${value} pases. Solo hay ${max} disponibles.`);
    setCantidadError('');
    setConfirmAccess({ token: pendingQr.token, cantidad: value, invitado: pendingQr.response.invitado, disponibles: max });
  };

  // El consumo real sucede únicamente después de esta confirmación.
  const handleConfirmAccesses = async () => {
    if (!confirmAccess || loading) return;
    setLoading(true);
    try {
      const response = await validarQr(confirmAccess.token, confirmAccess.cantidad);
      setPendingQr(null); setConfirmAccess(null); setCantidad(1); openResult(response);
    } catch (err) {
      setPendingQr(null); setConfirmAccess(null); openResult(buildErrorResult(err));
    } finally { setLoading(false); }
  };

  const handleCancelAccesses = () => { setPendingQr(null); setCantidad(1); setCantidadError(''); };
  const handleBackToQuantity = () => setConfirmAccess(null);
  const handleAcceptResult = () => { setResultModal(null); setResult(null); setQrToken(''); };

  const ResultIcon = resultModal ? resultIcons[resultModal.resultado] || XCircle : Camera;
  const isSuccess = resultModal?.resultado === 'ACCESO_PERMITIDO';
  const isExpired = resultModal?.resultado === 'QR_CADUCADO';

  return (
    <div className="scanner-grid">
      <section className="panel scanner-panel">
        <div className="panel-title"><Camera size={23} /><div><h2>Control de Entrada</h2><p>Validación mediante cámara y API</p></div></div>
        <div className="camera-container"><QRScanner onScan={handleQrScan} disabled={loading || Boolean(pendingQr) || Boolean(confirmAccess) || Boolean(resultModal)} /></div>
        <form className="manual-scan" onSubmit={handleValidate}>
          <input value={qrToken} onChange={(event) => setQrToken(event.target.value)} placeholder="Pega qrToken ej: XV-8f72c91a4..." disabled={loading || Boolean(pendingQr) || Boolean(confirmAccess) || Boolean(resultModal)} />
          <button className="primary-button" type="submit" disabled={loading || Boolean(pendingQr) || Boolean(confirmAccess) || Boolean(resultModal) || !qrToken.trim()}>{loading ? 'Validando...' : 'Validar QR'}</button>
        </form>
      </section>

      <section className="panel history-panel"><h2>Últimos escaneos</h2><div className="history-list">
        {history.map((item, index) => <div className={['history-item', item.resultado.toLowerCase()].join(' ')} key={`${item.resultado}-${index}`}><strong>{item.mensaje}</strong><span>{item.invitado?.nombre || 'Sin invitado'}</span>{item.resultado === 'ACCESO_PERMITIDO' && <small>Acceso{item.cantidadAccesos > 1 ? 's' : ''} {item.accesosUsados} de {item.pases}{item.cantidadAccesos > 1 && ` · ${item.cantidadAccesos} quemados`}</small>}</div>)}
        {history.length === 0 && <p className="muted">Aún no hay validaciones</p>}
      </div></section>

      {/* 1. ALERTA: cantidad */}
      {pendingQr && !confirmAccess && !resultModal && <div className="scan-alert-overlay" role="dialog" aria-modal="true"><div className="scan-alert-card">
        <div className="scan-alert-icon success"><CheckCircle2 size={30} /></div><span className="scan-alert-kicker">QR VÁLIDO</span><h3>{pendingQr.response.invitado?.nombre}</h3>
        <p className="scan-alert-question">¿Cuántos pases deseas quemar para este invitado?</p>
        <div className="scan-available-box"><span>Pases disponibles</span><strong>{pendingQr.response.accesosRestantes}</strong></div>
        <input className="scan-alert-number" type="number" min="1" max={pendingQr.response.accesosRestantes} step="1" value={cantidad} onChange={(event) => { setCantidad(event.target.value); setCantidadError(''); }} autoFocus disabled={loading} />
        {cantidadError && <p className="scan-alert-error">{cantidadError}</p>}
        <div className="scan-alert-actions"><button type="button" className="secondary-button" onClick={handleCancelAccesses} disabled={loading}>Cancelar</button><button type="button" className="primary-button" onClick={handleRequestConfirmation} disabled={loading}>Continuar</button></div>
      </div></div>}

      {/* 2. ALERTA: confirmación */}
      {confirmAccess && !resultModal && <div className="scan-alert-overlay" role="dialog" aria-modal="true"><div className="scan-alert-card scan-confirm-card">
        <div className="scan-alert-icon warning"><ShieldAlert size={30} /></div><span className="scan-alert-kicker">CONFIRMAR ACCESO</span><h3>¿Quemar {confirmAccess.cantidad} {confirmAccess.cantidad === 1 ? 'acceso' : 'accesos'}?</h3>
        <p className="scan-confirm-guest">{confirmAccess.invitado?.nombre}</p>
        <div className="scan-confirm-count"><strong>{confirmAccess.cantidad}</strong><span>{confirmAccess.cantidad === 1 ? 'pase será descontado' : 'pases serán descontados'}</span></div>
        <p className="scan-confirm-note">Esta acción registrará los accesos en el sistema.</p>
        <div className="scan-alert-actions"><button type="button" className="secondary-button" onClick={handleBackToQuantity} disabled={loading}>Regresar</button><button type="button" className="primary-button" onClick={handleConfirmAccesses} disabled={loading}>{loading ? 'Procesando...' : 'Sí, quemar accesos'}</button></div>
      </div></div>}

      {/* 3. MODAL DE RESULTADO: aceptar libera nuevamente el scanner */}
      {resultModal && <div className="scan-alert-overlay result-overlay" role="dialog" aria-modal="true"><div className={`scan-alert-card scan-result-card ${isSuccess ? 'result-success' : 'result-error'}`}>
        <div className={`scan-result-icon ${isSuccess ? 'success' : 'warning'}`}><ResultIcon size={44} /></div>
        <span className="scan-alert-kicker">{isSuccess ? 'ACCESO REGISTRADO' : 'RESULTADO DEL ESCANEO'}</span><h3>{resultModal.mensaje}</h3>
        {resultModal.invitado && <p className="scan-result-guest">{resultModal.invitado.nombre}</p>}
        {isSuccess && <div className="scan-result-summary"><strong>{resultModal.cantidadAccesos || 1}</strong><span>{(resultModal.cantidadAccesos || 1) === 1 ? 'acceso quemado' : 'accesos quemados'}</span><small>Utilizados: {resultModal.accesosUsados} de {resultModal.pases}</small></div>}
        {isExpired && <p className="scan-result-detail">Accesos utilizados: {resultModal.accesosUsados} de {resultModal.pases}</p>}
        <button type="button" className="primary-button scan-result-accept" onClick={handleAcceptResult} autoFocus>Aceptar</button>
      </div></div>}
    </div>
  );
}
