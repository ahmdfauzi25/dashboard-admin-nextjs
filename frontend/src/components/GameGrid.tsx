'use client'

import { useState } from 'react'
import { Game } from '@/types/game'

interface GameGridProps {
  title: string
  icon: string
  games: Game[]
  onGameSelect: (game: Game) => void
}

interface GameImageProps {
  game: Game
}

function GameImage({ game }: GameImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  if (!game.imageUrl || imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a]">
        <span className="text-4xl">🎮</span>
      </div>
    )
  }

  return (
    <>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}
      <img
        src={game.imageUrl}
        alt={game.name}
        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading="eager"
        onLoad={() => {
          setImageLoading(false)
          console.log('Image loaded successfully for game:', game.name, 'URL:', game.imageUrl)
        }}
        onError={(e) => {
          console.error('Image load error for game:', game.name, 'URL:', game.imageUrl)
          setImageError(true)
          setImageLoading(false)
        }}
      />
    </>
  )
}

export default function GameGrid({ title, icon, games, onGameSelect }: GameGridProps) {
  if (games.length === 0) return null

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => onGameSelect(game)}
            className="group cursor-pointer bg-[#1a1f3a] rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20"
          >
            {/* Game Image */}
            <div className="relative w-full aspect-square bg-gradient-to-br from-[#2a2f4a] to-[#1a1f3a] overflow-hidden">
              <GameImage game={game} />
            </div>

            {/* Game Info */}
            <div className="p-3">
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
                {game.name}
              </h3>
              {game.description && (
                <p className="text-gray-400 text-xs line-clamp-1">
                  {game.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

