import { Camera, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { QRScanner } from '../components/QRScanner.jsx';
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

  const handleValidate = async (event) => {
    event.preventDefault();

    if (!qrToken.trim() || loading) {
      return;
    }

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
        mensaje: err.message || 'Error al validar el QR',
        invitado: null
      };

      setResult(errorResult);
      setHistory((current) => [errorResult, ...current].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const handleQrScan = useCallback(
    async (decodedText) => {
      if (!decodedText || loading) {
        return;
      }

      setLoading(true);
      setResult(null);

      try {
        const response = await validarQr(decodedText.trim());

        setResult(response);
        setHistory((current) => [response, ...current].slice(0, 20));
        setQrToken('');
      } catch (err) {
        const errorResult = {
          resultado: 'QR_NO_VALIDO',
          mensaje: err.message || 'Error al validar el QR',
          invitado: null
        };

        setResult(errorResult);
        setHistory((current) => [errorResult, ...current].slice(0, 20));
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const ResultIcon = result
    ? resultIcons[result.resultado] || XCircle
    : Camera;

  return (
    <div className="scanner-grid">
      <section className="panel scanner-panel">
        <div className="panel-title">
          <Camera size={23} />

          <div>
            <h2>Control de Entrada</h2>
            <p>Validación mediante cámara y API</p>
          </div>
        </div>

        <div className="camera-container">
          <QRScanner
            onScan={handleQrScan}
            disabled={loading}
          />
        </div>

        <form className="manual-scan" onSubmit={handleValidate}>
          <input
            value={qrToken}
            onChange={(event) => setQrToken(event.target.value)}
            placeholder="Pega qrToken ej: XV-8f72c91a4..."
            disabled={loading}
          />

          <button
            className="primary-button"
            type="submit"
            disabled={loading || !qrToken.trim()}
          >
            {loading ? 'Validando...' : 'Validar QR'}
          </button>
        </form>

        {result && (
          <div
            className={`scan-result ${result.resultado.toLowerCase()}`}
          >
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
        <h2>Últimos escaneos</h2>

        <div className="history-list">
          {history.map((item, index) => (
            <div
              className={`history-item ${item.resultado.toLowerCase()}`}
              key={`${item.resultado}-${index}`}
            >
              <strong>{item.mensaje}</strong>

              <span>
                {item.invitado?.nombre || 'Sin invitado'}
              </span>
            </div>
          ))}

          {history.length === 0 && (
            <p className="muted">
              Aún no hay validaciones
            </p>
          )}
        </div>
      </section>
    </div>
  );
}