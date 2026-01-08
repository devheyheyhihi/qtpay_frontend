'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/WalletContext';
import { X, Wallet, FileText, Key, Plus } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeTextColor?: string;
}

export default function WalletModal({ isOpen, onClose, themeTextColor }: WalletModalProps) {
  const { connectWallet, walletState } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'import'>('create');
  const [mnemonic, setMnemonic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
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

  // 지갑 연결 성공 시 모달 닫기
  useEffect(() => {
    if (walletState.isConnected && isOpen) {
      onClose();
    }
  }, [walletState.isConnected, isOpen, onClose]);

  // 새 지갑 생성
  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      const result = await connectWallet('create');
      if (result) {
        // 성공 시 모달은 useEffect에서 자동으로 닫힘
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 니모닉으로 복구
  const handleImportMnemonic = async () => {
    if (!mnemonic.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await connectWallet('import', { mnemonic: mnemonic.trim() });
      if (result) {
        setMnemonic('');
        // 성공 시 모달은 useEffect에서 자동으로 닫힘
      }
    } catch (error) {
      console.error('Failed to import wallet from mnemonic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 키파일 가져오기
  const handleImportKeyFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.qcc')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await connectWallet('import', { keyFile: file });
      if (result) {
        // 성공 시 모달은 useEffect에서 자동으로 닫힘
      }
    } catch (error) {
      console.error('Failed to import wallet from key file:', error);
    } finally {
      setIsLoading(false);
      // 파일 input 초기화
      event.target.value = '';
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
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto ${
          isClosing ? 'animate-modal-panel-out' : 'animate-modal-panel'
        }`}
      >
        {/* 헤더 */}
        <div
          className="p-6 text-white flex items-center justify-between sticky top-0 z-10 rounded-t-2xl"
          style={{ backgroundColor: 'var(--theme-bg, #04AAAB)' }}
        >
          <h2 className="text-xl font-bold" style={{ color: textColor }}>
            지갑 연결
          </h2>
          {/* <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button> */}
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('create')}
            disabled={isLoading}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            새 지갑 생성
          </button>
          <button
            onClick={() => setActiveTab('import')}
            disabled={isLoading}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Key className="w-5 h-5 inline mr-2" />
            지갑 가져오기
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {activeTab === 'create' ? (
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--theme-bg, #04AAAB)' }}
                >
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">새 지갑 생성</h3>
                <p className="text-gray-600">
                  12단어 복구 구문으로 새 지갑을 생성합니다.
                  <br />
                  <span className="text-red-600 font-semibold">복구 구문을 안전하게 보관하세요.</span>
                </p>
              </div>
              <button
                onClick={handleCreateWallet}
                disabled={isLoading}
                className="w-full text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--theme-bg, #04AAAB)' }}
              >
                {isLoading ? '생성 중...' : '지갑 생성하기'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">지갑 가져오기</h3>
                <p className="text-gray-600">기존 지갑을 복구 구문 또는 키파일로 가져옵니다.</p>
              </div>

              {/* 니모닉으로 복구 */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">복구 구문 (12단어)</label>
                <textarea
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="word1 word2 word3 ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <button
                  onClick={handleImportMnemonic}
                  disabled={isLoading || !mnemonic.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '복구 중...' : '복구 구문으로 가져오기'}
                </button>
              </div>

              {/* 구분선 */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500">또는</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* 키파일로 가져오기 */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">키파일 (.qcc)</label>
                <label className="block w-full bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-600 font-medium">키파일 선택하기</span>
                  <input
                    type="file"
                    accept="*/*"
                    onChange={handleImportKeyFile}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
