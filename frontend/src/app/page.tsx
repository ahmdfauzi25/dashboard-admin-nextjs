'use client'

import { useEffect, useState } from 'react'
import MainBanner from '@/components/MainBanner'
import PromoBanner from '@/components/PromoBanner'
import GameGrid from '@/components/GameGrid'
import GameTopUpDetail from '@/components/GameTopUpDetail'
import TopUpForm from '@/components/TopUpForm'
import { Game } from '@/types/game'
import { Product } from '@/types/product'
import { getGames, testConnection } from '@/lib/api'

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [topUpData, setTopUpData] = useState<{
    playerId: string
    serverId: string
    nickname: string
    productId: number
    product: Product
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First test backend connection
      console.log('Testing backend connection...')
      const isConnected = await testConnection()
      
      if (!isConnected) {
        // Try to fetch games anyway - maybe health check failed but API works
        console.log('Health check failed, but trying to fetch games anyway...')
        try {
          const data = await getGames()
          if (data && data.length > 0) {
            setGames(data)
            setError(null)
            setLoading(false)
            return
          }
        } catch (fetchError) {
          console.error('Failed to fetch games:', fetchError)
        }
        
        setError('Backend tidak terhubung. Pastikan backend berjalan di http://localhost:3000 dan database terhubung.')
        setLoading(false)
        return
      }
      
      console.log('Backend connected, fetching games...')
      const data = await getGames()
      console.log('Fetched games data:', data)
      console.log('Games with images:', data.filter(g => g.imageUrl).length)
      
      if (data.length === 0) {
        setError('Tidak ada game tersedia. Silakan tambahkan game melalui dashboard admin.')
      } else {
        setGames(data)
        setError(null) // Clear error if successful
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Gagal memuat daftar game'
      setError(errorMessage)
      console.error('Error fetching games:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game)
    setTopUpData(null)
  }

  const handleBack = () => {
    if (topUpData) {
      setTopUpData(null)
    } else {
      setSelectedGame(null)
    }
  }

  const handleNext = (data: {
    playerId: string
    serverId: string
    nickname: string
    productId: number
    product: Product
  }) => {
    setTopUpData(data)
  }

  // Group games by category or type
  // Games Populer: First 12 games
  const popularGames = games.slice(0, 12)
  
  // Games Mobile: Filter by name containing "mobile" or category MOBA/Battle Royale
  const mobileGames = games.filter((g) => 
    g.name.toLowerCase().includes('mobile') ||
    g.category?.toLowerCase() === 'moba' ||
    g.category?.toLowerCase() === 'battle royale'
  ).slice(0, 12)
  
  // Games PC: Filter by name containing "pc" or specific PC games
  const pcGames = games.filter((g) => 
    g.name.toLowerCase().includes('pc') ||
    g.name.toLowerCase().includes('online') ||
    g.name.toLowerCase().includes('ragnarok online')
  ).slice(0, 12)
  
  // Entertainment: Filter by category or specific apps
  const entertainmentGames = games.filter((g) => 
    g.category?.toLowerCase().includes('entertainment') ||
    g.name.toLowerCase().includes('likee') ||
    g.name.toLowerCase().includes('wetv') ||
    g.name.toLowerCase().includes('iqiyi') ||
    g.name.toLowerCase().includes('tinder') ||
    g.name.toLowerCase().includes('bigo') ||
    g.name.toLowerCase().includes('starmaker')
  ).slice(0, 12)

  // If no specific category matches, use all games for each section
  const allGames = games.length > 0 ? games : []

  if (selectedGame && topUpData) {
    // Show final top up form with selected product
    return (
      <div className="max-w-4xl mx-auto">
        <TopUpForm 
          game={selectedGame} 
          onBack={handleBack}
          topUpData={topUpData}
        />
      </div>
    )
  }

  if (selectedGame) {
    // Show game detail with product selection
    return (
      <GameTopUpDetail 
        game={selectedGame} 
        onBack={handleBack}
        onNext={handleNext}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Promo Banner */}
      <PromoBanner />
      
      {/* Main Banner */}
      {/* <MainBanner /> */}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg text-center max-w-md mx-auto mb-8">
          <p>{error}</p>
          <button
            onClick={fetchGames}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Game Sections */}
      {!loading && !error && (
        <>
          {/* Games Populer */}
          {popularGames.length > 0 && (
            <GameGrid
              title="Games Populer"
              icon="🎮"
              games={popularGames}
              onGameSelect={handleGameSelect}
            />
          )}

          {/* Games Mobile */}
          {mobileGames.length > 0 ? (
            <GameGrid
              title="Games Mobile"
              icon="📱"
              games={mobileGames}
              onGameSelect={handleGameSelect}
            />
          ) : allGames.length > 0 && (
            <GameGrid
              title="Games Mobile"
              icon="📱"
              games={allGames.slice(0, 12)}
              onGameSelect={handleGameSelect}
            />
          )}

          {/* Games PC */}
          {pcGames.length > 0 ? (
            <GameGrid
              title="Games PC"
              icon="💻"
              games={pcGames}
              onGameSelect={handleGameSelect}
            />
          ) : allGames.length > 0 && (
            <GameGrid
              title="Games PC"
              icon="💻"
              games={allGames.slice(12, 24)}
              onGameSelect={handleGameSelect}
            />
          )}

          {/* Entertainment */}
          {entertainmentGames.length > 0 ? (
            <GameGrid
              title="Entertainment"
              icon="🎬"
              games={entertainmentGames}
              onGameSelect={handleGameSelect}
            />
          ) : allGames.length > 0 && (
            <GameGrid
              title="Entertainment"
              icon="🎬"
              games={allGames.slice(24, 36)}
              onGameSelect={handleGameSelect}
            />
          )}

          {/* Show all games if no specific categories */}
          {games.length > 0 && popularGames.length === 0 && (
            <GameGrid
              title="Semua Games"
              icon="🎮"
              games={games}
              onGameSelect={handleGameSelect}
            />
          )}

          {/* Empty State */}
          {games.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Tidak ada game tersedia</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
