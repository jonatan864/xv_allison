import {
  Camera,
  CheckCircle2,
  ShieldAlert,
  XCircle
} from 'lucide-react';

import React, {
  useCallback,
  useState
} from 'react';

import { QRScanner } from '../components/QRScanner.jsx';
import { validarQr } from '../services/invitadosService.js';

const resultIcons = {
  ACCESO_PERMITIDO: CheckCircle2,
  QR_CADUCADO: ShieldAlert,
  QR_NO_VALIDO: XCircle
};

function buildErrorResult(err) {
  return {
    resultado: 'QR_NO_VALIDO',
    mensaje: err?.message || 'Error al validar el QR',
    accesosUsados: 0,
    pases: 0,
    accesosRestantes: 0,
    invitado: null
  };
}

export function Scanner() {
  const [qrToken, setQrToken] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const processQr = async (token) => {
    if (!token?.trim() || loading) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await validarQr(token.trim());

      setResult(response);

      setHistory((current) => [
        response,
        ...current
      ].slice(0, 20));

      setQrToken('');
    } catch (err) {
      const errorResult = buildErrorResult(err);

      setResult(errorResult);

      setHistory((current) => [
        errorResult,
        ...current
      ].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (event) => {
    event.preventDefault();

    await processQr(qrToken);
  };

  const handleQrScan = useCallback(
    async (decodedText) => {
      await processQr(decodedText);
    },
    [loading]
  );

  const ResultIcon = result
    ? resultIcons[result.resultado] || XCircle
    : Camera;

  const isSuccess =
    result?.resultado === 'ACCESO_PERMITIDO';

  const isExpired =
    result?.resultado === 'QR_CADUCADO';

  return (
    <div className="scanner-grid">
      <section className="panel scanner-panel">
        <div className="panel-title">
          <Camera size={23} />

          <div>
            <h2>Control de Entrada</h2>
            <p>
              Validación mediante cámara y API
            </p>
          </div>
        </div>

        <div className="camera-container">
          <QRScanner
            onScan={handleQrScan}
            disabled={loading}
          />
        </div>

        <form
          className="manual-scan"
          onSubmit={handleValidate}
        >
          <input
            value={qrToken}
            onChange={(event) =>
              setQrToken(event.target.value)
            }
            placeholder="Pega qrToken ej: XV-8f72c91a4..."
            disabled={loading}
          />

          <button
            className="primary-button"
            type="submit"
            disabled={
              loading ||
              !qrToken.trim()
            }
          >
            {loading
              ? 'Validando...'
              : 'Validar QR'}
          </button>
        </form>

        {result && (
          <div
            className={[
              'scan-result',
              result.resultado.toLowerCase(),
              isSuccess
                ? 'scan-result-success'
                : '',
              isExpired
                ? 'scan-result-expired'
                : ''
            ].join(' ')}
          >
            <ResultIcon size={32} />

            <div className="scan-result-content">
              <strong>
                {result.mensaje}
              </strong>

              {result.invitado && (
                <span className="scan-guest-name">
                  {result.invitado.nombre}
                </span>
              )}

              {isSuccess && (
                <span className="scan-progress">
                  Acceso {result.accesosUsados} de{' '}
                  {result.pases}
                </span>
              )}

              {isExpired && (
                <span className="scan-progress">
                  Accesos utilizados:{' '}
                  {result.accesosUsados} de{' '}
                  {result.pases}
                </span>
              )}

              {result.resultado ===
                'QR_NO_VALIDO' &&
                result.invitado && (
                  <span className="scan-progress">
                    Accesos utilizados:{' '}
                    {result.accesosUsados} de{' '}
                    {result.pases}
                  </span>
                )}
            </div>
          </div>
        )}
      </section>

      <section className="panel history-panel">
        <h2>Últimos escaneos</h2>

        <div className="history-list">
          {history.map((item, index) => (
            <div
              className={[
                'history-item',
                item.resultado.toLowerCase()
              ].join(' ')}
              key={`${item.resultado}-${index}`}
            >
              <strong>
                {item.mensaje}
              </strong>

              <span>
                {item.invitado?.nombre ||
                  'Sin invitado'}
              </span>

              {item.resultado ===
                'ACCESO_PERMITIDO' && (
                <small>
                  Acceso {item.accesosUsados}{' '}
                  de {item.pases}
                </small>
              )}

              {item.resultado ===
                'QR_CADUCADO' && (
                <small>
                  {item.accesosUsados} de{' '}
                  {item.pases} accesos utilizados
                </small>
              )}
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