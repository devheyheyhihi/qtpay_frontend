// API 클라이언트

// 환경에 따라 동적으로 API URL 설정
const getApiBaseUrl = () => {
  // 환경 변수가 설정되어 있으면 최우선 사용 (개발/프로덕션 구분 없이)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 환경 변수가 없을 때만 동적 감지 로직 사용
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 개발 환경: 브라우저에서 동적으로 감지
  if (isDevelopment && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Android 애뮬레이터에서 접근 중인 경우 (10.0.2.2)
    if (hostname === '10.0.2.2') {
      return 'http://10.0.2.2:3001/api';
    }
    
    // 실제 안드로이드 기기에서 접근 중인 경우 (IP 주소 형식)
    if (hostname !== 'localhost' && /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return `http://${hostname}:3001/api`;
    }
    
    // 일반 localhost (PC 브라우저)
    return 'http://localhost:3001/api';
  }

  // 프로덕션 환경에서 환경 변수가 없을 때 기본값
  // (실제로는 .env.production에 설정해야 함)
  return 'https://backend.qwonpay.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// API URL을 외부에서도 사용할 수 있도록 export
export const getFullApiUrl = (path: string) => {
  return `${API_BASE_URL.replace('/api', '')}${path}`;
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 매장 인터페이스
export interface Store {
  id: string;
  name: string;
  address: string;
  detailAddress?: string | null;
  lat: number;
  lng: number;
  description?: string | null;
  phone?: string | null;
  website?: string | null;
  ownerAddress: string;
  category?: string | null;
  status: string; // pending, approved, denied
  createdAt: string;
  updatedAt: string;
  distance?: number; // 주변 검색 시 추가됨
}

// 트랜잭션 인터페이스
export interface Transaction {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  status: string;
  type: string;
  memo?: string | null;
  confirmations: number;
  blockNumber?: number | null;
  storeId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// 가격 데이터 인터페이스
export interface PriceData {
  price: string;
  change24h: string;
  priceKRW: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // 공통 fetch 래퍼
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error: any) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // === 매장 API ===

  // 매장 목록 조회
  async getStores(page: number = 1, limit: number = 20) {
    return this.request<{
      stores: Store[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/stores?page=${page}&limit=${limit}`);
  }

  // 주변 매장 검색
  async getNearbyStores(lat: number, lng: number, radius: number = 1000) {
    return this.request<Store[]>(
      `/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
  }

  // 매장 상세 조회
  async getStore(id: string) {
    return this.request<Store>(`/stores/${id}`);
  }

  // 소유자별 매장 조회
  async getStoresByOwner(address: string) {
    return this.request<Store[]>(`/stores/owner/${address}`);
  }

  // 매장 등록
  async createStore(data: {
    name: string;
    address: string;
    detailAddress?: string;
    lat: number;
    lng: number;
    description?: string;
    phone?: string;
    website?: string;
    ownerAddress: string;
    category?: string;
  }) {
    return this.request<Store>('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 매장 수정
  async updateStore(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      detailAddress: string;
      description: string;
      phone: string;
      website: string;
      category: string;
    }>,
    ownerAddress: string
  ) {
    return this.request<Store>(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, ownerAddress }),
    });
  }

  // 매장 삭제
  async deleteStore(id: string, ownerAddress: string) {
    return this.request<{ message: string }>(`/stores/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ ownerAddress }),
    });
  }

  // === 트랜잭션 API ===

  // 트랜잭션 기록 생성
  async createTransaction(data: {
    txHash: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
    type: string;
    memo?: string;
    storeId?: string;
  }) {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 트랜잭션 조회
  async getTransaction(txHash: string) {
    return this.request<Transaction>(`/transactions/${txHash}`);
  }

  // 주소별 트랜잭션 히스토리
  async getTransactionsByAddress(
    address: string,
    page: number = 1,
    limit: number = 20
  ) {
    return this.request<{
      transactions: Transaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/transactions/address/${address}?page=${page}&limit=${limit}`);
  }

  // 트랜잭션 상태 업데이트
  async updateTransactionStatus(txHash: string) {
    return this.request<Transaction>(`/transactions/${txHash}/status`, {
      method: 'PATCH',
    });
  }

  // === 가격 API ===

  // QCC 가격 조회
  async getQCCPrice() {
    return this.request<PriceData>('/prices/qcc');
  }

  // === Health Check ===
  async healthCheck() {
    return this.request<{ message: string; timestamp: string }>('/health');
  }
}

// 싱글톤 인스턴스
const apiClient = new ApiClient();

export default apiClient;

