'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface QCCPrice {
  krw: number;
  usd: number;
  change24h: number;
  timestamp: number;
}

interface UseQCCPriceReturn {
  price: QCCPrice;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * QCC 가격 실시간 조회 훅 (백엔드 API 사용)
 * @param refreshInterval 갱신 주기 (ms), 기본 30초
 */
export function useQCCPrice(refreshInterval: number = 30000): UseQCCPriceReturn {
  const [price, setPrice] = useState<QCCPrice>({
    krw: 0,
    usd: 0,
    change24h: 0,
    timestamp: Date.now(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const response = await apiClient.getQCCPrice();
      
      if (response.success && response.data) {
        setPrice({
          krw: parseFloat(response.data.priceKRW),
          usd: parseFloat(response.data.price),
          change24h: parseFloat(response.data.change24h),
          timestamp: Date.now(),
        });
        setError(null);
        setLoading(false); // 성공 시에만 로딩 해제
      } else {
        throw new Error(response.error || '가격 조회 실패');
      }
    } catch (err) {
      console.error('가격 조회 실패:', err);
      setError(err as Error);
      // 에러 시 로딩 상태 유지 (로딩중... 계속 표시)
    }
  }, []);

  useEffect(() => {
    // 초기 로드
    fetchPrice();

    // 주기적 갱신
    const interval = setInterval(fetchPrice, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchPrice, refreshInterval]);

  return { 
    price, 
    loading, 
    error, 
    refetch: fetchPrice 
  };
}
