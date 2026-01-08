'use client';

import { useEffect, useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import AddressSearchModal from './AddressSearchModal';
import { DaumPostcodeData } from '@/lib/daum-postcode';
import { useWallet } from '@/lib/WalletContext';
import apiClient from '@/lib/api-client';
import { geocodeAddress } from '@/lib/geocoding';
import toast from 'react-hot-toast';

interface StoreRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreRegisterModal({ isOpen, onClose }: StoreRegisterModalProps) {
  const { walletState } = useWallet();
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

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

  // 주소 검색 완료
  const handleAddressComplete = (data: DaumPostcodeData) => {
    setAddress(data.address);
    console.log('선택된 주소:', data);
  };

  // 등록 버튼 클릭
  const handleSubmit = async () => {
    // 유효성 검사
    if (!walletState.isConnected || !walletState.address) {
      toast.error('먼저 지갑을 연결해주세요.');
      return;
    }

    if (!storeName.trim()) {
      toast.error('상점 이름을 입력해주세요.');
      return;
    }

    if (!address.trim()) {
      toast.error('상점 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 주소를 위도/경도로 변환
      toast.loading('주소를 확인하는 중...');
      const { lat, lng } = await geocodeAddress(address);

      // 2. 매장 등록 API 호출
      toast.loading('매장 등록 중...');
      const response = await apiClient.createStore({
        name: storeName,
        address,
        detailAddress: detailAddress || undefined,
        lat,
        lng,
        description: description || undefined,
        phone: phone || undefined,
        website: website || undefined,
        ownerAddress: walletState.address,
      });

      toast.dismiss();

      if (response.success) {
        toast.success('매장 등록 신청이 완료되었습니다!\n승인 대기 중입니다.');
        
        // 폼 초기화
        setStoreName('');
        setAddress('');
        setDetailAddress('');
        setDescription('');
        setPhone('');
        setWebsite('');
        
        onClose();
      } else {
        toast.error(response.error || '등록에 실패했습니다.');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('매장 등록 실패:', error);
      toast.error(error.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 ${
          isClosing ? 'animate-modal-overlay-out' : 'animate-modal-overlay'
        }`}
        style={{ margin: 0 }}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col ${
            isClosing ? 'animate-modal-panel-out' : 'animate-modal-panel'
          }`}
        >
          {/* 헤더 */}
          <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Store 등록</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* 폼 영역 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* 상점 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상점 이름<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="상점 이름을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* 상점 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상점 주소<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  readOnly
                  onClick={() => setIsAddressSearchOpen(true)}
                  placeholder="주소를 검색하세요"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white"
                />
                <button
                  onClick={() => setIsAddressSearchOpen(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* 상세 주소 */}
            {address && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 주소
                </label>
                <input
                  type="text"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  placeholder="상세 주소를 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            )}

            {/* 상점 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상점 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="상점에 대한 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>

            {/* 전화번호 (선택사항) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호 <span className="text-gray-400">(선택사항)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* 웹사이트 (선택사항) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                웹사이트 <span className="text-gray-400">(선택사항)</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0 space-y-2">
            {!walletState.isConnected && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 text-center">
                  ⚠️ 매장 등록을 위해 지갑을 먼저 연결해주세요
                </p>
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !walletState.isConnected}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>등록 중...</span>
                </>
              ) : (
                <span>등록하기</span>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
          </div>
        </div>
      </div>

      {/* 주소 검색 모달 (화면 전체) */}
      <AddressSearchModal
        isOpen={isAddressSearchOpen}
        onClose={() => setIsAddressSearchOpen(false)}
        onComplete={handleAddressComplete}
      />
    </>
  );
}
