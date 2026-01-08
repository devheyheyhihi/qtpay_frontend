import axios, { AxiosInstance } from 'axios';
import { buildSendRequestData } from './qcc-crypto';
import Decimal from 'decimal.js';

const QUANTUM_API_BASE_URL = process.env.NEXT_PUBLIC_QCC_API_URL || 'https://qcc-backend.com';

// axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: QUANTUM_API_BASE_URL,
  timeout: 30000,
});

// 과학적 표기법을 일반 표기법으로 변환
const unscientificNotation = (decimal: Decimal): string => {
  return decimal.toFixed();
};

export interface SendTransactionParams {
  privateKey: string;
  toAddress: string;
  amount: string;
}

export interface TransactionResponse {
  output?: string;
  [key: string]: any;
}

export interface TransactionDetails {
  [key: string]: any;
}

export interface VerifyTransactionResult {
  exists: boolean;
  details?: TransactionDetails;
  error?: string;
}

// 트랜잭션 전송
export const sendTransaction = async ({ 
  privateKey, 
  toAddress, 
  amount 
}: SendTransactionParams): Promise<TransactionResponse> => {
  try {
    console.log('🚀 QCC 트랜잭션 전송 시작:');
    console.log('  - To:', toAddress);
    console.log('  - Amount:', amount);

    // 18자리 정밀도로 변환
    const amountWithDecimals = unscientificNotation(
      new Decimal(amount.toString()).times(1e18),
    );

    console.log('  - Amount (wei):', amountWithDecimals);

    // 타임스탬프 가져오기
    console.log('📡 타임스탬프 요청 중...');
    const sTime = await api.get("/api/ts");
    console.log('✅ 타임스탬프 수신:', sTime.data);

    // 서명된 트랜잭션 데이터 생성
    console.log('🔐 트랜잭션 서명 중...');
    const data = buildSendRequestData(
      privateKey,
      toAddress,
      amountWithDecimals,
      sTime.data,
    );

    console.log('📤 트랜잭션 브로드캐스트 중...');
    // 트랜잭션 브로드캐스트
    const response = await api.post("/broadcast/", data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ 브로드캐스트 응답:', response.data);

    // 에러 체크
    if (response.data.output && response.data.output.includes("error")) {
      throw new Error("Failed to send transaction: " + response.data.output);
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ 트랜잭션 실패:', error);
    console.error('  - Message:', error.message);
    console.error('  - Response:', error.response?.data);
    throw error;
  }
};

// 트랜잭션 상세 정보 조회
export const getTransactionDetails = async (txHash: string): Promise<TransactionDetails> => {
  try {
    const response = await api.get(`/txs/${txHash}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get transaction details:', error);
    throw error;
  }
};

// 트랜잭션 검증 (존재하는지 확인)
export const verifyTransaction = async (txHash: string): Promise<VerifyTransactionResult> => {
  try {
    const txDetails = await getTransactionDetails(txHash);
    return {
      exists: true,
      details: txDetails
    };
  } catch (error: any) {
    return {
      exists: false,
      error: error.message
    };
  }
};



