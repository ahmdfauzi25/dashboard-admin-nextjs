import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Topupku - Top Up Game & Digital Goods',
  description: 'Website top up game terpercaya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-[#0a0e27]">
            <Header />
            <Sidebar />
            <main className="ml-0 md:ml-64 pt-20 md:pt-20 p-4 md:p-6">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
