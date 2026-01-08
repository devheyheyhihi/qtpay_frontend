// Jest DOM matchers 추가 (toBeInTheDocument 등)
import '@testing-library/jest-dom'

// 전역 Mock 설정
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }
}

// localStorage Mock
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})

// console 경고 무시 (필요시)
// global.console = {
//   ...console,
//   warn: jest.fn(),
//   error: jest.fn(),
// }

