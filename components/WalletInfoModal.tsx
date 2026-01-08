'use client';

import { useEffect, useState, useRef } from 'react';
import { useWallet } from '@/lib/WalletContext';
import { X, Copy, Check, Wallet } from 'lucide-react';

interface WalletInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeTextColor?: string;
}

export default function WalletInfoModal({ isOpen, onClose, themeTextColor }: WalletInfoModalProps) {
  const { walletState, disconnectWallet, updateBalance } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showFullBalance, setShowFullBalance] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const prevOpenRef = useRef(false);
  const textColor = themeTextColor?.trim() ? themeTextColor.trim() : '#FFFFFF';

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // 모달이 열릴 때만 잔액 업데이트
  useEffect(() => {
    // isOpen이 false → true로 변경될 때만 실행
    if (isOpen && !prevOpenRef.current && walletState.isConnected && walletState.address) {
      updateBalance();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, walletState.isConnected, walletState.address, updateBalance]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onClose();
  };

  // 잔액 포맷팅 (말줄임표 처리)
  const formatBalance = (balance: number) => {
    const balanceStr = balance.toFixed(8); // 최대 8자리
    const [intPart, decPart] = balanceStr.split('.');
    
    if (showFullBalance) {
      // 전체 표시
      return balance.toFixed(8);
    } else {
      // 소수점 2자리 + ... 표시
      if (decPart && decPart.length > 2) {
        return `${intPart}.${decPart.slice(0, 2)}...`;
      }
      return balanceStr;
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4 ${
        isClosing ? 'animate-modal-overlay-out' : 'animate-modal-overlay'
      }`}
      style={{ margin: 0 }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto ${
        isClosing ? 'animate-modal-panel-out' : 'animate-modal-panel'
      }`}>
        {/* 헤더 */}
        <div
          className="p-6 text-white flex items-center justify-between sticky top-0 z-10 rounded-t-2xl"
          style={{ backgroundColor: 'var(--theme-bg, #04AAAB)' }}
        >
          <h2 className="text-xl font-bold" style={{ color: textColor }}>
            나의 지갑
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {walletState.isConnected ? (
            <>
              {/* 지갑 정보 카드 */}
              <div className="bg-gray-900 rounded-2xl shadow-lg p-6 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--theme-bg, #04AAAB)' }}
                    >
                      <span className="text-white font-bold text-xl">Q</span>
                    </div>
                    <span className="text-lg font-semibold">Quantum Chain</span>
                  </div>
                  <button
                    onClick={() => walletState.address && copyToClipboard(walletState.address)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* 지갑 주소 */}
                <div className="bg-black/30 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">지갑 주소</p>
                  <p className="font-mono text-sm text-gray-200 break-all">
                    {walletState.address}
                  </p>
                </div>

                {/* 잔액 */}
                <div className="text-center pt-4 pb-2">
                  <p className="text-sm text-gray-400 mb-2">보유 잔액</p>
                  <button
                    onClick={() => setShowFullBalance(!showFullBalance)}
                    className="text-5xl font-bold break-all px-2"
                  >
                    {formatBalance(walletState.balance)}
                  </button>
                  <p className="text-sm text-gray-400 mt-1">
                    QCC {!showFullBalance && '(클릭하여 전체 보기)'}
                  </p>
                </div>
              </div>

              {/* 연결 해제 버튼 */}
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md"
              >
                지갑 연결 해제
              </button>
            </>
          ) : (
            /* 지갑 미연결 상태 */
            <div className="text-center space-y-6 py-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--theme-bg, #04AAAB)' }}
              >
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">지갑이 연결되어 있지 않습니다</h3>
                <p className="text-gray-600">
                  Quantum Chain 지갑을 먼저 연결해주세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
