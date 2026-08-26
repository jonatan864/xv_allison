import React, { useEffect, useRef } from 'react';
import {
  Html5Qrcode,
  Html5QrcodeScannerState
} from 'html5-qrcode';

export function QRScanner({ onScan, disabled = false }) {
  const scannerRef = useRef(null);
  const scanningRef = useRef(false);
  const lastScanRef = useRef('');
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    // El efecto se ejecuta después de que React haya montado el DOM.
    // Si está deshabilitado, no creamos la instancia del scanner.
    if (disabled) {
      return undefined;
    }

    const readerElement = document.getElementById('qr-reader');

    if (!readerElement) {
      console.error('No se encontró el elemento #qr-reader en el DOM.');
      return undefined;
    }

    let cancelled = false;
    let startPromise = null;

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    scanningRef.current = false;

    const handleScan = (decodedText) => {
      if (cancelled || !decodedText) {
        return;
      }

      if (lastScanRef.current === decodedText) {
        return;
      }

      lastScanRef.current = decodedText;
      onScanRef.current?.(decodedText);
    };

    const startScanner = async () => {
      try {
        startPromise = scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250
            }
          },
          handleScan,
          () => {
            // Los errores de lectura son normales mientras la cámara busca un QR.
          }
        );

        await startPromise;

        if (cancelled) {
          // El componente pudo desmontarse mientras start() estaba pendiente.
          // La limpieza esperará esta promesa y detendrá el scanner de forma segura.
          return;
        }

        scanningRef.current = true;
      } catch (error) {
        // Si React desmontó el componente mientras start() estaba pendiente,
        // no mostramos el error como un fallo de la interfaz.
        if (!cancelled) {
          console.error('Error al iniciar la cámara:', error);
        }

        scanningRef.current = false;
      }
    };

    startScanner();

    return () => {
      cancelled = true;

      const cleanup = async () => {
        // Importante: esperar a que start() termine antes de consultar el estado
        // o llamar a stop(). Esto evita "Cannot stop, scanner is not running or paused".
        if (startPromise) {
          try {
            await startPromise;
          } catch {
            // Si start() falló, no hay nada que detener.
          }
        }

        if (scannerRef.current !== scanner) {
          return;
        }

        try {
          const state = scanner.getState();

          if (
            state === Html5QrcodeScannerState.SCANNING ||
            state === Html5QrcodeScannerState.PAUSED
          ) {
            await scanner.stop();
          }
        } catch (error) {
          // La limpieza nunca debe provocar que React desmonte la interfaz.
          console.warn('No fue posible detener el escáner:', error);
        } finally {
          try {
            // clear() solo se ejecuta después de que stop() haya terminado.
            await scanner.clear();
          } catch (error) {
            console.warn('No fue posible limpiar el escáner:', error);
          }

          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }

          scanningRef.current = false;
        }
      };

      cleanup();
    };
  }, [disabled]);

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader"></div>

      <div className="qr-scanner-overlay">
        <div className="qr-frame">
          <span className="corner top-left"></span>
          <span className="corner top-right"></span>
          <span className="corner bottom-left"></span>
          <span className="corner bottom-right"></span>
        </div>
      </div>
    </div>
  );
}
