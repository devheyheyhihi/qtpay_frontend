# 현재 구현 분석: WalletContext.tsx

## 🔍 현재 구현 분석

### 1. PrivateKey 접근 가능 여부

**답변: ✅ 네, 접근 가능합니다**

```typescript
// WalletContext.tsx
const [walletState, setWalletState] = useState<WalletState>({
  privateKey: null,  // line 31
  // ...
});

// 어디서든 접근 가능
const { walletState } = useWallet();
const privateKey = walletState.privateKey; // ✅ 직접 접근 가능
```

**접근 방법:**
1. `walletState.privateKey`로 직접 접근
2. `useWallet()` hook을 통해 어디서든 접근 가능
3. 트랜잭션 전송 시 바로 사용 가능

---

## 🚨 현재 구현의 보안 문제점

### 문제 1: PrivateKey가 State에 평문으로 저장됨

```typescript
// line 85, 124, 173
const newWallet: WalletState = {
  privateKey: walletInfo.wallet.private_key, // ❌ 평문 저장
  mnemonic: walletInfo.wallet.mnemonic,      // ❌ 평문 저장
  // ...
};
```

**위험도:** 🔴 **매우 위험**

**문제점:**
- React DevTools로 즉시 확인 가능
- 메모리 덤프로 추출 가능
- 컴포넌트 렌더링 시 노출 가능

---

### 문제 2: localStorage에 평문 저장 가능성

```typescript
// line 68
useEffect(() => {
  if (walletState.isConnected) {
    saveWalletToStorage(walletState); // ❌ privateKey 포함하여 저장
  }
}, [walletState]);
```

**위험도:** 🔴 **매우 위험**

**예상되는 저장 방식:**
```typescript
// wallet-utils.ts (추정)
export const saveWalletToStorage = (wallet: WalletState) => {
  localStorage.setItem('wallet', JSON.stringify({
    privateKey: wallet.privateKey,  // ❌ 평문 저장
    mnemonic: wallet.mnemonic,      // ❌ 평문 저장
    address: wallet.address,
  }));
};
```

**문제점:**
- 개발자 도구로 즉시 확인 가능
- XSS 공격 시 즉시 유출
- 앱 삭제 전까지 계속 저장됨

---

### 문제 3: 생체 인증 없음

```typescript
// line 40
const savedWallet = await loadWalletFromStorage();
if (savedWallet) {
  setWalletState(savedWallet); // ❌ 인증 없이 로드
}
```

**위험도:** 🟠 **위험**

**문제점:**
- 기기 분실 시 즉시 접근 가능
- 앱 실행 시 자동으로 키 로드
- 추가 인증 없음

---

### 문제 4: 암호화 없음

**현재 구현:**
- PrivateKey가 평문으로 저장됨
- 비밀번호 기반 암호화 없음
- 저장 시 암호화 없음

**위험도:** 🔴 **매우 위험**

---

### 문제 5: 메모리 보호 없음

```typescript
// privateKey가 계속 메모리에 유지됨
const [walletState, setWalletState] = useState({
  privateKey: walletInfo.wallet.private_key, // 계속 메모리에 존재
});
```

**위험도:** 🟡 **보통 위험**

**문제점:**
- 메모리 덤프 공격 취약
- 앱 백그라운드 시에도 메모리에 존재
- 사용 후 제거 없음

---

## 📊 현재 구현 vs 보안 강화 비교

| 항목 | 현재 구현 | 보안 강화 | 차이 |
|------|----------|----------|------|
| **PrivateKey 접근** | ✅ 가능 (평문) | ✅ 가능 (암호화) | 접근은 가능하지만 보안 수준 다름 |
| **저장 방식** | ❌ localStorage 평문 | ✅ Secure Storage 암호화 | 매우 큰 차이 |
| **생체 인증** | ❌ 없음 | ✅ 있음 | 큰 차이 |
| **암호화** | ❌ 없음 | ✅ AES-256-GCM | 매우 큰 차이 |
| **메모리 보호** | ❌ 없음 | ✅ 사용 후 제거 | 보통 차이 |
| **비밀번호 보호** | ❌ 없음 | ✅ 비밀번호 필요 | 매우 큰 차이 |

---

## ✅ PrivateKey 접근 가능 여부

### 현재 구현: ✅ 접근 가능

```typescript
// 방법 1: Context에서 직접 접근
const { walletState } = useWallet();
const privateKey = walletState.privateKey;

// 방법 2: 트랜잭션 전송 시
const sendTx = async () => {
  const { walletState } = useWallet();
  await sendTransaction({
    privateKey: walletState.privateKey, // ✅ 바로 사용 가능
    toAddress: '0x...',
    amount: '100'
  });
};
```

