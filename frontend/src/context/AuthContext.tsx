'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types/auth'
import { getCurrentUser } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      
      // Only allow CUSTOMER role to access top-up website
      if (currentUser) {
        const userRole = (currentUser.role || '').toUpperCase()
        if (userRole !== 'CUSTOMER') {
          console.warn('Non-customer user detected, clearing session')
          setUser(null)
          // Redirect to login if not customer
          if (typeof window !== 'undefined') {
            window.location.href = '/login?error=access_denied'
          }
        } else {
          setUser(currentUser)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

