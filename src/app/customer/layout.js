'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomerLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    // Verify customer is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/login', { method: 'GET' })
        const data = await res.json()

        if (!data.success || data.user?.role !== 'customer') {
          router.push('/auth/login')
        }
      } catch (error) {
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {children}
    </div>
  )
}
