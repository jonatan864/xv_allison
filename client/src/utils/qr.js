import QRCode from 'qrcode';

export async function qrTokenToDataUrl(qrToken, size = 260) {
  return QRCode.toDataURL(qrToken, {
    width: size,
    margin: 1,
    color: {
      dark: '#0f2d5e',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });
}
