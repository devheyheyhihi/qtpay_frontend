import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/lib/WalletContext'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QT Pay - Quantum Chain 결제 시스템',
  description: 'Quantum Chain 기반 코인 결제 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* Kakao Map SDK - 전역 로드 (지오코딩 포함) */}
        <Script
          src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=7651d550f6ee5aa089d604dee4af6842&libraries=services&autoload=false"
          strategy="beforeInteractive"
        />
        
        <WalletProvider>
          {children}
          <Toaster position="top-right" />
        </WalletProvider>
      </body>
    </html>
  )
}
