'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { useQCCPrice } from '@/hooks/useQCCPrice';

interface QCCPriceCardProps {
  className?: string;
}

export default function QCCPriceCard({ className = '' }: QCCPriceCardProps) {
  // QCC 실시간 가격 조회 (1분마다 갱신)
  const { price, loading } = useQCCPrice(60000);

  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">Q</span>
        </div>
        <div>
          <p className="text-gray-600 text-sm">QCC 가격</p>
          {loading ? (
            <p className="text-base font-semibold text-gray-500 animate-pulse">로딩중...</p>
          ) : (
            <p className="text-3xl font-bold text-gray-900">
              {`₩ ${price.krw.toLocaleString()}`}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className={`flex items-center space-x-1 ${price.change24h >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
          {price.change24h >= 0 ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
          <span className="font-semibold">{price.change24h.toFixed(2)}%</span>
        </div>
        <span className="text-xs text-gray-400 mt-1">1시간 전 대비</span>
      </div>
    </div>
  );
}

