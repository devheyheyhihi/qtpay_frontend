'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, X, Camera, Loader2 } from 'lucide-react';
import { useWallet } from '@/lib/WalletContext';
import { encodeQRPayment, decodeQRPayment, QRPaymentData } from '@/lib/qr-payment-types';
import { scanQRFromVideo } from '@/lib/qr-scanner';
import { useQCCPrice } from '@/hooks/useQCCPrice';
import { nativeBridge } from '@/lib/native-bridge';
import dynamic from 'next/dynamic';

// QR 코드 생성 컴포넌트 (dynamic import)
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });

export default function SendReceiveScreen() {
  const { walletState, sendTransaction } = useWallet();
  const { price, loading: priceLoading } = useQCCPrice(60000);
  const [activeTab, setActiveTab] = useState<'receive' | 'send'>('receive');
  
  // 받기 상태
  const [krwAmount, setKrwAmount] = useState(''); // 원화 금액
  const [qccAmount, setQccAmount] = useState(''); // 계산된 QCC 금액
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQRData] = useState('');
  
  // 보내기 상태
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [scannedData, setScannedData] = useState<QRPaymentData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 원화 금액 변경 시 QCC 계산
  useEffect(() => {
    if (krwAmount && !priceLoading && price.krw > 0) {
      const krw = parseFloat(krwAmount);
      if (!isNaN(krw) && krw > 0) {
        const qcc = krw / price.krw;
        setQccAmount(qcc.toFixed(6)); // 소수점 6자리까지
      } else {
        setQccAmount('');
      }
    } else {
      setQccAmount('');
    }
  }, [krwAmount, price.krw, priceLoading]);

  // 받기: QR 생성
  const handleGenerateQR = () => {
    if (!walletState.address) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }
    
    if (!krwAmount || parseFloat(krwAmount) <= 0) {
      alert('원화 금액을 입력해주세요.');
      return;
    }

    if (!qccAmount || parseFloat(qccAmount) <= 0) {
      alert('QCC 금액을 계산할 수 없습니다.');
      return;
    }
    
    const qrString = encodeQRPayment(walletState.address, qccAmount);
    setQRData(qrString);
    setShowQR(true);
  };

  // 보내기: 카메라 시작
  const startCamera = async () => {
    console.log('🎥 카메라 시작 시도...');
    setIsLoadingCamera(true);
    
    // 네이티브 앱 환경인지 확인
    if (nativeBridge.isNative()) {
      console.log('📱 네이티브 앱 환경 - native-bridge 사용');
      
      try {
        // 네이티브 QR 스캐너 호출
        const result = await nativeBridge.scanQR();
        
        if (result.success && result.content) {
          console.log('✅ 네이티브 QR 스캔 성공:', result.content);
          
          // QR 데이터 파싱
          const paymentData = decodeQRPayment(result.content);
          console.log('📦 파싱된 결제 데이터:', paymentData);
          
          if (paymentData) {
            setScannedData(paymentData);
            setShowConfirm(true);
          } else {
            alert('유효하지 않은 QR 코드입니다.');
          }
        } else {
          console.log('❌ QR 스캔 실패:', result.error);
          if (result.error) {
            alert('QR 스캔 실패: ' + result.error);
          }
        }
      } catch (error: any) {
        console.error('❌ 네이티브 QR 스캔 오류:', error);
      } finally {
        setIsLoadingCamera(false);
      }
      
      return;
    }
    
    // 웹 환경 - HTML5 카메라 사용
    console.log('🌐 웹 환경 - HTML5 카메라 사용');
    
    try {
      // mediaDevices API 지원 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'HTTPS 필수: 이 브라우저는 카메라 접근을 지원하지 않습니다.\n\n' +
          '해결 방법:\n' +
          '1. Chrome 브라우저 사용\n' +
          '2. chrome://flags 에서 "Insecure origins treated as secure" 검색\n' +
          '3. 현재 주소(' + window.location.origin + ') 입력\n' +
          '4. Enabled 선택 후 Chrome 재시작'
        );
      }

      // 모바일은 후면 카메라, 데스크톱은 기본 카메라
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log('📱 디바이스 타입:', isMobile ? '모바일' : '데스크톱');
      
      const constraints = {
        video: isMobile 
          ? { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      console.log('🎬 미디어 제약:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ 스트림 획득 성공:', stream);
      console.log('📹 비디오 트랙:', stream.getVideoTracks());
      
      // 먼저 isScanning을 true로 설정하여 video 요소가 렌더링되도록
      setIsScanning(true);
      
      // 다음 프레임에서 video 요소에 스트림 설정
      setTimeout(() => {
        if (videoRef.current) {
          console.log('🎥 video 요소에 스트림 설정');
          videoRef.current.srcObject = stream;
          
          // 비디오 재생 시작
          videoRef.current.play()
            .then(() => {
              console.log('▶️ 비디오 재생 시작 성공');
              setIsLoadingCamera(false);
              startQRScanning();
            })
            .catch((playError) => {
              console.error('❌ 비디오 재생 실패:', playError);
              setIsLoadingCamera(false);
              alert('카메라를 시작할 수 없습니다: ' + playError.message);
            });
        } else {
          console.error('❌ video 요소를 찾을 수 없음');
          setIsLoadingCamera(false);
        }
      }, 100);
      
    } catch (error: any) {
      console.error('❌ 카메라 접근 실패:', error);
      console.error('에러 이름:', error.name);
      console.error('에러 메시지:', error.message);
      setIsLoadingCamera(false);
      alert('카메라 접근 권한이 필요합니다: ' + error.message);
    }
  };

  // 보내기: QR 스캔 시작
  const startQRScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      captureAndScan();
    }, 500); // 0.5초마다 스캔
  };

  // 보내기: 이미지 캡처 및 스캔
  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const qrData = await scanQRFromVideo(videoRef.current, canvasRef.current);
      
      if (qrData) {
        console.log('✅ QR 스캔 성공:', qrData);
        
        // QR 데이터 파싱
        const paymentData = decodeQRPayment(qrData);
        console.log('📦 파싱된 결제 데이터:', paymentData);
        
        if (paymentData) {
          // 스캔 성공!
          console.log('💰 전송 확인 모달 표시:', paymentData);
          setScannedData(paymentData);
          stopCamera();
          setShowConfirm(true);
        } else {
          console.warn('⚠️ 유효하지 않은 QR 코드 - 파싱 실패');
          alert('유효하지 않은 QR 코드입니다.');
        }
      }
    } catch (error) {
      console.error('❌ QR 스캔 실패:', error);
    }
  };

  // 보내기: 카메라 중지
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    setIsScanning(false);
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 보내기: 전송 확인
  const handleSendConfirm = async () => {
    if (!scannedData) {
      console.error('❌ scannedData가 없습니다!');
      return;
    }
    
    console.log('🚀 전송 시작:', scannedData);
    console.log('  - 받는 주소:', scannedData.address);
    console.log('  - 전송 금액:', scannedData.amount);
    
    const result = await sendTransaction(scannedData.address, scannedData.amount);
    console.log('📮 전송 결과:', result);
    
    if (result.success) {
      console.log('✅ 전송 성공!');
      setShowConfirm(false);
      setScannedData(null);
      setActiveTab('receive'); // 전송 완료 후 받기 탭으로 이동
    } else {
      console.error('❌ 전송 실패:', result.error);
      alert('전송 실패: ' + (result.error || '알 수 없는 오류'));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('receive')}
          className={`flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'receive'
              ? 'bg-[var(--theme-bg)] text-white shadow-md hover:bg-[var(--theme-bg-hover)] active:bg-[var(--theme-bg-active)]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowDownToLine className="w-5 h-5" />
          <span>받기</span>
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'send'
              ? 'bg-[var(--theme-bg)] text-white shadow-md hover:bg-[var(--theme-bg-hover)] active:bg-[var(--theme-bg-active)]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowUpFromLine className="w-5 h-5" />
          <span>보내기</span>
        </button>
      </div>

      {/* 받기 화면 */}
      {activeTab === 'receive' && (
        <div className="space-y-6">
          {!showQR ? (
            // 금액 입력 화면
            <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--theme-bg, #1e3a8a)' }}
                >
                  <ArrowDownToLine className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">받을 금액 입력</h3>
                <p className="text-gray-600">QR 코드를 생성하여 다른 사람에게 공유하세요</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    받을 금액 (원화) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={krwAmount}
                      onChange={(e) => setKrwAmount(e.target.value)}
                      placeholder="10,000"
                      className="w-full px-6 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-semibold text-gray-400">원</span>
                  </div>
                </div>

                {/* QCC 계산 결과 */}
                {krwAmount && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                    {priceLoading ? (
                      <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                        <p className="text-sm text-gray-600 mt-2">가격 정보를 불러오는 중...</p>
                      </div>
                    ) : qccAmount ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">QCC 금액</p>
                        <p className="text-2xl font-bold text-blue-600">{qccAmount} QCC</p>
                        <p className="text-xs text-gray-500 mt-1">
                          (1 QCC = ₩{price.krw.toLocaleString()})
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 text-center">가격 정보를 불러올 수 없습니다</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={!walletState.isConnected}
                className="w-full bg-[var(--theme-bg)] text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:bg-[var(--theme-bg-hover)] active:bg-[var(--theme-bg-active)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {walletState.isConnected ? 'QR 코드 생성하기' : '지갑을 먼저 연결하세요'}
              </button>
            </div>
          ) : (
            // QR 코드 표시 화면
            <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">QR 코드</h3>
                <button
                  onClick={() => {
                    setShowQR(false);
                    setKrwAmount('');
                    setQccAmount('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="flex justify-center p-6 bg-gray-50 rounded-2xl">
                <QRCodeSVG
                  value={qrData}
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">받을 금액</p>
                  <p className="text-3xl font-bold text-blue-600">{qccAmount} QCC</p>
                  <p className="text-sm text-gray-500 mt-2">≈ ₩{parseFloat(krwAmount || '0').toLocaleString()}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">내 지갑 주소</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {walletState.address}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowQR(false);
                    setKrwAmount('');
                    setQccAmount('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  닫기
                </button>
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md">
                  공유하기
                </button>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 사용 방법</strong><br />
              1. 받을 금액을 입력하세요<br />
              2. QR 코드를 생성하세요<br />
              3. 상대방이 QR 코드를 스캔하면 자동으로 금액이 입력됩니다
            </p>
          </div>
        </div>
      )}

      {/* 보내기 화면 */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {!isScanning ? (
            // 카메라 시작 버튼
            <div className="space-y-6">
              <button
                onClick={startCamera}
                disabled={isLoadingCamera}
                style={{ backgroundColor: 'var(--theme-bg)' }}
                className="w-full text-white font-semibold py-8 px-4 rounded-2xl transition-all shadow-md flex flex-col items-center justify-center space-y-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoadingCamera ? (
                  <>
                    <Loader2 className="w-16 h-16 animate-spin" />
                    <span className="text-xl">카메라 시작 중...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-16 h-16" />
                    <span className="text-xl">카메라로 QR 스캔</span>
                  </>
                )}
              </button>

              {/* 안내 메시지 */}
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ 주의사항</strong><br />
                  • 카메라 권한을 허용해주세요<br />
                  • 상대방의 QR 코드를 정확히 스캔하세요<br />
                  • 전송 후에는 취소할 수 없습니다
                </p>
              </div>
            </div>
          ) : (
            // 카메라 화면 (인라인)
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                <h3 className="text-white font-semibold">QR 코드 스캔</h3>
                <button
                  onClick={stopCamera}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="relative bg-black aspect-[4/3] sm:aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* 스캔 가이드 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 border-4 border-white/50 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                  </div>
                </div>

                {/* 스캐닝 애니메이션 라인 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 sm:w-64 sm:h-64">
                    <div className="w-full h-1 bg-blue-500 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 text-center">
                <p className="text-gray-700 text-sm font-medium">QR 코드를 사각형 안에 맞춰주세요</p>
                <p className="text-gray-500 text-xs mt-1">자동으로 인식됩니다</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 전송 확인 모달 */}
      {showConfirm && scannedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4" style={{ margin: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900">전송 확인</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">받는 주소</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {scannedData.address}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">보낼 금액</p>
                <p className="text-3xl font-bold text-blue-600">{scannedData.amount} QCC</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">내 잔액</p>
                <p className="text-lg font-bold text-gray-900">{walletState.balance.toFixed(5)} QCC</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setScannedData(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSendConfirm}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
