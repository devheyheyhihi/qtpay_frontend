'use client';

import { useEffect, useRef, useState } from 'react';
import { Store, Plus, Navigation, MapPin } from 'lucide-react';
import Script from 'next/script';
import { Store as StoreType } from '@/lib/api-client';
import toast from 'react-hot-toast';
import StoreRegisterModal from '@/components/StoreRegisterModal';
import { useLocation } from '@/lib/LocationContext';
import { useStores } from '@/lib/StoreContext';

interface LocationScreenProps {
  selectedStoreId?: string | null;
  onClearSelectedStore?: () => void;
}

export default function LocationScreen({ selectedStoreId, onClearSelectedStore }: LocationScreenProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const mapInstanceRef = useRef<any>(null); // map 인스턴스를 ref로도 저장
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // 전역 위치 Context에서 위치 정보 가져오기
  const { currentLocation, isLoadingLocation, locationError } = useLocation();
  
  // 전역 매장 Context에서 매장 정보 가져오기
  const { stores, isLoadingStores } = useStores();
  
  const currentMarkerRef = useRef<any>(null); // 현재 위치 마커
  const isInitialLocationRef = useRef<boolean>(true); // 초기 위치 로딩 여부
  const storeMarkersRef = useRef<any[]>([]); // 매장 마커들 저장
  const [isStoreRegisterOpen, setIsStoreRegisterOpen] = useState(false);
  const selectedStoreIdRef = useRef<string | null>(null); // selectedStoreId를 ref로 저장 (최신 값 참조용)

  // selectedStoreId가 변경되면 ref 업데이트
  useEffect(() => {
    selectedStoreIdRef.current = selectedStoreId || null;
  }, [selectedStoreId]);

  // 현재 위치로 지도 이동 (Context에서 가져온 위치 사용)
  const getCurrentLocation = () => {
    // selectedStoreId 초기화 (부모 컴포넌트에 알림)
    if (onClearSelectedStore) {
      onClearSelectedStore();
    }

    // Context에서 가져온 현재 위치가 있으면 즉시 지도 이동
    if (currentLocation && map && window.kakao) {
      console.log('🎯 저장된 위치로 즉시 이동:', currentLocation);
      const moveLatLon = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
      map.setCenter(moveLatLon);
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(moveLatLon);
      }
    } else {
      console.log('⚠️ 저장된 위치 없음, 위치 업데이트 대기 중...');
      toast.error('위치 정보를 불러오는 중입니다. 잠시만 기다려주세요.');
    }
  };

  // 컴포넌트 마운트 시 카카오맵 SDK 로드 확인 및 초기화
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      // 이미 로드되어 있으면 바로 사용
      if (window.kakao.maps.LatLng) {
        setIsMapLoaded(true);
      } else {
        // 로드 대기
        window.kakao.maps.load(() => {
          setIsMapLoaded(true);
        });
      }
    }
  }, []);



  // currentLocation 변경 시 마커 표시
  useEffect(() => {
    if (!currentLocation || !map || !window.kakao) {
      return;
    }

    // 기존 현재 위치 마커 제거
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setMap(null);
    }

    // 현재 위치 마커 생성 (파란색 점)
    const markerPosition = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
    
    // 커스텀 오버레이로 현재 위치 표시
    const content = `
      <div style="position: relative;">
        <div style="width: 20px; height: 20px; background: #4A90E2; border: 4px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
        <div style="width: 60px; height: 60px; background: rgba(74, 144, 226, 0.2); border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: pulse 2s ease-in-out infinite;"></div>
      </div>
    `;

    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: markerPosition,
      content: content,
      yAnchor: 0.5,
      xAnchor: 0.5,
    });

    customOverlay.setMap(map);
    currentMarkerRef.current = customOverlay;
  }, [currentLocation, map]);

  // 초기 지도 중심 이동 (map과 currentLocation이 모두 준비되고, selectedStoreId가 없을 때 1번만)
  useEffect(() => {
    if (!map || !currentLocation || !window.kakao || !isInitialLocationRef.current || selectedStoreId) {
      return;
    }

    console.log('🎯 초기 위치로 지도 이동:', currentLocation);
    const moveLatLon = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
    map.setCenter(moveLatLon);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(moveLatLon);
    }
    
    isInitialLocationRef.current = false; // 초기 로딩 완료
  }, [map, currentLocation, selectedStoreId]);

  // 카카오맵 초기화 (딱 1번만)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.kakao || map) return; // map이 이미 있으면 스킵

    const kakao = window.kakao;

    // 지도 생성 - currentLocation이 있으면 사용, 없으면 서울 시청
    const container = mapRef.current;
    const centerLat = currentLocation ? currentLocation.lat : 37.5665;
    const centerLng = currentLocation ? currentLocation.lng : 126.9780;
    
    const options = {
      center: new kakao.maps.LatLng(centerLat, centerLng),
      level: 3, // 확대 레벨
    };

    console.log('🗺️ 지도 초기화 (1번만) - 중심 좌표:', { lat: centerLat, lng: centerLng });

    const newMap = new kakao.maps.Map(container, options);
    setMap(newMap);
    mapInstanceRef.current = newMap; // ref에도 저장
  }, [isMapLoaded, currentLocation]); // stores 제거, map 추가

  // QCC 가맹점 마커 표시 (stores가 로딩되면 실행)
  useEffect(() => {
    if (!map || !window.kakao || stores.length === 0) return;

    const kakao = window.kakao;

    // 기존 마커 제거
    storeMarkersRef.current.forEach(({ marker }) => {
      marker.setMap(null);
    });
    storeMarkersRef.current = [];

    console.log('📍 매장 마커 생성:', stores.length, '개');

    // QCC 가맹점 마커 표시
    stores.forEach((store) => {
      const markerPosition = new kakao.maps.LatLng(store.lat, store.lng);
      
      // 커스텀 마커 생성
      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map,
      });

      // 인포윈도우 (가맹점 정보)
      const categoryIcon = store.category === 'cafe' ? '☕' : 
                          store.category === 'restaurant' ? '🍽️' : 
                          store.category === 'retail' ? '🏪' : '🏢';
      
      const infowindow = new kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px; min-width:150px;">
            <div style="font-weight:bold; margin-bottom:5px; color:#2563eb;">
              <span style="display:inline-block; width:24px; height:24px; background:#2563eb; border-radius:50%; text-align:center; line-height:24px; color:white; font-size:14px; margin-right:8px;">Q</span>
              ${store.name}
            </div>
            <div style="font-size:12px; color:#666; margin-bottom:4px;">${categoryIcon} ${store.address}</div>
            ${store.description ? `<div style="font-size:11px; color:#999;">${store.description}</div>` : ''}
          </div>
        `,
      });

      // 마커 클릭 시 인포윈도우 표시
      kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(map, marker);
      });

      // 마커 정보 저장
      storeMarkersRef.current.push({
        storeId: store.id,
        marker,
        infowindow,
        store,
      });
    });
  }, [map, stores]); // 지도가 준비되고 stores가 로딩되면 실행

  // 선택된 매장으로 지도 이동
  useEffect(() => {
    if (!selectedStoreId || !map || !window.kakao || storeMarkersRef.current.length === 0) return;

    const selectedMarkerInfo = storeMarkersRef.current.find(
      (info) => info.storeId === selectedStoreId
    );

    if (selectedMarkerInfo) {
      const { store, marker, infowindow } = selectedMarkerInfo;
      
      // 지도 중심을 해당 매장으로 이동
      const moveLatLon = new window.kakao.maps.LatLng(store.lat, store.lng);
      map.setCenter(moveLatLon);
      map.setLevel(3); // 줌 레벨 조정

      // 인포윈도우 자동 열기
      setTimeout(() => {
        infowindow.open(map, marker);
      }, 300);
    }
  }, [selectedStoreId, map]);

  return (
    <>
      {/* Daum 우편번호 API 로드 */}
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      
      <div className="relative h-full bg-gray-200">
        {/* 카카오맵 컨테이너 */}
        <div ref={mapRef} className="w-full h-full" />

        {/* 지도 로딩 오버레이 */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-bounce" />
              <p className="text-lg font-semibold text-gray-700">지도 로딩중...</p>
            </div>
          </div>
        )}

        {/* 위치 상태 배너 - 상단 우측에 작게 */}
        <div className="absolute top-4 right-4 z-30">
          {isLoadingLocation && !currentLocation && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 flex items-center space-x-2 animate-slide-down">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700 font-medium">내 위치를 찾는 중...</span>
            </div>
          )}
          
          {locationError && !currentLocation && (
            <div className="bg-blue-50 rounded-xl shadow-lg px-4 py-2.5 flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700 font-medium">내 위치를 찾는 중입니다</span>
            </div>
          )}
        </div>

      {/* 좌측 상단 버튼들 */}
      <div className="absolute top-4 left-4 flex flex-col space-y-3 z-10">
        {/* Store 등록 버튼 */}
          <button 
            onClick={() => setIsStoreRegisterOpen(true)}
            className="w-14 h-14 bg-gray-900 rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
            title="가맹점 등록"
          >
          <div className="relative">
            <Store className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-gray-900" />
            </div>
          </div>
        </button>

          {/* 현재 위치 버튼 */}
          <button 
            onClick={getCurrentLocation}
            className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="현재 위치로"
          >
            <Navigation className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        {/* 가맹점 개수 표시 - 네비게이션 위에 표시 */}
        <div className="absolute bottom-20 left-4 bg-white rounded-xl shadow-lg px-4 py-3 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                QCC 가맹점 {isLoadingStores && '(로딩중...)'}
              </p>
              <p className="text-lg font-bold text-gray-900">{stores.length}개</p>
            </div>
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

