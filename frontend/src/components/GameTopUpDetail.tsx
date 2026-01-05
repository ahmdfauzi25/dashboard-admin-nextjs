'use client'

import { useState, useEffect } from 'react'
import { Game } from '@/types/game'
import { Product } from '@/types/product'
import { getProductsByGameId } from '@/lib/api'

interface GameTopUpDetailProps {
  game: Game
  onBack: () => void
  onNext: (data: {
    playerId: string
    serverId: string
    nickname: string
    productId: number
    product: Product
  }) => void
}

export default function GameTopUpDetail({ game, onBack, onNext }: GameTopUpDetailProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    playerId: '',
    serverId: '',
    nickname: '',
  })
  const [checkingNickname, setCheckingNickname] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [game.id])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProductsByGameId(game.id)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckNickname = async () => {
    if (!formData.playerId.trim()) {
      alert('ID Player tidak boleh kosong')
      return
    }

    setCheckingNickname(true)
    // Simulate API call to check nickname
    setTimeout(() => {
      // In real implementation, this would call an API
      setFormData(prev => ({
        ...prev,
        nickname: `Player_${formData.playerId}` // Placeholder
      }))
      setCheckingNickname(false)
    }, 1000)
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleNext = () => {
    if (!formData.playerId.trim()) {
      alert('ID Player tidak boleh kosong')
      return
    }

    if (game.inputType === 'ID_SERVER' && !formData.serverId.trim()) {
      alert('Server ID tidak boleh kosong')
      return
    }

    if (!selectedProduct) {
      alert('Pilih nominal terlebih dahulu')
      return
    }

    onNext({
      playerId: formData.playerId,
      serverId: formData.serverId,
      nickname: formData.nickname,
      productId: selectedProduct.id,
      product: selectedProduct,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Game Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-6">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: game.imageUrl ? `url(${game.imageUrl})` : 'none',
            filter: 'blur(2px) brightness(0.5)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-blue-900/80 to-purple-900/80" />
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
            {game.name.toUpperCase()}
          </h1>
        </div>
      </div>

      {/* Game Image Card */}
      {game.imageUrl && (
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src={game.imageUrl}
              alt={game.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      )}

      {/* ID Player Section */}
      <div className="bg-[#1a1f3a] rounded-xl p-6 mb-6 border border-[#2a2f4a]">
        <h2 className="text-xl font-bold text-white mb-4">ID Player</h2>
        <div className="space-y-4">
          {/* ID Player */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID Player
            </label>
            <input
              type="text"
              value={formData.playerId}
              onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
              className="w-full px-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Masukkan ID Player"
            />
          </div>

          {/* Server ID - Conditional */}
          {game.inputType === 'ID_SERVER' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Server ID
              </label>
              <input
                type="text"
                value={formData.serverId}
                onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Masukkan Server ID"
              />
            </div>
          )}

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nickname
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={formData.nickname}
                readOnly
                className="flex-1 px-4 py-2 bg-[#0a0e27] border border-[#2a2f4a] rounded-lg text-white placeholder-gray-500"
                placeholder="Nickname akan muncul setelah dicek"
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={checkingNickname || !formData.playerId.trim()}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {checkingNickname ? 'Mengecek...' : 'Cek Nickname'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pilih Nominal Section */}
      <div className="bg-[#1a1f3a] rounded-xl p-6 mb-6 border border-[#2a2f4a]">
        <h2 className="text-xl font-bold text-white mb-4">Pilih Nominal</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Tidak ada produk tersedia untuk game ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className={`cursor-pointer bg-[#0a0e27] rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                  selectedProduct?.id === product.id
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                    : 'border-[#2a2f4a] hover:border-orange-500/50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <span className="text-3xl">💎</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-orange-400 font-bold text-sm">
                    {formatPrice(product.price)}
                  </p>
                  {product.description && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedProduct}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  )
}

