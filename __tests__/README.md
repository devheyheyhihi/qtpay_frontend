# 🧪 Jest 테스트 가이드

Quantum PAY 프로젝트의 Jest 테스트 입문 가이드입니다.

## 📦 설치된 패키지

- `jest` - 테스트 프레임워크
- `@testing-library/react` - React 컴포넌트 테스트
- `@testing-library/jest-dom` - DOM Matcher 확장
- `jest-environment-jsdom` - 브라우저 환경 시뮬레이션

## 🚀 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# 특정 파일만 테스트
npm test wallet-utils

# 커버리지 확인
npm test -- --coverage
```

## 📁 테스트 파일 구조

```
__tests__/
├── lib/                      # 유틸리티 함수 테스트
│   └── wallet-utils.test.ts
├── components/               # 컴포넌트 테스트
│   └── Header.test.tsx
└── README.md                 # 이 파일
```

## 📝 Jest 기본 개념

### 1. 테스트 구조

```typescript
describe('테스트 그룹 이름', () => {
  // 각 테스트 전에 실행
  beforeEach(() => {
    // 초기화 작업
  })

  // 실제 테스트
  it('테스트 케이스 설명', () => {
    // 1. 준비 (Arrange)
    const data = '테스트 데이터'
    
    // 2. 실행 (Act)
    const result = someFunction(data)
    
    // 3. 검증 (Assert)
    expect(result).toBe('예상 결과')
  })
})
```

### 2. 주요 Matchers

```typescript
// 기본 비교
expect(value).toBe(5)                    // 정확히 같은 값 (===)
expect(value).toEqual({ a: 1 })          // 객체/배열 내용 비교
expect(value).not.toBe(10)               // 같지 않음

// 참/거짓
expect(value).toBeTruthy()               // true로 평가
expect(value).toBeFalsy()                // false로 평가
expect(value).toBeNull()                 // null
expect(value).toBeUndefined()            // undefined

// 숫자
expect(value).toBeGreaterThan(10)        // 10보다 큼
expect(value).toBeLessThan(20)           // 20보다 작음
expect(value).toBeCloseTo(10.5, 1)       // 근사값 (소수점)

// 문자열
expect(string).toContain('hello')        // 포함
expect(string).toMatch(/pattern/)        // 정규식 매칭

// 배열
expect(array).toContain(item)            // 항목 포함
expect(array).toHaveLength(5)            // 길이

// 객체
expect(obj).toHaveProperty('key')        // 속성 존재
expect(obj).toHaveProperty('key', 'value') // 속성과 값

// 함수 호출 (Mock)
expect(mockFn).toHaveBeenCalled()        // 호출됨
expect(mockFn).toHaveBeenCalledTimes(2)  // 2번 호출됨
expect(mockFn).toHaveBeenCalledWith(arg) // 특정 인자로 호출
```

### 3. React 컴포넌트 테스트

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

it('버튼 클릭 테스트', () => {
  // 렌더링
  render(<MyComponent />)
  
  // 요소 찾기
  const button = screen.getByText('클릭')
  
  // 이벤트 발생
  fireEvent.click(button)
  
  // 결과 확인
  expect(screen.getByText('완료')).toBeInTheDocument()
})
```

### 4. 요소 찾기 방법

```typescript
// 추천 순서 (위에서 아래로)

// 1. getByRole (가장 추천)
screen.getByRole('button', { name: '제출' })

// 2. getByLabelText (폼 요소)
screen.getByLabelText('이메일')

// 3. getByText (텍스트)
screen.getByText('환영합니다')

// 4. getByTestId (최후의 수단)
screen.getByTestId('custom-element')

// 차이점:
// getBy*   - 없으면 에러 (단언적)
// queryBy* - 없으면 null 반환 (존재하지 않음 확인할 때)
// findBy*  - 비동기, Promise 반환 (나중에 나타날 요소)
```

## 💡 실전 예제

### 예제 1: localStorage Mock 테스트

```typescript
it('localStorage에 저장', () => {
  const data = { name: 'test' }
  
  saveToStorage(data)
  
  expect(localStorage.setItem).toHaveBeenCalledWith(
    'key',
    JSON.stringify(data)
  )
})
```

### 예제 2: 비동기 함수 테스트

```typescript
it('API 호출', async () => {
  const result = await fetchData()
  
  expect(result).toEqual({ success: true })
})
```

### 예제 3: 사용자 상호작용

```typescript
import userEvent from '@testing-library/user-event'

it('입력 필드 테스트', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  const input = screen.getByLabelText('이메일')
  await user.type(input, 'test@example.com')
  
  expect(input).toHaveValue('test@example.com')
})
```

## 📚 더 배우기

- [Jest 공식 문서](https://jestjs.io/)
- [React Testing Library 문서](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎯 다음 단계

현재 구현된 테스트:
- ✅ wallet-utils 유틸리티 함수
- ✅ Header 컴포넌트

추가할 만한 테스트:
- [ ] balance-api (API mocking)
- [ ] WalletContext (상태 관리)
- [ ] 전체 화면 통합 테스트

질문이나 도움이 필요하면 언제든 물어보세요! 🚀
