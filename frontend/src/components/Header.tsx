'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/api'

export default function Header() {
  const router = useRouter()
  const { user, loading, setUser, refreshUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Searching for:', searchQuery)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear user state even if API call fails
      setUser(null)
      router.push('/')
    } finally {
      setLoggingOut(false)
      setShowUserMenu(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e27] border-b border-[#1a1f3a]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 12c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-3-4c0 .83-.67 1.5-1.5 1.5S9 8.83 9 8s.67-1.5 1.5-1.5S12 7.17 12 8zm-5 4c0 .83-.67 1.5-1.5 1.5S4 12.83 4 12s.67-1.5 1.5-1.5S7 11.17 7 12zm11.5-1.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S20 12.83 20 12s-.67-1.5-1.5-1.5zM17.5 9.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S19 11.83 19 11s-.67-1.5-1.5-1.5zm-11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5S7 11.83 7 11s-.67-1.5-1.5-1.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
          <span className="text-white text-xl font-bold">Topupku</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 md:mx-8 hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari games favorit kamu"
              className="w-full px-4 py-2 pl-10 bg-[#1a1f3a] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        {/* Auth Area */}
        {loading ? (
          <div className="w-20 h-10 bg-[#1a1f3a] rounded-lg animate-pulse"></div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block">{user.name}</span>
              <svg
                className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-[#1a1f3a] border border-[#2a2f4a] rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-[#2a2f4a]">
                    <p className="text-white font-semibold truncate">{user.name}</p>
                    <p className="text-gray-400 text-sm break-words overflow-wrap-anywhere">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-white hover:text-orange-400 transition-colors text-sm"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm font-medium"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

