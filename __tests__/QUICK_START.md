# ⚡ Jest 빠른 시작 가이드

## 🎯 30초 요약

```bash
# 테스트 실행
npm test

# 파일 변경 시 자동 재실행
npm run test:watch
```

## 📝 테스트 작성 3단계

### 1단계: 테스트 파일 만들기

```typescript
// __tests__/lib/example.test.ts

import { myFunction } from '@/lib/example'

describe('myFunction', () => {
  it('1 + 1은 2여야 합니다', () => {
    const result = myFunction(1, 1)
    expect(result).toBe(2)
  })
})
```

### 2단계: 테스트 실행

```bash
npm test
```

### 3단계: 결과 확인

```
✓ myFunction › 1 + 1은 2여야 합니다
```

## 🔥 자주 쓰는 패턴

### 패턴 1: 기본 함수 테스트

```typescript
it('더하기 함수', () => {
  expect(add(1, 2)).toBe(3)
})
```

### 패턴 2: 컴포넌트 렌더링

```typescript
import { render, screen } from '@testing-library/react'

it('버튼이 보임', () => {
  render(<MyButton />)
  expect(screen.getByText('클릭')).toBeInTheDocument()
})
```

### 패턴 3: 버튼 클릭

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

it('버튼 클릭 시 텍스트 변경', () => {
  render(<Counter />)
  
  const button = screen.getByText('증가')
  fireEvent.click(button)
  
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

## 💡 핵심만 기억하기

```typescript
// 1. 그룹 만들기
describe('그룹명', () => {
  
  // 2. 테스트 작성
  it('테스트 설명', () => {
    
    // 3. 검증
    expect(값).toBe(기대값)
  })
})
```

## 🚨 자주하는 실수

### ❌ 잘못된 예

```typescript
it('테스트', () => {
  // 검증 없음 - 의미 없음!
  myFunction()
})
```

### ✅ 올바른 예

```typescript
it('테스트', () => {
  const result = myFunction()
  expect(result).toBe('success') // 검증 필수!
})
```

## 📌 Cheat Sheet

```typescript
// 기본
expect(값).toBe(5)              // 같음
expect(값).toEqual({ a: 1 })    // 객체 비교
expect(값).not.toBe(10)         // 같지 않음

// 참/거짓
expect(값).toBeTruthy()         // true
expect(값).toBeFalsy()          // false
expect(값).toBeNull()           // null

// 컴포넌트
screen.getByText('텍스트')      // 요소 찾기
fireEvent.click(button)         // 클릭
expect(el).toBeInTheDocument()  // 존재 확인
```

이제 `__tests__/lib/wallet-utils.test.ts`와 `__tests__/components/Header.test.tsx`를 열어보세요! 🎉

