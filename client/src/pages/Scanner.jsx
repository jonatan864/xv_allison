import { Camera, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import { useState } from 'react';
import { validarQr } from '../services/invitadosService.js';

const resultIcons = {
  ACCESO_PERMITIDO: CheckCircle2,
  PASE_YA_UTILIZADO: ShieldAlert,
  QR_NO_VALIDO: XCircle
};

export function Scanner() {
  const [qrToken, setQrToken] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function handleValidate(event) {
    event.preventDefault();
    if (!qrToken.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await validarQr(qrToken.trim());
      setResult(response);
      setHistory((current) => [response, ...current].slice(0, 20));
      setQrToken('');
    } catch (err) {
      const errorResult = {
        resultado: 'QR_NO_VALIDO',
        mensaje: err.message,
        invitado: null
      };
      setResult(errorResult);
      setHistory((current) => [errorResult, ...current].slice(0, 20));
    } finally {
      setLoading(false);
    }
  }

  const ResultIcon = result ? resultIcons[result.resultado] || XCircle : Camera;

  return (
    <div className="scanner-grid">
      <section className="panel scanner-panel">
        <div className="panel-title">
          <Camera size={23} />
          <div>
            <h2>Control de Entrada</h2>
            <p>Validacion contra MongoDB mediante API</p>
          </div>
        </div>

        <div className="camera-placeholder">
          <Camera size={48} />
          <strong>Camara pendiente para FASE 5</strong>
          <span>Por ahora valida manualmente el token QR real</span>
        </div>

        <form className="manual-scan" onSubmit={handleValidate}>
          <input
            value={qrToken}
            onChange={(event) => setQrToken(event.target.value)}
            placeholder="Pega qrToken ej: XV-8f72c91a4..."
          />
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Validar QR'}
          </button>
        </form>

        {result && (
          <div className={`scan-result ${result.resultado.toLowerCase()}`}>
            <ResultIcon size={30} />
            <strong>{result.mensaje}</strong>
            {result.invitado && (
              <span>
                {result.invitado.nombre} • {result.invitado.pases} pases
              </span>
            )}
          </div>
        )}
      </section>

      <section className="panel history-panel">
        <h2>Ultimos escaneos</h2>
        <div className="history-list">
          {history.map((item, index) => (
            <div className={`history-item ${item.resultado.toLowerCase()}`} key={`${item.resultado}-${index}`}>
              <strong>{item.mensaje}</strong>
              <span>{item.invitado?.nombre || 'Sin invitado'}</span>
            </div>
          ))}
          {history.length === 0 && <p className="muted">Aun no hay validaciones</p>}
        </div>
      </section>
    </div>
  );
}
