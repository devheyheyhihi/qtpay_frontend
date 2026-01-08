import axios from 'axios';

const QUANTUM_API_BASE_URL = process.env.NEXT_PUBLIC_QUANTUM_API_BASE_URL || 'https://qcc-backend.com';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: QUANTUM_API_BASE_URL,
  timeout: 30000,
});

/**
 * 주소의 잔액을 조회하는 함수
 * @param addressHash 지갑 주소
 * @returns 잔액 (문자열)
 */
export const getAddressBalance = async (addressHash: string): Promise<string> => {
  try {
    const balanceRes = await api.post<string>("/rawrequest/", {
      type: "GetBalance",
      address: addressHash,
    });

    // 18자리 소수점을 6자리로 변환
    return (Number(balanceRes.data) / 1e18).toFixed(6);
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
};
