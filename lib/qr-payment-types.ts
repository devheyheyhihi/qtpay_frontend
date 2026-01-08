// QR 결제 데이터 타입 정의

export interface QRPaymentData {
  version: '1.0';
  type: 'QCC_PAYMENT';
  address: string;
  amount: string;
  timestamp: number;
  expiry?: number;
}

export function encodeQRPayment(address: string, amount: string): string {
  const data: QRPaymentData = {
    version: '1.0',
    type: 'QCC_PAYMENT',
    address,
    amount,
    timestamp: Date.now(),
    expiry: Date.now() + 30 * 60 * 1000, // 30분 후 만료
  };
  return JSON.stringify(data);
}

export function decodeQRPayment(qrData: string): QRPaymentData | null {
  try {
    const data = JSON.parse(qrData) as QRPaymentData;
    
    // 유효성 검증
    if (data.version !== '1.0' || data.type !== 'QCC_PAYMENT') {
      return null;
    }
    
    // 만료 체크
    if (data.expiry && Date.now() > data.expiry) {
      throw new Error('QR 코드가 만료되었습니다');
    }
    
    return data;
  } catch (error) {
    console.error('QR 데이터 파싱 실패:', error);
    return null;
  }
}

