'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/login', { method: 'GET' })
        const data = await res.json()

        if (!data.success) {
          router.push('/auth/login')
          return
        }

        // Customer only
        if (data.user.role !== 'customer') {
          router.push('/dashboard')
          return
        }

        setUser(data.user)
      } catch (error) {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 w-full">
      {/* Navigation */}
      <nav className="bg-white shadow-lg w-full">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/img/ico_dash.png" alt="Logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold text-gray-900">Game Top Up</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-gray-700">Halo, <strong>{user.name}</strong></span>
            <Link
              href="/auth/logout"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Selamat Datang, {user.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Platform top up game terpercaya. Pilih game favorit Anda dan lakukan top up dengan mudah.
          </p>
          <div className="inline-block px-6 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
            ✓ Status: {user.is_verified ? 'Verified ✓' : 'Belum Verified'}
          </div>
        </div>

        {/* Game Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Game Populer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Game Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-4xl">🎮</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Legends</h3>
                <p className="text-gray-600 text-sm mb-4">Top up Diamond & Voucher</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                  Top Up Sekarang
                </button>
              </div>
            </div>

            {/* Game Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-4xl">⚔️</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free Fire</h3>
                <p className="text-gray-600 text-sm mb-4">Top up Diamond & Coin</p>
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold">
                  Top Up Sekarang
                </button>
              </div>
            </div>

            {/* Game Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                <span className="text-4xl">👑</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">PUBG Mobile</h3>
                <p className="text-gray-600 text-sm mb-4">Top up UC & Voucher</p>
                <button className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition font-semibold">
                  Top Up Sekarang
                </button>
              </div>
            </div>

            {/* Game Card 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-4xl">⭐</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Valorant</h3>
                <p className="text-gray-600 text-sm mb-4">Top up VP & Voucher</p>
                <button className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition font-semibold">
                  Top Up Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Top Up</h3>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">Rp 0</p>
            <p className="text-sm text-gray-600 mt-2">Belum ada transaksi</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaksi</h3>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Sukses</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-3xl font-bold text-green-600">Aktif</p>
            <p className="text-sm text-gray-600 mt-2">Akun verified</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Siap Top Up Game Favorit?</h3>
          <p className="text-gray-600 mb-6">
            Pilih game di atas dan mulai top up dengan aman dan cepat
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:opacity-90 transition">
            Jelajahi Semua Game
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2026 Game Top Up Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
