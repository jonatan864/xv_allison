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
import {
  consultarQr,
  validarQr
} from '../services/invitadosService.js';

const resultIcons = {
  ACCESO_PERMITIDO: CheckCircle2,
  QR_CADUCADO: ShieldAlert,
  QR_NO_VALIDO: XCircle,
  ACCESO_INSUFICIENTE: ShieldAlert
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
  const [pendingQr, setPendingQr] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cantidadError, setCantidadError] = useState('');

  const addHistory = (response) => {
    setHistory((current) => [
      response,
      ...current
    ].slice(0, 20));
  };

  const processQr = async (token) => {
    if (!token?.trim() || loading || pendingQr) {
      return;
    }

    setLoading(true);
    setResult(null);
    setCantidadError('');

    try {
      // Primero consultamos el QR sin consumir ningún acceso.
      // Esto permite preguntar cuántas personas llegaron juntas.
      const response = await consultarQr(token.trim());

      if (response.resultado !== 'QR_DISPONIBLE') {
        setResult(response);
        addHistory(response);
        setQrToken('');
        return;
      }

      setPendingQr({
        token: token.trim(),
        response
      });
      setCantidad(1);
      setQrToken('');
    } catch (err) {
      const errorResult = buildErrorResult(err);
      setResult(errorResult);
      addHistory(errorResult);
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
    [loading, pendingQr]
  );

  const handleConfirmAccesses = async () => {
    if (!pendingQr || loading) {
      return;
    }

    const max = Number(pendingQr.response.accesosRestantes || 0);
    const value = Number(cantidad);

    if (!Number.isInteger(value) || value < 1) {
      setCantidadError('Ingresa un número entero mayor o igual a 1.');
      return;
    }

    if (value > max) {
      setCantidadError(
        `No puedes quemar ${value} pases. Solo hay ${max} disponibles.`
      );
      return;
    }

    setLoading(true);
    setCantidadError('');

    try {
      const response = await validarQr(
        pendingQr.token,
        value
      );

      setResult(response);
      addHistory(response);
      setPendingQr(null);
      setCantidad(1);
    } catch (err) {
      const errorResult = buildErrorResult(err);
      setResult(errorResult);
      addHistory(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAccesses = () => {
    setPendingQr(null);
    setCantidad(1);
    setCantidadError('');
  };

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
            disabled={loading || Boolean(pendingQr)}
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
            disabled={loading || Boolean(pendingQr)}
          />

          <button
            className="primary-button"
            type="submit"
            disabled={
              loading ||
              Boolean(pendingQr) ||
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
                  Acceso{result.cantidadAccesos > 1 ? 's' : ''}{' '}
                  {result.accesosUsados} de{' '}
                  {result.pases}
                  {result.cantidadAccesos > 1 && (
                    <> · Se quemaron {result.cantidadAccesos}</>
                  )}
                </span>
              )}

              {isExpired && (
                <span className="scan-progress">
                  Accesos utilizados:{' '}
                  {result.accesosUsados} de{' '}
                  {result.pases}
                </span>
              )}

              {result.resultado === 'QR_NO_VALIDO' &&
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

              {item.resultado === 'ACCESO_PERMITIDO' && (
                <small>
                  Acceso{item.cantidadAccesos > 1 ? 's' : ''}{' '}
                  {item.accesosUsados} de {item.pases}
                  {item.cantidadAccesos > 1 &&
                    ` · ${item.cantidadAccesos} quemados`}
                </small>
              )}

              {item.resultado === 'QR_CADUCADO' && (
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

      {pendingQr && (
        <div className="scan-access-modal" role="dialog" aria-modal="true">
          <div className="scan-access-modal-backdrop" />

          <div className="scan-access-modal-content">
            <div className="scan-access-modal-header">
              <CheckCircle2 size={28} />
              <div>
                <h3>Invitado encontrado</h3>
                <p>{pendingQr.response.invitado?.nombre}</p>
              </div>
            </div>

            <p className="scan-access-question">
              ¿Cuántos pases/accesos deseas quemar para este invitado?
            </p>

            <div className="scan-access-available">
              Pases disponibles: <strong>{pendingQr.response.accesosRestantes}</strong>
            </div>

            <input
              className="scan-access-input"
              type="number"
              min="1"
              max={pendingQr.response.accesosRestantes}
              step="1"
              value={cantidad}
              onChange={(event) => {
                setCantidad(event.target.value);
                setCantidadError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleConfirmAccesses();
                }
              }}
              autoFocus
              disabled={loading}
            />

            {cantidadError && (
              <p className="scan-access-error">
                {cantidadError}
              </p>
            )}

            <div className="scan-access-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancelAccesses}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleConfirmAccesses}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Quemar accesos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
