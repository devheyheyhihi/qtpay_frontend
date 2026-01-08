/**
 * 🧪 wallet-utils.ts 테스트
 * 
 * Jest 기초를 익히기 위한 간단한 테스트 예제입니다.
 */

import * as bip39 from 'bip39'
import { saveWalletToStorage, loadWalletFromStorage, clearWalletFromStorage } from '@/lib/wallet-utils'
import type { WalletState } from '@/lib/wallet-types'

// 📝 describe: 테스트 그룹을 만듭니다 (폴더 같은 개념)
describe('wallet-utils 테스트', () => {
  
  // 🧹 beforeEach: 각 테스트 전에 실행됩니다
  beforeEach(() => {
    // localStorage를 깨끗하게 초기화
    localStorage.clear()
  })

  // 📝 describe 안에 또 describe를 만들 수 있습니다 (하위 그룹)
  describe('LocalStorage 관련 함수', () => {
    
    // ✅ it 또는 test: 실제 테스트 케이스
    it('지갑 정보를 localStorage에 저장할 수 있어야 합니다', () => {
      // 1. 준비 (Arrange): 테스트에 필요한 데이터 준비
      const mockWallet: WalletState = {
        isConnected: true,
        address: 'test-address-123',
        balance: 100,
        privateKey: 'test-private-key',
        mnemonic: 'test mnemonic phrase',
        isLoading: false,
        isHydrated: true,
      }

      // 2. 실행 (Act): 테스트할 함수 실행
      saveWalletToStorage(mockWallet)

      // 3. 검증 (Assert): 결과가 예상과 맞는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'wallet',
        JSON.stringify(mockWallet)
      )
    })

    it('localStorage에서 지갑 정보를 불러올 수 있어야 합니다', () => {
      // Mock 데이터 준비
      const mockWallet: WalletState = {
        isConnected: true,
        address: 'test-address-456',
        balance: 200,
        privateKey: 'test-private-key-2',
        mnemonic: 'test mnemonic phrase 2',
        isLoading: false,
        isHydrated: true,
      }

      // localStorage에 mock 데이터 설정
      ;(localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(mockWallet)
      )

      // 함수 실행
      const loadedWallet = loadWalletFromStorage()

      // 검증
      expect(loadedWallet).toEqual(mockWallet)
      expect(localStorage.getItem).toHaveBeenCalledWith('wallet')
    })

    it('localStorage에 데이터가 없으면 null을 반환해야 합니다', () => {
      // localStorage.getItem이 null을 반환하도록 설정
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

      // 함수 실행
      const loadedWallet = loadWalletFromStorage()

      // 검증: null이어야 함
      expect(loadedWallet).toBeNull()
    })

    it('localStorage의 지갑 정보를 삭제할 수 있어야 합니다', () => {
      // 함수 실행
      clearWalletFromStorage()

      // 검증: removeItem이 호출되었는지 확인
      expect(localStorage.removeItem).toHaveBeenCalledWith('wallet')
    })
  })

  // 📝 실제 외부 라이브러리 사용 예제
  describe('BIP39 니모닉 검증', () => {
    it('올바른 12단어 니모닉은 유효해야 합니다', () => {
      // 실제 bip39로 니모닉 생성
      const mnemonic = bip39.generateMnemonic()
      
      // 검증
      const isValid = bip39.validateMnemonic(mnemonic)
      expect(isValid).toBe(true)
    })

    it('잘못된 니모닉은 유효하지 않아야 합니다', () => {
      const invalidMnemonic = 'invalid mnemonic phrase test'
      
      // 검증
      const isValid = bip39.validateMnemonic(invalidMnemonic)
      expect(isValid).toBe(false)
    })
  })
})

/**
 * 💡 Jest 기본 Matchers (검증 함수들)
 * 
 * expect(value).toBe(expected)           - 값이 정확히 같은지 (===)
 * expect(value).toEqual(expected)        - 객체/배열 내용이 같은지
 * expect(value).toBeNull()               - null인지
 * expect(value).toBeTruthy()             - true로 평가되는지
 * expect(value).toBeFalsy()              - false로 평가되는지
 * expect(fn).toHaveBeenCalled()          - 함수가 호출되었는지
 * expect(fn).toHaveBeenCalledWith(arg)   - 특정 인자로 호출되었는지
 * expect(string).toContain(substring)    - 문자열이 포함되는지
 * expect(array).toContain(item)          - 배열에 항목이 있는지
 */
