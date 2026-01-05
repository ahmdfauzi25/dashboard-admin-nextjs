'use client'

import { useState, useEffect } from 'react'
import { PromoBanner } from '@/types/banner'
import { getPromoBanners } from '@/lib/api'

export default function PromoBanner() {
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
      }, 5000) // Change banner every 5 seconds

      return () => clearInterval(interval)
    }
  }, [banners.length])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const data = await getPromoBanners()
      setBanners(data)
      if (data.length > 0) {
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBannerClick = (banner: PromoBanner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank')
    }
  }

  if (loading || banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full mb-8 rounded-2xl overflow-hidden">
      {/* Banner Image */}
      {currentBanner.imageUrl && (
        <div
          className="relative w-full h-64 md:h-80 cursor-pointer"
          onClick={() => handleBannerClick(currentBanner)}
        >
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          
          {/* Overlay with title and description */}
          {(currentBanner.title || currentBanner.description) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
              <div className="w-full p-6">
                {currentBanner.title && (
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {currentBanner.title}
                  </h3>
                )}
                {currentBanner.description && (
                  <p className="text-white/90 text-sm md:text-base">
                    {currentBanner.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-orange-500 w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                aria-label="Previous banner"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex((prev) => (prev + 1) % banners.length)
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                aria-label="Next banner"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

