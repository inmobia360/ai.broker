import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: '#161E2E', // Inmobia 360 Charcoal
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
