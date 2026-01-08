const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공하여 next.config.js와 .env 파일을 로드합니다
  dir: './',
})

// Jest에 전달할 커스텀 설정
const customJestConfig = {
  // 각 테스트 전에 실행할 설정 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 테스트 환경
  testEnvironment: 'jest-environment-jsdom',
  
  // 모듈 경로 별칭 (@/ 사용 가능)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // 테스트 파일 위치
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // 커버리지 수집 대상
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

// createJestConfig는 비동기이므로 Next.js가 설정을 로드할 수 있도록 내보냅니다
module.exports = createJestConfig(customJestConfig)

