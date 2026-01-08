'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface LocationData {
  lat: number;
  lng: number;
}

interface LocationContextType {
  currentLocation: LocationData | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  requestLocationUpdate: () => void; // 수동으로 위치 업데이트 요청
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // React Native WebView 환경 감지
  const isReactNativeWebView = typeof window !== 'undefined' && !!(window as any).ReactNativeWebView;

  // 위치 정보 요청 함수 (웹 환경만)
  const requestLocationUpdate = () => {
    // WebView 환경: 네이티브가 자동으로 전송하므로 아무것도 안함
    if (isReactNativeWebView) {
      console.log('📱 WebView 환경 - 네이티브가 자동으로 위치 전송');
      return;
    }
    
    console.log('typeof window !== undefined', typeof window !== 'undefined', typeof window);

    console.log('navigator.geolocation', navigator.geolocation);

    console.log('if:', !!(typeof window !== 'undefined' && navigator.geolocation));
    // 웹 환경: Geolocation API 사용
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('🌐 위치 업데이트:', location);
          setCurrentLocation(location);
          setIsLoadingLocation(false);
          setLocationError(null); // 성공 시 에러 초기화
        },
        (error) => {
          console.error('위치 정보 가져오기 실패:', error);
          setLocationError(error.message);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: false, // 네트워크 위치 (빠름)
          timeout: 30000,             // 30초 타임아웃
          maximumAge: 60000,         // 1분 캐시
        }
      );
    }
  };

  // React Native에서 보낸 메시지 수신 (위치 정보)
  useEffect(() => {
    if (!isReactNativeWebView) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        console.log('📨 메시지 수신:', event);
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (message.type === 'LOCATION_UPDATE') {
          const location = {
            lat: message.data.latitude,
            lng: message.data.longitude,
          };
          console.log('📍 네이티브로부터 위치 수신:', location);
          setCurrentLocation(location);
          setIsLoadingLocation(false);
          setLocationError(null); // 성공 시 에러 초기화
        } else if (message.type === 'LOCATION_ERROR') {
          console.log('⚠️ 네이티브 위치 에러:', message.data.error);
          setLocationError(message.data.error);
          setIsLoadingLocation(false);
        }
      } catch (error) {
        console.error('⚠️ WebView 메시지 파싱 실패:', error);
        setIsLoadingLocation(false);
      }
    };

    // React Native WebView의 postMessage는 document와 window 모두에서 받을 수 있음
    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as EventListener);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as EventListener);
    };
  }, [isReactNativeWebView]);

  // 백그라운드 위치 업데이트 (초기 + 1분마다) - 웹 환경만
  useEffect(() => {
    // WebView 환경이면 네이티브가 자동으로 보내주므로 스킵
    if (isReactNativeWebView) {
      console.log('📱 WebView 환경 - 네이티브 위치 대기 중...');
      setIsLoadingLocation(true); // 초기 로딩 표시
      return;
    }

    console.log('🎯 LocationProvider 초기화 (웹 환경)');
    
    // 초기 위치 요청 (웹 환경만)
    setIsLoadingLocation(true);
    requestLocationUpdate();

    // 1분마다 위치 자동 업데이트 (웹 환경만)
    intervalRef.current = setInterval(() => {
      console.log('🔄 백그라운드 위치 업데이트 (1분 주기)');
      requestLocationUpdate();
    }, 60000); // 60초 = 1분

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isReactNativeWebView]);

  const value: LocationContextType = {
    currentLocation,
    isLoadingLocation,
    locationError,
    requestLocationUpdate,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

