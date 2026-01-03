import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dashboard Admin',
  description: 'Dashboard Admin Application',
  icons: {
    icon: [
      { url: '/img/icon_tabs.png' },
      { url: '/img/icon_tabs.png', sizes: '16x16', type: 'image/png' },
      { url: '/img/icon_tabs.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/img/icon_tabs.png',
    apple: '/img/icon_tabs.png',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
