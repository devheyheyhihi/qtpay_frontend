// 주소를 위도/경도로 변환하는 유틸리티

interface GeocodingResult {
  lat: number;
  lng: number;
}

/**
 * Kakao Maps SDK가 완전히 로드될 때까지 기다림
 */
function waitForKakaoMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.kakao) {
      reject(new Error('Kakao SDK가 로드되지 않았습니다.'));
      return;
    }

    if (window.kakao.maps) {
      // 이미 로드되어 있으면 load 호출
      window.kakao.maps.load(() => {
        resolve();
      });
    } else {
      reject(new Error('Kakao Maps API가 로드되지 않았습니다.'));
    }
  });
}

/**
 * Kakao API를 사용하여 주소를 위도/경도로 변환
 * @param address 주소 문자열
 * @returns 위도/경도 객체
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  // 먼저 Kakao Maps SDK가 완전히 로드될 때까지 기다림
  await waitForKakaoMaps();

  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services?.Geocoder) {
      reject(new Error('Kakao Geocoder가 로드되지 않았습니다.'));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        reject(new Error('주소를 찾을 수 없습니다.'));
      }
    });
  });
}

