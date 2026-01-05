'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Topup Games', icon: '🎮' },
    { href: '/orders', label: 'Cek Pesanan', icon: '📋' },
    { href: '/prices', label: 'Daftar Harga', icon: '🏷️' },
    { href: '/guide', label: 'Panduan', icon: '📖' },
    { href: '/contact', label: 'Kontak Kami', icon: '📞' },
    { href: '/faq', label: 'Pertanyaan Umum', icon: '❓' },
    { href: '/terms', label: 'Syarat & Ketentuan', icon: '📄' },
  ]

  const socialLinks = [
    { href: '#', icon: '📺', label: 'YouTube' },
    { href: '#', icon: '📷', label: 'Instagram' },
    { href: '#', icon: '✈️', label: 'Telegram' },
    { href: '#', icon: '🎵', label: 'TikTok' },
    { href: '#', icon: '🔗', label: 'Share' },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0e27] border-r border-[#1a1f3a] overflow-y-auto z-40 transform -translate-x-full md:translate-x-0 transition-transform duration-300">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-[#1a1f3a]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 12c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-3-4c0 .83-.67 1.5-1.5 1.5S9 8.83 9 8s.67-1.5 1.5-1.5S12 7.17 12 8zm-5 4c0 .83-.67 1.5-1.5 1.5S4 12.83 4 12s.67-1.5 1.5-1.5S7 11.17 7 12zm11.5-1.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S20 12.83 20 12s-.67-1.5-1.5-1.5zM17.5 9.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S19 11.83 19 11s-.67-1.5-1.5-1.5zm-11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S7 11.83 7 11s-.67-1.5-1.5-1.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold">Topupku</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'text-gray-300 hover:bg-[#1a1f3a] hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Social Media */}
        <div className="p-4 border-t border-[#1a1f3a]">
          <div className="flex gap-3 justify-center mb-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="w-10 h-10 flex items-center justify-center bg-[#1a1f3a] rounded-lg hover:bg-[#2a2f4a] transition-colors"
                title={social.label}
              >
                <span className="text-lg">{social.icon}</span>
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Copyright © 2025 Topupku - All Right Reserved
          </p>
        </div>
      </div>
    </aside>
  )
}

