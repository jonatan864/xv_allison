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
      if (cancelled || !decodedText) return;

      if (lastScanRef.current === decodedText) return;

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

        if (!cancelled) {
          scanningRef.current = true;
        }
      } catch (error) {
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
        if (startPromise) {
          try {
            await startPromise;
          } catch {
            // La inicialización falló; no hay nada que detener.
          }
        }

        if (scannerRef.current !== scanner) return;

        try {
          const state = scanner.getState();

          if (
            state === Html5QrcodeScannerState.SCANNING ||
            state === Html5QrcodeScannerState.PAUSED
          ) {
            await scanner.stop();
          }
        } catch (error) {
          console.warn('No fue posible detener el escáner:', error);
        } finally {
          try {
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
      <style>{`
        .qr-scanner-container {
          position: relative;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 4 / 3;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 12px;
          background: #000;
          isolation: isolate;
        }

        .qr-scanner-container #qr-reader {
          position: absolute;
          inset: 0;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          overflow: hidden !important;
          background: #000;
        }

        .qr-scanner-container #qr-reader > div {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
        }

        .qr-scanner-container #qr-reader video,
        .qr-scanner-container video {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-width: 100% !important;
          min-height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          object-fit: cover !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
        }

        .qr-scanner-container #qr-reader canvas,
        .qr-scanner-container #qr-reader img {
          display: none !important;
        }

        .qr-scanner-overlay {
          position: absolute;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-scanner-overlay .qr-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(250px, 70%);
          aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%);
          border: 2px solid rgba(255, 255, 255, 0.95);
          border-radius: 14px;
          z-index: 21;
          box-sizing: border-box;
        }

        .qr-scanner-overlay .corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: #fff;
          border-style: solid;
          border-width: 0;
        }

        .qr-scanner-overlay .corner.top-left {
          top: -2px;
          left: -2px;
          border-top-width: 4px;
          border-left-width: 4px;
          border-top-left-radius: 12px;
        }

        .qr-scanner-overlay .corner.top-right {
          top: -2px;
          right: -2px;
          border-top-width: 4px;
          border-right-width: 4px;
          border-top-right-radius: 12px;
        }

        .qr-scanner-overlay .corner.bottom-left {
          bottom: -2px;
          left: -2px;
          border-bottom-width: 4px;
          border-left-width: 4px;
          border-bottom-left-radius: 12px;
        }

        .qr-scanner-overlay .corner.bottom-right {
          right: -2px;
          bottom: -2px;
          border-bottom-width: 4px;
          border-right-width: 4px;
          border-bottom-right-radius: 12px;
        }
      `}</style>

      <div id="qr-reader" aria-label="Visor de cámara para escanear códigos QR"></div>

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
