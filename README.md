# QT Pay Web

Next.js 기반 웹 애플리케이션

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 정적 HTML 생성 (모바일 앱용)
npm run build
# next.config.js에서 output: 'export' 설정 필요
```

### 테스트

```bash
# 전체 테스트 실행
npm test

# Watch 모드
npm run test:watch
```

## 📁 프로젝트 구조

```
web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지 (SPA 라우팅)
│   └── globals.css         # 글로벌 스타일
│
├── components/             # React 컴포넌트
│   ├── Header.tsx          # 헤더
│   ├── Navigation.tsx      # 하단 네비게이션
│   └── screens/            # 화면 컴포넌트
│       ├── HomeScreen.tsx
│       ├── QRScreen.tsx
│       ├── LocationScreen.tsx
│       └── WalletScreen.tsx
│
├── lib/                    # 라이브러리 & 유틸리티
│   ├── WalletContext.tsx   # 지갑 상태 관리
│   ├── wallet-types.ts     # 타입 정의
│   ├── wallet-utils.ts     # 지갑 유틸 함수
│   └── balance-api.ts      # API 클라이언트
│
└── __tests__/              # 테스트 파일
    ├── components/
    └── lib/
```

## 🔑 주요 기능

### 1. 지갑 연결
- 새 지갑 생성 (12단어 니모닉)
- 니모닉으로 복구
- 키파일(.qcc) 가져오기

### 2. 지갑 관리
- 주소 표시
- 잔액 조회 (Quantum Chain API)
- 로컬 저장소에 암호화 저장

### 3. SPA 네비게이션
- Home: 대시보드
- QR: QR 스캔 (추후)
- Location: 가맹점 찾기 (추후)
- Wallet: 지갑 정보

## 🔐 보안

- 프라이빗 키는 AES-256으로 암호화
- localStorage에 암호화된 상태로 저장
- 키파일은 .qcc 확장자 사용

## 📦 주요 의존성

- `next`: React 프레임워크
- `react`: UI 라이브러리
- `tailwindcss`: CSS 프레임워크
- `bip39`: 니모닉 생성/검증
- `crypto-js`: 암호화
- `tweetnacl`: 암호화 연산
- `axios`: HTTP 클라이언트
- `lucide-react`: 아이콘
- `react-hot-toast`: 알림

## 🧪 테스트

Jest와 React Testing Library를 사용한 테스트:

```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test Header

# 커버리지 확인
npm test -- --coverage
```

테스트 가이드: [__tests__/README.md](./__tests__/README.md)







