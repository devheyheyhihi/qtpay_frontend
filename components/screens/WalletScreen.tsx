'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/WalletContext';
import { Wallet, Copy, Check } from 'lucide-react';
import QCCPriceCard from '@/components/QCCPriceCard';

export default function WalletScreen() {
  const { walletState, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 주소 축약 표시
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Quantum Chain 가격 */}
      <QCCPriceCard />

      {/* 지갑 연결 상태 */}
      {walletState.isConnected ? (
        <>
          {/* 지갑 정보 카드 */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">Q</span>
                </div>
                <span className="text-lg font-semibold">Quantum chain</span>
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
              <p className="font-mono text-sm text-gray-300 break-all">
                {walletState.address}
              </p>
            </div>

            {/* 잔액 */}
            <div className="text-center pt-2">
              <p className="text-5xl font-bold">{walletState.balance.toFixed(5)} QCC</p>
            </div>
          </div>

          {/* 연결 해제 버튼 */}
          <button
            onClick={disconnectWallet}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md"
          >
            지갑 연결 해제
          </button>
        </>
      ) : (
        /* 지갑 미연결 상태 */
        <div className="bg-white rounded-2xl shadow-md p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">지갑 연결 필요</h3>
            <p className="text-gray-600">
              Quantum Chain 지갑을 연결하여<br />
              결제 기능을 사용하세요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
