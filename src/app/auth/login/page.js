'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to root login page
export default function AuthLoginPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/')
  }, [router])
  
  return null
}