**장점:**
- 간단하고 직관적
- 바로 사용 가능

**단점:**
- 보안 위험 매우 높음
- 평문으로 저장됨

---

## 🔒 보안 강화 후 PrivateKey 접근

### 보안 강화 구현: ✅ 접근 가능 (하지만 안전함)

```typescript
// 방법 1: 보안 강화된 접근
const { walletState } = useWallet();
const privateKey = await getSecurePrivateKey('wallet', password);
// → 생체 인증 자동 요구됨

// 방법 2: 트랜잭션 전송 시
const sendTx = async () => {
  await sendSecureTransaction({
    keyId: 'wallet',
    password: userPassword,
    toAddress: '0x...',
    amount: '100'
  });
  // → 내부적으로 생체 인증 + 암호화 처리
};
```

**장점:**
- 암호화 저장
- 생체 인증 보호
- Secure Storage 사용
- 메모리 보호

**단점:**
- 구현이 복잡함
- 비밀번호 필요

---

## 🎯 결론

### 1. PrivateKey 접근 가능 여부

**현재 구현:** ✅ **접근 가능**
- `walletState.privateKey`로 직접 접근 가능
- 하지만 **평문으로 저장되어 매우 위험**

**보안 강화 후:** ✅ **접근 가능**
- 보안 강화된 방법으로 접근 가능
- **암호화 + 생체 인증으로 보호됨**

---

### 2. 보안 부분에서 더 좋은가?

**답변: ✅ 네, 보안 강화가 훨씬 좋습니다**

**현재 구현의 문제점:**
1. ❌ PrivateKey가 평문으로 저장됨
2. ❌ localStorage에 평문 저장 (추정)
3. ❌ 생체 인증 없음
4. ❌ 암호화 없음
5. ❌ 메모리 보호 없음

**보안 강화 후:**
1. ✅ 암호화 저장 (AES-256-GCM)
2. ✅ Secure Storage 사용 (Keychain/Keystore)
3. ✅ 생체 인증 필수
4. ✅ 비밀번호 기반 보호
5. ✅ 메모리 보호 (사용 후 제거)

---

## 📈 실제 시나리오 비교

### 시나리오 1: 개발자 도구로 확인

**현재 구현:**
```
개발자 도구 열기 → Application → Local Storage → wallet → privateKey 확인 ✅
→ 즉시 키 유출 ❌
```

**보안 강화:**
```
개발자 도구 열기 → Application → Local Storage → encryptedKey 확인
→ 암호화된 데이터만 확인 가능 ✅
→ 비밀번호 없이는 복호화 불가능 ✅
```

---

### 시나리오 2: 기기 분실

**현재 구현:**
```
기기 분실 → 앱 실행 → 자동으로 키 로드 → 즉시 접근 가능 ❌
```

**보안 강화:**
```
기기 분실 → 앱 실행 → 생체 인증 요구 → 비밀번호 필요 → 접근 불가능 ✅
```

---

### 시나리오 3: XSS 공격

**현재 구현:**
```
XSS 공격 → localStorage.getItem('wallet') → privateKey 유출 ❌
```

**보안 강화:**
```
XSS 공격 → Secure Storage 접근 시도 → 하드웨어 보안 모듈 차단 ✅
또는 암호화된 데이터만 획득 → 비밀번호 없이는 복호화 불가능 ✅
```

---

## 💡 권장사항

### 즉시 개선 필요

1. **암호화 저장 필수**
   - PrivateKey를 평문으로 저장하지 않기
   - AES-256-GCM 암호화 사용

2. **Secure Storage 사용**
   - localStorage 대신 Keychain/Keystore 사용
   - 하이브리드 앱이라면 필수

3. **생체 인증 추가**
   - 키 접근 시 생체 인증 요구
   - 사용자 편의성과 보안 균형

4. **비밀번호 기반 보호**
   - 사용자 비밀번호로 암호화
   - 여러 계층의 보안

5. **메모리 보호**
   - 사용 후 즉시 메모리에서 제거
   - 앱 백그라운드 시 자동 제거

---

## 🚀 다음 단계

현재 구현을 보안 강화된 버전으로 업그레이드하는 것을 **강력히 권장**합니다.

**특히:**
- PrivateKey 접근은 가능하지만, 보안 수준이 완전히 다릅니다
- 현재는 매우 위험한 상태입니다
- 보안 강화를 적용하면 안전하게 사용 가능합니다

