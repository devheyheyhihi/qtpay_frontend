'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { Store } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface StoreContextType {
  stores: Store[];
  isLoadingStores: boolean;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStores = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // 매장 데이터 로드
  const loadStores = async () => {
    setIsLoadingStores(true);
    try {
      console.log('🏪 전역 매장 데이터 로딩 시작');
      const response = await apiClient.getStores(1, 100); // 최대 100개
      if (response.success && response.data) {
        setStores(response.data.stores);
        console.log('✅ 매장 데이터 로딩 완료:', response.data.stores.length, '개');
      } else {
        console.error('Failed to load stores:', response.error);
        toast.error('매장 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('Error loading stores:', error);
      toast.error('매장 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingStores(false);
    }
  };

  // 수동 새로고침 함수
  const refreshStores = async () => {
    console.log('🔄 매장 데이터 새로고침');
    await loadStores();
  };

  // 초기 로딩 (앱 시작 시 1번만)
  useEffect(() => {
    loadStores();
  }, []);

  const value: StoreContextType = {
    stores,
    isLoadingStores,
    refreshStores,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};



