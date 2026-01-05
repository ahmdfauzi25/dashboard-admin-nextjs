'use client'

export default function MainBanner() {
  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-[#1a1f3a] via-[#2a2f4a] to-[#1a1f3a]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center md:justify-start px-8">
        <div className="flex items-center gap-6">
          {/* Game Controller Icon */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-6xl md:text-8xl">🎮</span>
          </div>

          {/* Logo Text */}
          <div className="hidden md:block">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              Topupku
            </h1>
            <p className="text-gray-300 text-lg">
              Top Up Game & Digital Goods
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

