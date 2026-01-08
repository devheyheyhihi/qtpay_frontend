# 카카오맵 API 설정 가이드

## 1. 카카오 개발자 계정 생성

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 로그인 (카카오 계정 필요)
3. 내 애플리케이션 → 애플리케이션 추가하기

## 2. 앱 키 발급

1. 애플리케이션 선택
2. 앱 키 확인
   - **JavaScript 키**를 복사하세요

## 3. 플랫폼 등록

1. 앱 설정 → 플랫폼 → Web 플랫폼 등록
2. 사이트 도메인 등록:
   - 개발: `http://localhost:3000`
   - 배포: `https://yourdomain.com`

## 4. 코드에 API 키 적용

`web/components/screens/LocationScreen.tsx` 파일의 다음 부분을 수정:

```tsx
// 27번째 줄
<Script
  src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&autoload=false`}
  //                                          ^^^^^^^^^^^^^^^^^^^
  //                                          여기에 발급받은 JavaScript 키를 넣으세요
```

### 예시:
```tsx
<Script
  src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=1234567890abcdef1234567890abcdef&autoload=false`}
```

## 5. 환경변수 사용 (권장)

보안을 위해 환경변수 사용을 권장합니다:

### `.env.local` 파일 생성
```bash
NEXT_PUBLIC_KAKAO_MAP_API_KEY=YOUR_KAKAO_APP_KEY
```

### 코드 수정
```tsx
<Script
  src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`}
/>
```

## 6. 테스트

```bash
cd web
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 Location 탭 확인

## 주요 기능

✅ **실시간 지도 표시** - 카카오맵 API 연동  
✅ **QCC 가맹점 마커** - 파란색 Q 마커로 표시  
✅ **인포윈도우** - 마커 클릭 시 가맹점 정보 표시  
✅ **현재 위치** - GPS로 현재 위치 이동  
✅ **가맹점 개수** - 좌측 하단에 표시  

## 문제 해결

### 지도가 안 나와요
- API 키가 올바르게 설정되었는지 확인
- 플랫폼 도메인이 등록되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 현재 위치가 안 나와요
- 브라우저 위치 권한 허용 필요
- HTTPS 환경에서만 작동 (localhost는 예외)

## 참고 자료

- [카카오맵 API 문서](https://apis.map.kakao.com/web/)
- [카카오 개발자 가이드](https://developers.kakao.com/docs/latest/ko/local/dev-guide)

