'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e27]">
      <div className="bg-[#1a1f3a] rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-[#2a2f4a]">
        <h2 className="text-2xl font-bold text-white mb-4">Terjadi Kesalahan</h2>
        <p className="text-gray-400 mb-6">{error.message || 'Something went wrong!'}</p>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}

