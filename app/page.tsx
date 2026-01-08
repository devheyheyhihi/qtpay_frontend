'use client';

import { useState, useEffect } from 'react';
import { LocationProvider } from '@/lib/LocationContext';
import { StoreProvider } from '@/lib/StoreContext';
import { useWallet } from '@/lib/WalletContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import WalletInfoModal from '@/components/WalletInfoModal';
import WalletModal from '@/components/WalletModal';
import HomeScreen from '@/components/screens/HomeScreen';
import SendReceiveScreen from '@/components/screens/SendReceiveScreen';
import LocationScreen from '@/components/screens/LocationScreen';

export default function HomePage() {
  const { walletState } = useWallet();
  const [activeNav, setActiveNav] = useState('home');
  const [isWalletInfoOpen, setIsWalletInfoOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [themeLabel, setThemeLabel] = useState('Qwon');
  const [themeTextColor, setThemeTextColor] = useState('#FFFFFF');

  useEffect(() => {
    const clamp = (value: number) => Math.min(255, Math.max(0, value));
    const adjustHex = (hex: string, amount: number) => {
      const sanitized = hex.replace('#', '').trim();
      if (sanitized.length !== 6) {
        return null;
      }
      const r = clamp(parseInt(sanitized.slice(0, 2), 16) + amount);
      const g = clamp(parseInt(sanitized.slice(2, 4), 16) + amount);
      const b = clamp(parseInt(sanitized.slice(4, 6), 16) + amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
        .toString(16)
        .padStart(2, '0')}`;
    };

    const handleThemeMessage = (event: MessageEvent) => {
      let message: any;
      try {
        message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (message?.type === 'THEME_SELECTED' && message.data?.backgroundColor) {
        const bg = message.data.backgroundColor;
        document.documentElement.style.setProperty('--theme-bg', bg);
        const hover = adjustHex(bg, -18);
        const active = adjustHex(bg, -36);
        if (hover) {
          document.documentElement.style.setProperty('--theme-bg-hover', hover);
        }
        if (active) {
          document.documentElement.style.setProperty('--theme-bg-active', active);
        }
        if (typeof message.data.label === 'string') {
          setThemeLabel(message.data.label);
        }
        if (typeof message.data.textColor === 'string') {
          setThemeTextColor(message.data.textColor);
        }
      }

      if (message?.type === 'SAFE_AREA' && typeof message.data?.top === 'number') {
        document.documentElement.style.setProperty('--safe-top', `${message.data.top}px`);
        if (typeof message.data?.bottom === 'number') {
          document.documentElement.style.setProperty('--safe-bottom', `${message.data.bottom}px`);
        }
      }
    };

    window.addEventListener('message', handleThemeMessage);
    document.addEventListener('message', handleThemeMessage as EventListener);

    return () => {
      window.removeEventListener('message', handleThemeMessage);
      document.removeEventListener('message', handleThemeMessage as EventListener);
    };
  }, []);

  // 지갑이 연결되지 않았을 때 WalletModal 자동 표시
  useEffect(() => {
    if (walletState.isHydrated && !walletState.isConnected && !isWalletModalOpen) {
      setIsWalletModalOpen(true);
    }
  }, [walletState.isHydrated, walletState.isConnected, isWalletModalOpen]);

  // 매장 카드 클릭 핸들러
  const handleStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId);
    setActiveNav('location');
  };

  // 네비게이션 변경 핸들러
  const handleNavChange = (nav: string) => {
    // 네비게이션으로 직접 location 화면으로 갈 때는 selectedStoreId 초기화
    // (매장 카드 클릭은 handleStoreClick에서 처리하므로 여기서는 항상 초기화)
    if (nav === 'location') {
      setSelectedStoreId(null);
    }
    setActiveNav(nav);
  };

  // "현재 위치" 버튼 클릭 핸들러
  const handleClearSelectedStore = () => {
    setSelectedStoreId(null);
  };

  // "받기/보내기" 화면으로 이동
  const handleNavigateToSendReceive = () => {
    setActiveNav('send-receive');
  };

  // 활성 화면 렌더링
  const renderScreen = () => {
    switch (activeNav) {
      case 'home':
        return <HomeScreen onStoreClick={handleStoreClick} onNavigateToSendReceive={handleNavigateToSendReceive} />;
      case 'send-receive':
        return <SendReceiveScreen />;
      case 'location':
        return <LocationScreen selectedStoreId={selectedStoreId} onClearSelectedStore={handleClearSelectedStore} />;
      default:
        return <HomeScreen onStoreClick={handleStoreClick} />;
    }
  };

  return (
    <LocationProvider>
      <StoreProvider>
        {/* PC 화면 안내 (768px 이상) */}
      <div className="hidden md:flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-4xl">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">모바일 전용 서비스</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Quantum PAY는 모바일 기기에 최적화된<br />
            서비스입니다.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm text-gray-700">
              <strong>✓</strong> 스마트폰으로 접속해주세요
            </p>
            <p className="text-sm text-gray-700">
              <strong>✓</strong> 태블릿으로 접속해주세요
            </p>
          </div>
          <p className="text-xs text-gray-400 pt-4">
            PC 개발자 도구(F12)에서 모바일 모드로<br />
            테스트할 수 있습니다
          </p>
        </div>
      </div>

      {/* 모바일 화면 (768px 미만) */}
      <div className="md:hidden flex flex-col h-screen bg-gray-50 relative">
        {/* 헤더 */}
        <Header
          onSettingsClick={() => setIsWalletInfoOpen(true)}
          themeLabel={themeLabel}
          themeTextColor={themeTextColor}
        />

        {/* 메인 콘텐츠 */}
        <main
          key={activeNav}
          className={`flex-1 animate-nav-fade ${activeNav === 'location' ? 'overflow-hidden' : 'overflow-y-auto pb-20'}`}
        >
          {renderScreen()}
        </main>

        {/* 푸터 네비게이션 */}
        <Navigation activeNav={activeNav} onNavChange={handleNavChange} />

        {!walletState.isHydrated && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[250]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">지갑 상태 확인 중...</p>
            </div>
          </div>
        )}

        {/* 지갑 연결 모달 */}
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          themeTextColor={themeTextColor}
        />

        {/* 지갑 정보 모달 */}
        <WalletInfoModal
          isOpen={isWalletInfoOpen}
          onClose={() => setIsWalletInfoOpen(false)}
          themeTextColor={themeTextColor}
        />
      </div>
      </StoreProvider>
    </LocationProvider>
  );
}
