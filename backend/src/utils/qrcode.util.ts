import QRCode from 'qrcode';

export const generateMaterielQrCode = async (codeMateriel: string): Promise<string> => {
  return QRCode.toDataURL(codeMateriel, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
};

export const generateMaterielQrCodeBuffer = async (codeMateriel: string): Promise<Buffer> => {
  return QRCode.toBuffer(codeMateriel, {
    width: 300,
    margin: 2,
    type: 'png',
  });
};
