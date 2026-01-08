/**
 * Web-Native 통신 브릿지
 * 
 * 웹에서 React Native 네이티브 기능을 호출하는 인터페이스
 */

export interface NativeMessage {
  type: string;
  payload?: any;
}

export interface QRScanResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface BiometricResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SecureStorageResult {
  success: boolean;
  key: string;
  value?: string | null;
  error?: string;
}

// Native 환경 감지
export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // React Native WebView 환경 감지
  return !!(
    (window as any).ReactNativeWebView ||
    (window as any).isReactNativeWebView ||
    (navigator.userAgent.includes('QTPayMobile'))
  );
};

// Native로 메시지 전송
export const sendToNative = (message: NativeMessage): void => {
  if (!isNativeApp()) {
    console.warn('[NativeBridge] 네이티브 앱 환경이 아닙니다.');
    return;
  }

  try {
    // React Native WebView postMessage 사용
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
    } else {
      // 일반 postMessage (App.tsx에서 처리)
      window.postMessage(JSON.stringify(message), '*');
    }
  } catch (error) {
    console.error('[NativeBridge] 메시지 전송 실패:', error);
  }
};

// 네이티브 브릿지 API
export const nativeBridge = {
  /**
   * 플랫폼 확인
   */
  isNative: isNativeApp,

  /**
   * QR 코드 스캔
   */
  scanQR: (): Promise<QRScanResult> => {
    return new Promise((resolve, reject) => {
      if (!isNativeApp()) {
        reject(new Error('네이티브 앱에서만 사용 가능합니다.'));
        return;
      }

      const handleResponse = (event: MessageEvent) => {
        try {
          const message = typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;

          if (message.type === 'QR_SCANNED') {
            window.removeEventListener('message', handleResponse);
            resolve(message.data);
          } else if (message.type === 'QR_SCAN_CANCELLED') {
            // 취소 메시지 처리
            console.log('[NativeBridge] QR 스캔 취소됨');
            window.removeEventListener('message', handleResponse);
            reject(new Error(message.data.error || '사용자가 QR 스캔을 취소했습니다.'));
          }
        } catch (error) {
          console.error('[NativeBridge] QR 응답 파싱 실패:', error);
        }
      };

      window.addEventListener('message', handleResponse);

      // 타임아웃 설정 (30초)
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('QR 스캔 타임아웃'));
      }, 30000);

      sendToNative({ type: 'SCAN_QR' });
    });
  },

  /**
   * 생체 인증 (Face ID / Touch ID / 지문)
   */
  biometricAuth: (message?: string): Promise<BiometricResult> => {
    return new Promise((resolve, reject) => {
      if (!isNativeApp()) {
        reject(new Error('네이티브 앱에서만 사용 가능합니다.'));
        return;
      }

      const handleResponse = (event: MessageEvent) => {
        try {
          const msg = typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;

          if (msg.type === 'BIOMETRIC_RESULT') {
            window.removeEventListener('message', handleResponse);
            resolve(msg.data);
          }
        } catch (error) {
          console.error('[NativeBridge] 생체인증 응답 파싱 실패:', error);
        }
      };

      window.addEventListener('message', handleResponse);

      // 타임아웃 설정 (60초)
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('생체 인증 타임아웃'));
      }, 60000);

      sendToNative({
        type: 'BIOMETRIC_AUTH',
        payload: { message: message || '지갑 잠금 해제' },
      });
    });
  },

  /**
   * 보안 저장소에 저장
   */
  saveSecure: (key: string, value: string): Promise<SecureStorageResult> => {
    return new Promise((resolve, reject) => {
      if (!isNativeApp()) {
        // 네이티브가 아니면 localStorage 사용
        try {
          localStorage.setItem(key, value);
          resolve({ success: true, key });
        } catch (error) {
          reject(error);
        }
        return;
      }

      const handleResponse = (event: MessageEvent) => {
        try {
          const message = typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;

          if (message.type === 'SECURE_SAVE_RESULT') {
            window.removeEventListener('message', handleResponse);
            if (message.data.success) {
              resolve(message.data);
            } else {
              reject(new Error(message.data.error));
            }
          }
        } catch (error) {
          console.error('[NativeBridge] 저장 응답 파싱 실패:', error);
        }
      };

      window.addEventListener('message', handleResponse);

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('저장 타임아웃'));
      }, 10000);

      sendToNative({
        type: 'SAVE_SECURE',
        payload: { key, value },
      });
    });
  },

  /**
   * 보안 저장소에서 불러오기
   */
  loadSecure: (key: string): Promise<SecureStorageResult> => {
    return new Promise((resolve, reject) => {
      if (!isNativeApp()) {
        // 네이티브가 아니면 localStorage 사용
        try {
          const value = localStorage.getItem(key);
          resolve({ success: true, key, value });
        } catch (error) {
          reject(error);
        }
        return;
      }

      const handleResponse = (event: MessageEvent) => {
        try {
          const message = typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;

          if (message.type === 'SECURE_LOAD_RESULT') {
            window.removeEventListener('message', handleResponse);
            if (message.data.success) {
              resolve(message.data);
            } else {
              reject(new Error(message.data.error));
            }
          }
        } catch (error) {
          console.error('[NativeBridge] 불러오기 응답 파싱 실패:', error);
        }
      };

      window.addEventListener('message', handleResponse);

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('불러오기 타임아웃'));
      }, 10000);

      sendToNative({
        type: 'LOAD_SECURE',
        payload: { key },
      });
    });
  },

  /**
   * 보안 저장소에서 삭제
   */
  deleteSecure: (key: string): Promise<SecureStorageResult> => {
    return new Promise((resolve, reject) => {
      if (!isNativeApp()) {
        // 네이티브가 아니면 localStorage 사용
        try {
          localStorage.removeItem(key);
          resolve({ success: true, key });
        } catch (error) {
          reject(error);
        }
        return;
      }

      const handleResponse = (event: MessageEvent) => {
        try {
          const message = typeof event.data === 'string' 
            ? JSON.parse(event.data) 
            : event.data;

          if (message.type === 'SECURE_DELETE_RESULT') {
            window.removeEventListener('message', handleResponse);
            if (message.data.success) {
              resolve(message.data);
            } else {
              reject(new Error(message.data.error));
            }
          }
        } catch (error) {
          console.error('[NativeBridge] 삭제 응답 파싱 실패:', error);
        }
      };

      window.addEventListener('message', handleResponse);

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('삭제 타임아웃'));
      }, 10000);

      sendToNative({
        type: 'DELETE_SECURE',
        payload: { key },
      });
    });
  },

};

// 사용 예시 (주석)
/*
// QR 스캔
try {
  const result = await nativeBridge.scanQR();
  if (result.success) {
    console.log('QR 내용:', result.content);
  }
} catch (error) {
  console.error('QR 스캔 실패:', error);
}

// 생체 인증
try {
  const result = await nativeBridge.biometricAuth('결제 승인');
  if (result.success) {
    console.log('인증 성공');
  }
} catch (error) {
  console.error('인증 실패:', error);
}

// 보안 저장
try {
  await nativeBridge.saveSecure('privateKey', encryptedKey);
  console.log('저장 완료');
} catch (error) {
  console.error('저장 실패:', error);
}

// 보안 불러오기
try {
  const result = await nativeBridge.loadSecure('privateKey');
  console.log('불러온 값:', result.value);
} catch (error) {
  console.error('불러오기 실패:', error);
}
*/

