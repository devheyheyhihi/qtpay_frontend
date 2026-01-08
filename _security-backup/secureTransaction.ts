const axios = require('axios');
const { buildSendRequestData } = require('./crypto');
const Decimal = require('decimal.js');
const { PrivateKeySecurityManager } = require('./secureKeyStorage');

const QUANTUM_API_BASE_URL = process.env.QUANTUM_API_BASE_URL || 'https://qcc-backend.com';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: QUANTUM_API_BASE_URL,
  timeout: 30000,
});

// 보안 키 관리자 인스턴스
const keyManager = new PrivateKeySecurityManager();

// 과학적 표기법을 일반 표기법으로 변환
const unscientificNotation = (decimal) => {
  return decimal.toFixed();
};

/**
 * 보안 강화된 트랜잭션 전송
 * 
 * @param {Object} params
 * @param {string} params.keyId - 저장된 키의 ID
 * @param {string} params.password - 키 복호화용 비밀번호
 * @param {string} params.toAddress - 받는 주소
 * @param {string|number} params.amount - 전송 금액
 */
const sendSecureTransaction = async ({ 
  keyId, 
  password, 
  toAddress, 
  amount 
}) => {
  let privateKey = null;
  
  try {
    // 1. 생체 인증 + 비밀번호로 키 불러오기
    privateKey = await keyManager.getKeyForTransaction(keyId, password);
    
    // 2. 18자리 정밀도로 변환
    const amountWithDecimals = unscientificNotation(
      new Decimal(amount.toString()).times(1e18),
    );

    // 3. 타임스탬프 가져오기
    const sTime = await api.get("/api/ts");

    // 4. 서명된 트랜잭션 데이터 생성
    const data = buildSendRequestData(
      privateKey,
      toAddress,
      amountWithDecimals,
      sTime.data,
    );

    // 5. 트랜잭션 브로드캐스트
    const response = await api.post("/broadcast/", data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // 6. 에러 체크
    if (response.data.output && response.data.output.includes("error")) {
      throw new Error("Failed to send transaction: " + response.data.output);
    }

    return response.data;
    
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
    
  } finally {
    // 7. 사용 후 즉시 메모리에서 키 제거
    if (keyId) {
      keyManager.clearKeyAfterUse(keyId);
    }
    // 추가 보안: 변수 덮어쓰기
    if (privateKey) {
      privateKey = '0'.repeat(64);
      privateKey = null;
    }
  }
};

/**
 * 기존 sendTransaction (하위 호환성 유지)
 * 보안이 필요한 경우 sendSecureTransaction 사용 권장
 */
const sendTransaction = async ({ privateKey, toAddress, amount }) => {
  try {
    const amountWithDecimals = unscientificNotation(
      new Decimal(amount.toString()).times(1e18),
    );

    const sTime = await api.get("/api/ts");

    const data = buildSendRequestData(
      privateKey,
      toAddress,
      amountWithDecimals,
      sTime.data,
    );

    const response = await api.post("/broadcast/", data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data.output && response.data.output.includes("error")) {
      throw new Error("Failed to send transaction: " + response.data.output);
    }

    return response.data;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};

// 트랜잭션 상세 정보 조회
const getTransactionDetails = async (txHash) => {
  try {
    const response = await api.get(`/txs/${txHash}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get transaction details:', error);
    throw error;
  }
};

// 트랜잭션 검증 (존재하는지 확인)
const verifyTransaction = async (txHash) => {
  try {
    const txDetails = await getTransactionDetails(txHash);
    return {
      exists: true,
      details: txDetails
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * 앱 종료 시 모든 키 제거
 */
const cleanup = () => {
  keyManager.clearAllKeys();
};

module.exports = {
  sendTransaction,           // 기존 함수 (하위 호환)
  sendSecureTransaction,     // 보안 강화 함수 (권장)
  getTransactionDetails,
  verifyTransaction,
  cleanup,
  keyManager,                // 키 관리자 직접 접근 (필요시)
};

