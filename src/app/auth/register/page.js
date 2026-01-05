'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'USER' // Default role for admin/reseller registration
        }),
        credentials: 'include'
      })

      // Check if response is ok before parsing JSON
      let data
      try {
        const text = await response.text()
        if (!text) {
          setError(`Server returned empty response (${response.status})`)
          setIsLoading(false)
          return
        }
        data = JSON.parse(text)
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError)
        console.error('Response status:', response.status)
        setError(`Server error: Unable to parse response. Status: ${response.status}. Please check server logs and ensure DATABASE_URL is set in .env file.`)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        // Show more detailed error message from backend
        const errorMessage = data?.error || data?.message || `Registration failed (${response.status})`
        console.error('Registration failed:', errorMessage)
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      // Registration successful
      setSuccess('Registration successful! Redirecting to login...')
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error: Cannot connect to server. Please check if the server is running.')
      } else if (error.message) {
        setError(`Error: ${error.message}`)
      } else {
        setError('An error occurred. Please try again.')
      }
      
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-moving-bg"
        style={{
          backgroundImage: 'url(/img/bg_login.jpg)',
          zIndex: 0
        }}
      />
      
      {/* Overlay untuk kontras */}
      <div className="absolute inset-0 bg-gray-900/40 z-10" />
      
      <div className="w-full max-w-md relative z-20">
        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-lg relative">
          {/* Window Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>

          {/* Header with Title and Icon */}
          <div className="pt-8 pb-6 px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img src="/img/ico_dash.png" alt="Logo" className="h-8 w-auto" />
                <h1 className="text-2xl font-bold text-gray-900">SIGN UP</h1>
              </div>
              {/* User Plus Icon with Gradient */}
              <div className="relative">
                <svg 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="userPlusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14ZM19 10V7H17V10H14V12H17V15H19V12H22V10H19Z" 
                    fill="url(#userPlusGradient)"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500">Register untuk Admin/Reseller</p>
          </div>

          {/* Form */}
          <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Full Name"
              />
            </div>

            {/* Email Input */}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Email Address"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Password (min. 6 characters)"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                placeholder="Confirm Password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md text-white font-medium bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Link to Login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/" 
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
