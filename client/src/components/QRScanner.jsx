import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function QRScanner({ onScan, disabled = false }) {
  const scannerRef = useRef(null);
  const scanningRef = useRef(false);
  const lastScanRef = useRef('');
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');

    scannerRef.current = scanner;

    const startScanner = async () => {
      if (disabled || scanningRef.current) {
        return;
      }

      try {
        scanningRef.current = true;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250
            }
          },
          (decodedText) => {
            if (!decodedText) {
              return;
            }

            if (lastScanRef.current === decodedText) {
              return;
            }

            lastScanRef.current = decodedText;

            onScanRef.current(decodedText);
          },
          () => {
            // Los errores de lectura son normales mientras
            // la cámara busca un QR.
          }
        );
      } catch (error) {
        console.error('Error al iniciar la cámara:', error);
        scanningRef.current = false;
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scanningRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
            scanningRef.current = false;
          });
      }
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