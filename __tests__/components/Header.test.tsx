/**
 * 🧪 Header 컴포넌트 테스트
 * 
 * React Testing Library를 사용한 컴포넌트 테스트 예제입니다.
 */

import { render, screen } from '@testing-library/react'
import Header from '@/components/Header'

// 📝 describe: 테스트 그룹
describe('Header 컴포넌트', () => {
  
  // ✅ 가장 기본적인 테스트: 렌더링 확인
  it('정상적으로 렌더링되어야 합니다', () => {
    // 1. 컴포넌트 렌더링
    render(<Header />)
    
    // 2. 화면에 요소가 있는지 확인
    const heading = screen.getByText('Quantum PAY')
    
    // 3. 검증
    expect(heading).toBeInTheDocument()
  })

  it('설정 버튼이 표시되어야 합니다', () => {
    render(<Header />)
    
    // button role을 가진 요소 찾기
    const settingsButton = screen.getByRole('button')
    
    expect(settingsButton).toBeInTheDocument()
  })

  it('헤더에 올바른 스타일이 적용되어야 합니다', () => {
    const { container } = render(<Header />)
    
    // header 태그 찾기
    const header = container.querySelector('header')
    
    // header가 존재하는지 확인
    expect(header).toBeInTheDocument()
    
    // 특정 클래스가 있는지 확인 (Tailwind CSS)
    expect(header).toHaveClass('bg-gradient-to-r')
  })
})

/**
 * 💡 React Testing Library 주요 함수
 * 
 * render(component)                    - 컴포넌트 렌더링
 * screen.getByText('text')             - 텍스트로 요소 찾기
 * screen.getByRole('button')           - role로 요소 찾기
 * screen.getByTestId('test-id')        - test-id로 찾기
 * screen.queryByText('text')           - 없어도 에러 안남 (null 반환)
 * screen.findByText('text')            - 비동기로 찾기 (Promise)
 * 
 * 💡 사용자 상호작용 테스트는 다음 예제에서!
 */

