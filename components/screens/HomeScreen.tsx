'use client';

import { useState } from 'react';
import { Send, Store, MapPin } from 'lucide-react';
import Script from 'next/script';
import QCCPriceCard from '@/components/QCCPriceCard';
import StoreRegisterModal from '@/components/StoreRegisterModal';
import { Store as StoreType } from '@/lib/api-client';
import { useStores } from '@/lib/StoreContext';

interface HomeScreenProps {
  onStoreClick?: (storeId: string) => void;
  onNavigateToSendReceive?: () => void;
}

export default function HomeScreen({ onStoreClick, onNavigateToSendReceive }: HomeScreenProps) {
  const [isStoreRegisterOpen, setIsStoreRegisterOpen] = useState(false);
  
  // 전역 매장 Context에서 매장 정보 가져오기
  const { stores, isLoadingStores } = useStores();

  // Store 등록 버튼 클릭
  const handleStoreRegister = () => {
    setIsStoreRegisterOpen(true);
  };

  return (
    <>
      {/* Daum 우편번호 API 로드 */}
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      
      <div className="p-6 space-y-6">
        {/* Quantum Chain 가격 */}
        <QCCPriceCard />

      {/* 액션 버튼 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Quantum 보내기 */}
        <button 
          onClick={onNavigateToSendReceive}
          className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col items-center space-y-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-bg, #3b82f6) 15%, white)',
              }}
            >
              <div
                className="w-8 h-8"
                style={{
                  backgroundColor: 'var(--theme-bg, #3b82f6)',
                  WebkitMask: 'url(/icon_pay.svg) center / contain no-repeat',
                  mask: 'url(/icon_pay.svg) center / contain no-repeat',
                }}
              />
            </div>
            <span className="text-lg font-semibold text-gray-900">QCC <br/>받기 설정</span>
          </div>
        </button>

        {/* Store 등록 */}
        <button 
          onClick={handleStoreRegister}
          className="bg-gray-900 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
        >
          <div className="absolute top-3 right-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">+</span>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Store 등록</span>
          </div>
        </button>
      </div>

      {/* Registered Merchant */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Registered Merchant</h2>
          <span className="text-sm text-gray-500">
            {isLoadingStores ? '로딩중...' : `${stores.length}개`}
          </span>
        </div>

        {/* 상점 리스트 */}
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {isLoadingStores ? (
            <div className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
          ) : stores.length === 0 ? (
            <div className="w-full text-center py-8 text-gray-500">
              등록된 가맹점이 없습니다
            </div>
          ) : (
            stores.map((store) => (
              <button
                key={store.id}
                onClick={() => onStoreClick?.(store.id)}
                className="flex-shrink-0 w-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="p-5 flex flex-col space-y-3 text-left">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-blue-600">Q</span>
                    </div>
                    <MapPin className="w-5 h-5 text-white/80" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {store.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2">
                      {store.address}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Store 등록 모달 */}
      <StoreRegisterModal
        isOpen={isStoreRegisterOpen}
        onClose={() => setIsStoreRegisterOpen(false)}
      />
      </div>
    </>
  );
}
