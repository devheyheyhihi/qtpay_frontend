'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { DaumPostcodeData } from '@/lib/daum-postcode';

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: DaumPostcodeData) => void;
}

export default function AddressSearchModal({ isOpen, onClose, onComplete }: AddressSearchModalProps) {
  const postcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !postcodeRef.current || !window.daum) return;

    // Daum Postcode API를 div에 embed
    const postcode = new window.daum.Postcode({
      oncomplete: function(data: DaumPostcodeData) {
        onComplete(data);
        onClose();
      },
      onclose: function() {
        onClose();
      },
      width: '100%',
      height: '100%',
    });

    postcode.embed(postcodeRef.current);
  }, [isOpen, onComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between flex-shrink-0 shadow-lg">
        <h2 className="text-xl font-bold">주소 검색</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Daum Postcode 영역 - 화면 전체 */}
      <div ref={postcodeRef} className="flex-1 w-full" />
    </div>
  );
}

