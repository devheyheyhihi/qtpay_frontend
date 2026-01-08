/**
 * PrivateKey 보안 강화 사용 예시
 */

const { PrivateKeySecurityManager } = require('./secureKeyStorage');
const { sendSecureTransaction } = require('./secureTransaction');

// ============================================
// 1. 키 저장 (최초 1회)
// ============================================

async function setupWallet() {
  const keyManager = new PrivateKeySecurityManager();
  
  // 사용자가 지갑 생성 또는 기존 키 입력
  const privateKey = '0x1234567890abcdef...'; // 실제 privateKey
  const userPassword = 'user-secure-password'; // 사용자 비밀번호
  
  // 키를 암호화하여 Secure Storage에 저장
  // 생체 인증 자동 요구됨
  await keyManager.savePrivateKey('my_wallet', privateKey, userPassword);
  
  console.log('지갑이 안전하게 저장되었습니다.');
}

// ============================================
// 2. 트랜잭션 전송 (보안 강화)
// ============================================

async function sendPayment() {
  const keyId = 'my_wallet';
  const password = 'user-secure-password';
  const toAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const amount = '100'; // QT 코인
  
  try {
    // 보안 강화된 트랜잭션 전송
    // 내부적으로:
    // 1. 생체 인증 요구
    // 2. 비밀번호로 키 복호화
    // 3. 트랜잭션 실행
    // 4. 사용 후 즉시 키 제거
    const result = await sendSecureTransaction({
      keyId,
      password,
      toAddress,
      amount,
    });
    
    console.log('트랜잭션 성공:', result);
    return result;
    
  } catch (error) {
    console.error('트랜잭션 실패:', error);
    throw error;
  }
}

// ============================================
// 3. QR 코드 결제 시나리오
// ============================================

interface QRPaymentData {
  marketAddress: string;
  amount: string;
  orderId: string;
  description?: string;
}

async function processQRPayment(
  qrData: QRPaymentData,
  payerKeyId: string,
  payerPassword: string
) {
  try {
    // 1. QR 코드 정보 확인
    console.log('결제 정보:');
    console.log('- 받는 주소:', qrData.marketAddress);
    console.log('- 금액:', qrData.amount, 'QT');
    console.log('- 주문 ID:', qrData.orderId);
    console.log('- 설명:', qrData.description);
    
    // 2. 사용자 확인 (UI에서 처리)
    // const confirmed = await showPaymentConfirmation(qrData);
    // if (!confirmed) throw new Error('결제 취소됨');
    
    // 3. 보안 강화된 트랜잭션 전송
    const result = await sendSecureTransaction({
      keyId: payerKeyId,
      password: payerPassword,
      toAddress: qrData.marketAddress,
      amount: qrData.amount,
    });
    
    // 4. 결제 완료 처리
    console.log('결제 완료!');
    console.log('트랜잭션 해시:', result.txHash);
    
    return {
      success: true,
      txHash: result.txHash,
      orderId: qrData.orderId,
    };
    
  } catch (error) {
    console.error('QR 결제 실패:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// 4. 앱 생명주기 관리
// ============================================

// React Native 예시
import { AppState } from 'react-native';

const keyManager = new PrivateKeySecurityManager();

// 앱이 백그라운드로 갈 때 모든 키 제거
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'background' || nextAppState === 'inactive') {
    keyManager.clearAllKeys();
    console.log('앱이 백그라운드로 이동하여 모든 키가 제거되었습니다.');
  }
});

// 앱 종료 시 정리
process.on('exit', () => {
  keyManager.clearAllKeys();
});

// ============================================
// 5. 키 삭제 (지갑 제거)
// ============================================

async function removeWallet(keyId: string) {
  try {
    await keyManager.deleteKey(keyId);
    console.log('지갑이 삭제되었습니다.');
  } catch (error) {
    console.error('지갑 삭제 실패:', error);
    throw error;
  }
}

// ============================================
// 6. 에러 처리 및 복구
// ============================================

async function handleKeyError(error: Error, keyId: string) {
  if (error.message.includes('인증')) {
    // 생체 인증 실패
    console.log('생체 인증이 필요합니다.');
    // UI에서 재시도 요청
  } else if (error.message.includes('복호화')) {
    // 비밀번호 오류
    console.log('비밀번호가 올바르지 않습니다.');
    // UI에서 비밀번호 재입력 요청
  } else {
    // 기타 오류
    console.error('키 처리 오류:', error);
    // 키를 메모리에서 제거
    keyManager.clearKeyAfterUse(keyId);
  }
}

// ============================================
// 사용 예시
// ============================================

async function main() {
  try {
    // 1. 지갑 설정 (최초 1회)
    // await setupWallet();
    
    // 2. 결제 실행
    // await sendPayment();
    
    // 3. QR 코드 결제
    const qrData: QRPaymentData = {
      marketAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      amount: '100',
      orderId: 'order-12345',
      description: '커피 한 잔',
    };
    
    // await processQRPayment(qrData, 'my_wallet', 'user-password');
    
  } catch (error) {
    await handleKeyError(error, 'my_wallet');
  }
}

module.exports = {
  setupWallet,
  sendPayment,
  processQRPayment,
  removeWallet,
  handleKeyError,
};

