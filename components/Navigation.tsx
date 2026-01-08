'use client';

import { Home, QrCode, MapPin, Wallet } from 'lucide-react';

interface NavigationProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export default function Navigation({ activeNav, onNavChange }: NavigationProps) {
  const activeColorStyle = { color: 'var(--theme-bg, #2563eb)' };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      style={{ paddingBottom: 'var(--safe-bottom, 0px)' }}
    >
      <div className="grid grid-cols-3 h-16">
        <button
          onClick={() => onNavChange('home')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeNav === 'home' ? '' : 'text-gray-500'
          }`}
          style={activeNav === 'home' ? activeColorStyle : undefined}
          aria-current={activeNav === 'home' ? 'page' : undefined}
        >
          <Home className={`w-6 h-6 ${activeNav === 'home' ? 'animate-nav-pop' : ''}`} />
          <span className="text-xs font-medium">HOME</span>
        </button>
        
        <button
          onClick={() => onNavChange('send-receive')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeNav === 'send-receive' ? '' : 'text-gray-500'
          }`}
          style={activeNav === 'send-receive' ? activeColorStyle : undefined}
          aria-current={activeNav === 'send-receive' ? 'page' : undefined}
        >
          <QrCode className={`w-6 h-6 ${activeNav === 'send-receive' ? 'animate-nav-pop' : ''}`} />
          <span className="text-xs font-medium">받기/보내기</span>
        </button>
        
        <button
          onClick={() => onNavChange('location')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeNav === 'location' ? '' : 'text-gray-500'
          }`}
          style={activeNav === 'location' ? activeColorStyle : undefined}
          aria-current={activeNav === 'location' ? 'page' : undefined}
        >
          <MapPin className={`w-6 h-6 ${activeNav === 'location' ? 'animate-nav-pop' : ''}`} />
          <span className="text-xs font-medium">Location</span>
        </button>
        
        {/* <button
          onClick={() => onNavChange('wallet')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            activeNav === 'wallet' ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <Wallet className="w-6 h-6" />
          <span className="text-xs font-medium">Wallet</span>
        </button> */}
      </div>
    </nav>
  );
}
